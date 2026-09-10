# Shape — the deployment package

Written 2026-09-10 for `PLAN.md` step 8e-2, per `AGENTS.md` R1. Input: the 8e-1 dry
run recorded in `PLAN.md` step 8e — three blockers and sixteen gaps.

**Approved 2026-09-10**, with the five open questions decided below. One of the ten
decisions handed in is revised (§Decision 1 revised); the rest are designed as given.

## Goal

On a fresh VPS with Docker and a filled `.env`, `docker compose -f
docker-compose.prod.yml up -d` serves the API and the back office over HTTPS on two
hostnames, backs itself up nightly at 03:00 Chișinău, and can be restored from those
backups — database and patient files both.

## What the code actually looks like now

Four things found while reading. The first one changes a decision.

1. **There is no supported webpack knob that bundles one external.**
   `NxAppWebpackPlugin` with the default `externalDependencies: 'all'` calls
   `nodeExternals({ modulesDir, allowlist: nonBuildableWorkspaceLibs })`
   (`node_modules/@nx/webpack/src/plugins/nx-webpack-plugin/lib/apply-base-config.js:329`).
   The allowlist holds **non-buildable** workspace libs only. `packages/shared` has an
   inferred `build` target, so it is never on it. The one other branch,
   `externalDependencies: [...]`, inverts the meaning — everything *not* listed gets
   bundled, which would pull `@nestjs/core`, `argon2`, `sharp` and `@prisma/client`
   into the bundle: native addons and reflection-driven DI. `mergeExternals` is
   additive and cannot un-externalize. Dropping the `build` target from
   `packages/shared` would put it on the allowlist, and would break the project
   reference in `apps/api/tsconfig.app.json:29` and CI's "Build shared types".
2. **`nx prune api` already exists and is exactly this tool** — targets `prune`,
   `prune-lockfile`, `copy-workspace-modules`. Run today it emits
   `apps/api/dist/package.json` listing **two** dependencies (`otplib`, `qrcode`) and
   an **empty** `workspace_modules/`. Both are correct outputs of a wrong input: the
   API's real dependencies are pooled in the root manifest (`STACK.md`, "Dependencies
   are pooled at the root"), and `apps/api` does not declare `@olesia/shared`.
3. **`WorkingHours.isPlaceholder` already exists**, defaults to `true`, and the back
   office already says so loudly. The prod seed does not need a new flag, only a row.
4. **`apps/api/prisma/seed.ts` is typechecked by nothing.** `tsconfig.app.json`
   includes `src/**/*.ts` only. 470 lines of seed, plus 722 in its four content files,
   never see `tsc` in CI.

## Decision 1 revised

Handed in: bundle `@olesia/shared` into `main.js`, do not copy `packages/` into the
runtime image.

Proposed instead: **`nx prune api`**, and give `apps/api/package.json` its own
`dependencies`. The runtime stage then copies `apps/api/dist/` — bundle, pruned
manifest, pruned lockfile and `workspace_modules/shared` — and runs
`pnpm install --prod --frozen-lockfile`. `packages/` still never reaches the image,
which is what decision 1 was protecting; the dangling symlink disappears because
`@olesia/shared` becomes a real `file:` dependency; and the same change is what makes
decision 6 (no dev `node_modules`) reachable at all. It also closes the ownership
ambiguity `STACK.md` records as a known wart.

Cost: ~22 dependency lines move from the root manifest to `apps/api`, and the lockfile
is regenerated. That is the one part of this package that touches all three apps.

## Approach

Five independent pieces, in the order they can be verified:

1. **Image.** `nx prune` output as the runtime payload, `USER node`, no dev
   `node_modules`. Migrations keep running from `CMD` at start.
2. **Compose.** `name: olesia-prod`, Caddy is the only thing publishing ports, `api`
   publishes none, a `restore` service behind `profiles: [restore]` with the upload
   volumes read-write while `backup` keeps them `:ro`, logging caps and `start_period`
   everywhere, backup on a fixed 03:00 Europe/Chișinău clock.
3. **Caddy.** One image that builds the back office and serves it; two hostnames from
   env; ACME when `ACME_EMAIL` is set, `tls internal` when it is not (that branch is
   what the 8e-3 acceptance runs against).
4. **Seed.** One file, two profiles, compiled into the image as a second webpack entry
   so it runs as `node seed.js` with no `tsx`. A runbook step, never automatic.
5. **Docs.** `.env.prod.example` at the root, `docs/deployment.md` rewritten around
   the new stack with the day-of-deploy runbook as its own section.

## Files

**Dependency split (enables everything else)**

- `apps/api/package.json` — add the API's runtime dependencies and
  `"@olesia/shared": "workspace:*"`. +25
- `package.json` — remove the API-only entries from the pooled list; anything the site
  or the back office also imports stays. −20
- `pnpm-lock.yaml` — regenerated.

**Image**

- `docker/Dockerfile.api` — builder gains `pnpm nx prune api`; runtime stage copies
  `apps/api/dist` (bundle + manifest + lockfile + `workspace_modules`), `prisma/`,
  `src/generated/`, runs `pnpm install --prod --frozen-lockfile`, drops to `USER node`,
  and `chown`s the two upload dirs. ~50 (was 39)
- `docker/Dockerfile.caddy` — new. Builder: `pnpm nx build back-office`. Runtime:
  `caddy:2-alpine`, `COPY --from=builder apps/back-office/dist /srv/admin`. ~30
- `docker/Caddyfile` — new. `{$CADDY_API_HOST}` → `reverse_proxy api:3333`;
  `{$CADDY_ADMIN_HOST}` → `handle /api/* reverse_proxy api:3333` plus `file_server`
  with `try_files {path} /index.html`; global `email {$ACME_EMAIL}`. ~40
- `docker/Dockerfile.backup` — new. `postgres:16-alpine` plus `apk add rclone
  tzdata`. `postgres:16-alpine` ships neither. ~12

**Compose**

- `docker-compose.prod.yml` — `name: olesia-prod`; `caddy` service (80, 443,
  `caddy_data` and `caddy_config` volumes); `api` loses `ports:`, gains `MAIB_BASE_URL`,
  `MAIB_CLIENT_ID`, `MAIB_CLIENT_SECRET`, `MAIB_SIGNATURE_KEY`, `RECAPTCHA_MIN_SCORE`
  (all empty-defaulted) and `start_period: 40s`; `backup` builds from
  `Dockerfile.backup`, keeps `:ro`, sleeps to the next 03:00 in `TZ=Europe/Chisinau`
  instead of `sleep 86400`; new `restore` service, `profiles: [restore]`,
  `entrypoint: ["/bin/sh","-c","sleep infinity"]`, upload volumes read-write; `logging`
  with `max-size: 10m`, `max-file: 3` on all five. +80 / −18

**Seed**

- `apps/api/src/seed/seed.ts` — moved from `apps/api/prisma/seed.ts`, gains the profile
  switch. Prod: refuse to start without `ADMIN_EMAIL` and `ADMIN_PASSWORD`, admin with
  `mustChangePassword: true`, services, contacts, three `MediaAppearance`, two
  `Testimonial`, one `WorkingHours` row Mon–Fri 09:00–17:00 with `isPlaceholder: true`.
  Nothing from about, FAQ or materials. Dev: today's behaviour, and the default.
  ~500 (was 470)
- `apps/api/src/seed/profile.ts` — new. `resolveSeedProfile(env)`: the parse, the
  default, and the two prod guards. The only pure logic in this package. ~30
- `apps/api/src/seed/profile.spec.ts` — new. ~50
- `apps/api/src/seed/{seed-faq,seed-materials,seed-media,seed-testimonials}.ts` — moved
  from `prisma/`, unchanged. Moving them under `src/` puts 1192 lines of seed under
  `tsc` for the first time.
- `apps/api/webpack.config.js` — `additionalEntryPoints: [{ entryName: 'seed',
  entryPath: './src/seed/seed.ts' }]`. +6
- `apps/api/prisma.config.ts` — `migrations.seed: 'node ../dist/seed.js'`. +3

**Scripts**

- `docker/backup.sh` — optional `rclone sync "$BACKUP_DIR" "$RCLONE_REMOTE"` when
  `RCLONE_REMOTE` is set; one log line when it is not. +20
- `docker/restore.sh` — the "archive stores absolute paths" comment is wrong; the
  archive stores `app/uploads/…` relative and `-C /` happens to land right. Say that.
  Add a line naming the `restore` profile as the only container it works from. +6 / −3

**API**

- `apps/api/src/app/payments/maib.service.ts` — one constructor warning when
  `isConfigured()` is false, worded like `MailService`'s. +4

**Docs**

- `.env.prod.example` — new, root. Every compose and API variable, one comment each,
  `openssl rand -base64 36` next to the two secrets, `COOKIE_SECURE=true`. No
  `NODE_ENV`: the image sets it. ~70
- `docs/deployment.md` — rewritten around Caddy, the two hostnames, the prune-based
  image and the `restore` profile. Records that the 2026-08-04 restore drill was
  against the **dev** Postgres and that 8e-1 proved the prod stack could not restore
  files at all; that `/api/docs` is deliberately 404 under `NODE_ENV=production`; and
  the day-of-deploy runbook as its own section, from the `PLAN.md` 8e checklist. ~270
  (was 195)

## Deleted

- `apps/api/prisma/seed.ts` and its four content files — moved, not copied.
- The `while true; sleep 86400` command block on the `backup` service.
- `ports:` on the `api` service.
- The dev `node_modules` layer in the runtime image (that is the 2.38 GB).

## Schema / API changes

None. No migration. `WorkingHours.isPlaceholder` already exists; the prod seed writes a
row, it does not change the model. The only API-surface change is that `api` stops
listening on a published port — everything reaches it through Caddy.

## Test plan

**Unit (Jest, `apps/api/src/seed/profile.spec.ts`), seam: the exported
`resolveSeedProfile(env)`.** The only branch here worth pinning, and it guards a
production password:

- unset `SEED_PROFILE` resolves to `dev`
- `SEED_PROFILE=prod` with both admin variables resolves to `prod`
- `SEED_PROFILE=prod` without `ADMIN_PASSWORD` throws, and the message names the
  variable
- `SEED_PROFILE=prod` without `ADMIN_EMAIL` throws
- `SEED_PROFILE=prod` with a blank `ADMIN_PASSWORD` throws (blank is not "set")
- an unknown value throws rather than falling back to `dev`

Six cases, no database, no Nest module — `business-hours.spec.ts` shape.

**Everything else is the 8e-3 acceptance scenario.** Compose files, a Caddyfile and a
Dockerfile have no logic to unit-test; what proves them is a full run on a clean
project, which is 8e-3's job:

1. `docker compose -f docker-compose.prod.yml up -d --build` on a clean project name
2. `curl -k https://localhost/health` through Caddy with `tls internal`
3. `docker compose run --rm api node seed.js` with `SEED_PROFILE=prod` — and the same
   command without `ADMIN_PASSWORD` refuses
4. the back office opens at `https://localhost`, logs in as the seeded admin, and is
   sent to the password-change screen by `mustChangePassword`
5. deep-link reload (`https://localhost/servicii`) serves the SPA, not a 404
6. `backup.sh`, then delete a service row **and** an uploaded file, then `restore.sh`
   through the `restore` profile — both come back
7. `docker image inspect` on the API image reports under 600 MB
8. `docker compose logs api` shows the maib warning and no MAIB values

## Tradeoffs / alternatives considered

- **Bundle `@olesia/shared` via webpack externals** (the handed-in decision 1).
  Rejected on the reading in §1 above: Nx offers no "bundle just this one" setting, and
  both workarounds — an explicit externals array, or making `packages/shared`
  non-buildable — trade a dangling symlink for a broken native module or a broken
  project reference.
- **Copy `packages/shared/dist` into the runtime image.** Two lines, fixes the crash
  loop today, no dependency surgery. Rejected: it leaves the 2.38 GB dev
  `node_modules` in place, so decision 6 and the 600 MB target stay out of reach, and
  it keeps the root-pooled dependency ambiguity.
- **nginx + certbot instead of Caddy.** Rejected: a renewal timer, a reload hook and a
  challenge webroot to get wrong, for a single VPS. Caddy does ACME in-process and
  needs neither.
- **Serve the back office from Nest's static middleware.** One less image, one less
  hostname. Rejected: it ties every admin-UI release to an API image rebuild and puts a
  static file server inside the process that holds patient data.
- **Host cron for backups instead of a container loop.** Rejected: the package has to
  come up with one command on a machine that has nothing but Docker.

## Open questions, decided 2026-09-10

1. **Decision 1 swap — approved.** `nx prune` plus the dependency split replaces the
   externals change.
2. **Scope of the dependency split — API-only packages move.** Anything the site or the
   back office also imports stays pooled in the root manifest. Splitting all three apps
   is a separate piece of work.
3. **600 MB is a target, not a gate.** Stay on `node:22-slim`; alpine is off the table.
   The hard criteria are the two that can be asserted: no dev `node_modules` in the
   runtime image, and the process does not run as root. The size gets recorded either
   way.
4. **Off-site target — deferred with the hosting decision.** `RCLONE_REMOTE` unset skips
   the step; the choice between a Hetzner Storage Box and EU Object Storage lands in the
   runbook later.
5. **Hostnames — `api.oleseajalba.md` and `admin.oleseajalba.md`.** The apex and `www`
   stay on Vercel. The runbook's DNS section is written against those three names.
