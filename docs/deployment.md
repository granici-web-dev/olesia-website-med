# Production deployment — Caddy + API + Postgres + backups

Status: **prepared, not deployed.** The host is not chosen yet, so nothing below
has run against a real server. Everything is host-agnostic and was exercised
locally; what is untested is called out as such.

Rewritten 2026-09-10 after the dry run recorded in `PLAN.md` step 8e found that
the previous stack could not start at all. What changed: the API image is built
from `nx prune` output and runs unprivileged, Caddy terminates TLS and serves
the back office, the seed has a production profile, and restoring files has a
service that can actually write to the upload volumes.

The public site is on Vercel. This document is about the other half: the NestJS
API, the back office, and the database.

---

## Before anything else: who owns the account

**The hosting account goes in the client's name.** She is the data controller —
the medical documents patients upload (§11.14) are hers to answer for, and an
account in an agency's name makes that relationship wrong on paper and awkward
in practice. Set it up with her card, add us as a collaborator.

This also decides the region: **the server must be in the EU.** Special-category
health data, and `/gdpr` already tells visitors it stays in the EU.

---

## What runs

```
cp .env.prod.example .env    # then fill it in
docker compose -f docker-compose.prod.yml up -d
```

| Service    | What it is                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `caddy`    | TLS on two hostnames, and the back office as static files. The only service that publishes a port |
| `postgres` | Postgres 16, reachable on the compose network and nowhere else                                    |
| `migrate`  | applies pending migrations once and exits; everything else waits for it to succeed                |
| `api`      | NestJS, `3333` on the compose network, no published port                                          |
| `backup`   | `pg_dump` + a tar of the uploaded files at 03:00 Chișinău, 14-day rotation                        |
| `restore`  | idle unless started by name; the only service that can write to the upload volumes                |

The compose project is named `olesia-prod`. That is not cosmetic: without it,
Compose derives the project from the directory, which both compose files share,
and the production stack would adopt the development Postgres and its data
volume — where `down -v` would delete it.

Migrations are the `migrate` service's job (audit A11, M10). It is built from
the same Dockerfile as the API, at its `migrate` target, runs
`prisma migrate deploy` and exits; the API declares
`depends_on: migrate: service_completed_successfully`, so a failed migration
means the server does not start rather than serving against a half-applied
schema. A deploy therefore still applies migrations by itself. **The seed does
not**; it is a runbook step below.

They used to run in the API's own `CMD`. What that cost was not only the order:
the Prisma CLI had to live in the long-lived image, so a container serving
patient data carried a tool that can rewrite the schema. ⚠ Note that moving it
out did **not** shrink the image — see "Still open" at the end.

### Two hostnames, one origin for the back office

`CADDY_API_HOST` serves the API. `CADDY_ADMIN_HOST` serves the back office and
proxies `/api/*` and `/health` to the same API, so the panel and its API share
scheme, host and port.

That is a requirement, not a convenience. The refresh token is an `httpOnly`
cookie with `SameSite=Lax`, scoped to `/api/auth`. `Lax` is what stops another
site from silently spending that cookie: the browser withholds it from
cross-site background requests, so a hostile page cannot mint a fresh access
token in the victim's name. Split the two across origins and the panel's own
`fetch` becomes cross-site too — at which point the cookie either stops being
sent at all (the panel cannot stay logged in) or has to be loosened to
`SameSite=None`, which hands the CSRF protection back. There is no CSRF token
behind it to take over: `Lax` plus one origin _is_ the defence.

`CORS_ORIGINS` still lists the admin host, because the browser sends an `Origin`
header on same-site requests too. It is not a substitute for the shared origin.

### The API image

The runtime stage installs from `nx prune api` output — a manifest and lockfile
holding only what the bundle requires, plus `@olesia/shared` copied in as a real
package under `workspace_modules/`. The workspace `node_modules` and the
`packages/` directory never reach the image, and the process runs as `node`,
not root.

Two things in `apps/api/package.json` exist for that install and look redundant
in the workspace:

- `packageManager` — without it corepack downloads whatever pnpm is newest at
  build time instead of the pinned 9.15.9.
- `pnpm.overrides` — pnpm warns that it has no effect in a workspace member,
  and that is true; it takes effect in the single-package install inside the
  image, where without it `--frozen-lockfile` rejects the pruned lockfile. It is
  also what keeps `multer` pinned to 2.3.0 in production.

`/api/docs` is **404 in production, deliberately**: Swagger is mounted only when
`NODE_ENV !== 'production'`, and the image sets `NODE_ENV=production`. It is not
a broken deploy.

---

## Environment

`.env.prod.example` in the repository root is the template, one comment per
variable, with the generation command next to each secret. `${VAR:?…}` in the
compose file means the stack **refuses to start** rather than booting with
`olesia/olesia`.

Required with no default: `CADDY_API_HOST`, `CADDY_ADMIN_HOST`,
`POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`, `CORS_ORIGINS`,
`PUBLIC_API_URL`, `PUBLIC_SITE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.

Worth naming because they change behaviour rather than where things point:

| Variable                                   | Notes                                                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACME_EMAIL`                               | **required** — the stack refuses to start without it. An address asks Let's Encrypt; the literal `internal` makes Caddy issue its own, which is right on a laptop and never on the server |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | at least 32 characters, random, different from each other — the API exits at boot otherwise                                                                                               |
| `LEADS_NOTIFY_EMAIL`                       | **required in production** — the API exits at boot without it. No default: it used to fall back to a developer's Gmail                                                                    |
| `RECAPTCHA_SECRET`                         | **required in production** — the API exits at boot without it. Empty disables captcha verification entirely                                                                               |
| `PRIVATE_UPLOADS_DIR`                      | **required in production** — the API exits at boot without it. Defaults to the working directory, which is ephemeral                                                                      |
| `PUBLIC_API_URL`                           | **required in production** — the API exits at boot without it                                                                                                                             |
| `COOKIE_SECURE`                            | defaults to `true`. Caddy terminates TLS in front, so it stays true                                                                                                                       |
| `PUBLIC_SITE_URL`                          | the **site's** origin, not the API's: it builds the patient upload link                                                                                                                   |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`           | read by the seed, not the API. `SEED_PROFILE=prod` refuses to run without them                                                                                                            |
| `BACKUP_HOUR` / `BACKUP_TZ`                | the nightly run, default 03:00 Europe/Chișinău                                                                                                                                            |
| `RCLONE_REMOTE`                            | empty skips the off-site copy and says so in the log                                                                                                                                      |

**Seven variables are checked at boot when `NODE_ENV=production`** and the API
exits rather than start without them: `LEADS_NOTIFY_EMAIL`,
`RECAPTCHA_SECRET`, `PRIVATE_UPLOADS_DIR`, `PUBLIC_API_URL`,
`PUBLIC_SITE_URL`, and — since audit A11 — `CORS_ORIGINS` and `UPLOADS_DIR`.
The last two fall back to `localhost` and to the container's working directory
respectively: a deployment that forgot them answers the real back office with a
CORS error, and writes every uploaded photograph somewhere the next deploy
erases. Each used to fall back to something that looked like it
worked — a personal mailbox, a disabled captcha, a directory that empties on
the next deploy — and every one of those failures is silent. This mirrors the
JWT check that has been there since the secrets were found committed.

**`RECAPTCHA_SECRET` on the API and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` on Vercel
are set together or not at all.** Either alone breaks every public form in a way
nothing reports: with only the secret, the site mints no token and the guard
answers 403 to the contact form, the EXPRESS question, the deliverable order and
the newsletter signup; with only the site key, Google is contacted on every
submit and nothing verifies the result (audit A6, F4). Both blank is a supported
state — the honeypot and the rate limit still work.

Optional but wanted before launch: `CALENDLY_*` (booking is dead without them)
and `SMTP_*`. Without SMTP nothing is emailed at all — not the practice, not
the patient. Leads are still saved; the back office says the mail did not go,
and the EXPRESS answer offers a copy button instead of claiming it was sent.

Payments — **all four blank means online payment is switched off**, which is the
correct state until the acquirer contract exists, and the API logs one line at
startup saying so. `MaibService.isConfigured()` tests the first three and the
module simply does not offer a checkout without them; a partially filled set is
the dangerous shape, so fill them together or not at all:

| Variable                                | Notes                                                                                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAIB_BASE_URL`                         | sandbox or production; the two are different hosts                                                                                                                                     |
| `MAIB_CLIENT_ID` / `MAIB_CLIENT_SECRET` | project credentials from the bank                                                                                                                                                      |
| `MAIB_SIGNATURE_KEY`                    | verifies the back-channel callback. **Missing means every callback is rejected and logged** — deliberately: an unverified callback moves money in our records on someone else's say-so |

The callback also needs the API reachable from the internet over HTTPS at
`PUBLIC_API_URL`. Until that exists the signature path stays unproven — see
`docs/payments-maib-checkout.md`.

`PAYMENT_CURRENCY` is a testing affordance and nothing else. The catalog quotes
EUR, production charges EUR, and setting this variable in production is ignored
with a warning. It exists so the end-to-end run against the sandbox can go
through in MDL while the merchant profile still refuses EUR
(`docs/shape-express-checkout.md`, decision 5).

**The registered entity** — `LEGAL_ENTITY_NAME`, `LEGAL_ENTITY_IDNO`,
`LEGAL_ENTITY_ADDRESS` — is named on `/gdpr`, on `/terms` and on the payment
confirmation email the bank's go-live checklist requires. All three come from
here so the three surfaces cannot disagree, and the site's own copy of them was
deleted with this step. They are deliberately **not** in the boot check: the
client's incorporation does not exist yet, and the rest of the site is not
blocked on it. While they are empty the legal pages render their draft banner
and `POST /leads/quick-question/checkout` answers `503 legal_entity_missing`.
Nothing else changes.

`MEDICAL_UPLOAD_RETENTION_DAYS` defaults to 180 — **a placeholder**, pending the
client's and her lawyer's answer on how long medical files may be kept.

---

## Seeding

The seed is a runbook step, run once, by a person holding the administrator
password. It never runs at container start.

```
set -a; . ./.env; set +a
docker compose -f docker-compose.prod.yml run --rm \
  -e SEED_PROFILE=prod -e ADMIN_EMAIL -e ADMIN_PASSWORD api node seed.js
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are forwarded from the shell rather than
listed on the `api` service, so the administrator password does not sit in the
long-lived container's environment for anyone with `docker inspect` to read.
The `-e NAME` form with no value passes the value through without putting it in
shell history.

`SEED_PROFILE=prod` writes only what a practice cannot open without: the
administrator (flagged `mustChangePassword`, so the first login goes straight to
a password change), the seven services, the contact channels, the two real
parent reviews, the three real media appearances, and a provisional Mon–Fri
09:00–17:00 schedule marked `isPlaceholder` so the back office keeps saying it
is not confirmed.

It writes **no** About page, **no** FAQ and **no** library materials. That copy
is drafted, not client-approved, and a production database is not the place to
find that out. `SEED_PROFILE` unset means `dev`, which does seed all of it.

Without `ADMIN_EMAIL` and `ADMIN_PASSWORD` the production profile exits 1 and
names the missing variable. It will not invent a password.

---

## Backups

`docker/backup.sh` runs at `BACKUP_HOUR` in `BACKUP_TZ` and writes to the
`backups` volume:

- `db-<stamp>.sql.gz` — schema-scoped `pg_dump`
- `files-<stamp>.tar.gz` — `private-uploads/` and `uploads/`
- `last-run.json` — `{ at, ok, dbBytes, filesBytes, error }`, rewritten every
  run, success or failure

Both archives, deliberately: a dump alone restores appointments that reference
analyses nobody can open any more. Rotation keeps `BACKUP_KEEP_DAYS` days.

**What makes a dump count as finished.** Files are written under a `.part` name
and renamed on success — but until audit A11 that said less than it looked.
`pg_dump | gzip` reported gzip's exit status, so a dump that died on the third
table was compressed, renamed, and announced as `backup ok`, and fourteen days
later rotation deleted the last real one. The script now sets `pipefail` and,
because that option does not exist in every shell, reads the dump back and
checks for `PostgreSQL database dump complete` — the line `pg_dump` writes last
— before the rename. A truncated dump is deleted and the run exits 1.

**And how anybody finds out.** `last-run.json` is what `/health` reads (below).
Before it, a failed backup was a line in a container log under a 10 MB rotation
that nobody was reading.

The container sleeps until the next `BACKUP_HOUR` rather than for a fixed 24
hours, so a reboot does not move the backup to whatever time the server came
back up.

**A note on `PGPASSWORD`.** The `backup` and `restore` services carry the
database password in their environment, which anyone with `docker inspect` on
this host can read. That is deliberate and it is the same trust boundary as the
`postgres` service, which carries `POSTGRES_PASSWORD` for the same reason — a
person with Docker access on this machine can read the database directly
anyway. It is worth knowing before somebody is given a shell here "just to
check the logs": on this host, shell access is database access. The
administrator password is the one thing kept out of a long-lived environment,
and the seed step below says how.

**Off-site**: set `RCLONE_REMOTE` and the script syncs the whole backup
directory after each run; leave it empty and it logs `off-site sync skipped`.
A backup on the same disk as the database survives a bad migration, not a dead
server or a closed account. The destination must be in the EU — a Hetzner
Storage Box or EU Object Storage, chosen with the host.

### Restoring

Restoring the **files** needs write access to the upload volumes, which the
`backup` service deliberately does not have. Use the `restore` service:

```
docker compose -f docker-compose.prod.yml --profile restore up -d restore
docker compose -f docker-compose.prod.yml exec restore \
  sh /usr/local/bin/restore.sh /backups/db-<stamp>.sql.gz /backups/files-<stamp>.tar.gz
docker compose -f docker-compose.prod.yml --profile restore down
```

The script drops and recreates the `public` schema. Point `PGDATABASE` at a
scratch database for a drill; only aim it at production during a real recovery.

**It checks the archive before it destroys anything** (audit A11, L14):
`gzip -t` on both files, and the same completion trailer the backup checks. It
used to drop the schema first and apply whatever the dump contained, so a
truncated dump took out a working database and printed `restore ok` over the
half of it that came back. Refusing, and telling you to reach for an older
backup, is the useful answer. Afterwards it prints a row count per table — no
number it could assert is right, but zero users is wrong after any restore at
all.

**Drill history — read the dates, they are not interchangeable:**

- **2026-08-04, dev Postgres.** Dropped the `Service` table and deleted an
  uploaded file; both came back. This was the _development_ database, not this
  stack, and it was later taken as evidence the production stack could restore.
  It was not.
- **2026-09-10, dry run of the old stack.** Database restore worked. **File
  restore failed**: the upload volumes were mounted read-only into the only
  container the scripts lived in, and `tar` exited with `Read-only file system`.
  The `restore` service above is the fix.
- **2026-09-10, this stack.** Database and files both restored through the
  `restore` profile, on a local acceptance run.
- **2026-09-11, this stack, current schema.** Repeated after audit A11 because
  the schema had moved on eight migrations and the scripts had changed. Local
  run on `internal` certificates, seeded with `SEED_PROFILE=prod`: **40
  migrations, 30 tables**, restored into a scratch `olesia_drill` — 7 services,
  2 testimonials, 3 media appearances, 1 administrator, all back. A file
  deleted from `private-uploads` after the backup came back through the
  `restore` service and was readable from the API container. The refusal path
  was checked with the same run: a deliberately truncated dump is rejected
  before the schema is dropped, and the live database was untouched.
- **Against production: never.** Do it after the first deploy and after any
  Postgres major upgrade, and record the date here.

---

## Observability

Three things, none of which existed before audit A11 (H2, H3, H5): the health
endpoint says something true, errors reach somebody, and something outside this
server watches it.

### `/health`

```json
{
  "status": "ok",
  "checks": { "db": "pass", "storage": "pass", "backup": "pass" }
}
```

It answers **503** when any check fails, and each check is pass or fail and
nothing more — the route is public, and which dependency is down is a useful
thing for a stranger to learn.

| Check     | What it does                                                                             |
| --------- | ---------------------------------------------------------------------------------------- |
| `db`      | `SELECT 1` through Prisma                                                                |
| `storage` | writes a byte into `PRIVATE_UPLOADS_DIR` and removes it                                  |
| `backup`  | reads `/backups/last-run.json`: fail if the last run said `ok: false` or is over 26h old |

It used to be `return { status: 'ok' }`, so a container whose Postgres had died
reported itself healthy, and Docker's healthcheck agreed.

Two deliberate details:

- **A missing `last-run.json` is a pass.** The first deployment has no backup
  until step 11 below takes one by hand, and an endpoint that answers 503 from
  the first `up` until 03:00 the next morning is one nobody believes. From the
  first run on, the file exists and its age is watched.
- **The container healthcheck gates on `db` and `storage` only**, not on the
  endpoint's own verdict. Caddy waits for the API to be healthy, and a backup
  that failed last night must not be what keeps the site down after a reboot.
  The stale backup is the uptime monitor's business, below.

The `backups` volume is mounted into the API **read-only**, and `last-run.json`
is the only file it opens there.

### Error tracking — Sentry, behind `SENTRY_DSN`

All three applications report: the API (`@sentry/nestjs`), the site
(`@sentry/nextjs`) and the back office (`@sentry/react`). **Empty DSN means the
SDK is never initialised** — no client, no transport, not one request — which
is the state this ships in until the account exists.

What to set up, when there is an account:

1. A project in the **EU region** (`sentry.io` offers one). These reports carry
   URLs and identifiers from a system whose data stays in the EU.
2. `SENTRY_DSN` in `.env` for the API and the back office — one project for the
   half of the system that runs on this server. ⚠ The panel compiles its DSN
   into the bundle, so this needs `up -d --build`, not a restart.
3. `NEXT_PUBLIC_SENTRY_DSN` on Vercel for the site, plus `SENTRY_ORG`,
   `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` if you want readable stack traces:
   with the token the build uploads source maps and then deletes them, so they
   are readable in Sentry and not from the site.
4. `SENTRY_RELEASE=$(git rev-parse --short HEAD)` at deploy time, so a trace
   names a version.

**What is filtered before anything is sent** (`packages/shared/src/lib/sentry-scrub.ts`,
under test): the request body, the query string, cookies, the `Authorization`
and `Cookie` headers, and the segment after `/incarcare/`, `/uploads/` and
`/download/` in any URL — that first one is a patient's whole credential for
their upload link. `sendDefaultPii` is off, so no IP address either. A report is
a log that leaves the building, and this system's request bodies are medical.

4xx responses are not reported: they are the API doing its job, and forwarding
them would spend the free tier's quota on the request log. 5xx and anything
thrown that was never meant as an HTTP answer are.

### Uptime — **a required step on deploy day**

Nothing outside this server watches it. Four production deployments of the
site have failed and been noticed by eye (audit A11, H5); a server that stops
answering at 02:00 on a Sunday has nothing at all to notice it.

Set up an external check, from whichever service you like (UptimeRobot,
Better Stack and Hetzner's own all have a free tier big enough for two checks):

| URL                           | Expect                                       |
| ----------------------------- | -------------------------------------------- |
| `https://api.<domain>/health` | 200, and the body containing `"status":"ok"` |
| `https://admin.<domain>/`     | 200                                          |

Five-minute interval, alerts to an address somebody reads. The first URL is
what turns a failed backup, a dead database and a full disk into a message;
the second is what notices that TLS or Caddy itself has gone.

---

## Runbook — the day the server exists

Top to bottom, no step from memory.

**1. Host.** Create the account **in the client's name**, EU region. Add us as a
collaborator. Install Docker and Compose.

**2. DNS**, before the first `up` — Caddy asks for certificates on start and a
name that does not resolve fails:

| Name                       | Points at                 |
| -------------------------- | ------------------------- |
| `api.oleseajalba.md`       | A record, the server's IP |
| `admin.oleseajalba.md`     | A record, the server's IP |
| `oleseajalba.md` and `www` | Vercel, unchanged         |

⚠ **Both names have to resolve before the first `up`, and `ACME_EMAIL` has to
be an address.** Caddy asks Let's Encrypt for a certificate the moment it
starts, and the HTTP-01 challenge answers on the name itself: a domain that is
not delegated yet fails the challenge, and Caddy then retries with a backoff
rather than serving. If the domain is still with the old registrar on the day,
either finish the delegation first or accept that the stack cannot be brought
up publicly yet — a local run with `ACME_EMAIL=internal` proves the images and
nothing about TLS.

**3. Environment.** `cp .env.prod.example .env`, then fill every blank.
Generate the secrets with the commands written next to them; `JWT_ACCESS_SECRET`
and `JWT_REFRESH_SECRET` must differ.

**4. Start.** `docker compose -f docker-compose.prod.yml up -d --build`. The
order is fixed by the compose file: Postgres becomes healthy, `migrate` applies
the migrations and exits, the API starts, Caddy starts behind it. Watch
`docker compose -f docker-compose.prod.yml logs -f migrate api`. Confirm
`https://api.oleseajalba.md/health` answers 200 with three `pass`.

**5. Seed**, then log in at `https://admin.oleseajalba.md` and change the
administrator password when prompted. Enrol the second factor in the same
session.

**6. Vercel.** Set `API_URL` and `NEXT_PUBLIC_API_URL` to
`https://api.oleseajalba.md`, plus `NEXT_PUBLIC_SITE_URL` and the analytics and
reCAPTCHA variables. Redeploy, then confirm `/pricing` shows prices from the API
rather than the notice.

⚠️ **A changed `API_URL` needs a rebuild, not a restart** (audit A7, F10).
`next.config.ts` derives `images.remotePatterns` from it at _build_ time, so the
allowed image host is compiled into the bundle. Change the variable without
redeploying and every photo the client uploaded answers 400 from the image
optimizer while the rest of the page renders normally — which is the hardest
kind of breakage to attribute. Redeploy after any change to it.

📌 **If the API is unreachable while the site builds, the pages are built
empty** — the build does not fail. `next build` prerenders every route, and an
outage used to throw out of `lib/api.ts` and abort the whole deployment, so
nothing shipped, not even the pages that read no content. From this release a
network error or a 5xx during `phase-production-build` is rendered as "the
client has not filled this in", with one line per route in the build log. The
first request after the API is answering again revalidates the page within a
minute, so a site built against a dead API repairs itself without a redeploy.
This is build time only: an outage seen by a live visitor is still an error
page, not an empty one.

⚠️ `NEXT_PUBLIC_SITE_URL`, `API_URL` and `NEXT_PUBLIC_API_URL` are all
**required** from this release on: the production build fails rather than
shipping a `robots.txt`, a sitemap and canonical links pointing at `localhost`
(audit A7, F6), or a site that reads no content and forms that post to the
visitor's own machine. `NEXT_PUBLIC_SITE_URL` may be omitted on Vercel, which
sets `VERCEL_PROJECT_PRODUCTION_URL` itself.

📌 **Pictures inside article and About text stay plain `<img>` until this step
is done** (audit A7, F13). `next/image` only accepts hosts listed in
`next.config.ts`, and until the API has a stable public host an optimized image
there would render nothing at all. Once `api.oleseajalba.md` is live and step 6
has been done once, `lib/markdown.tsx` and `app/[locale]/articles/[slug]` can
move to `next/image`.

**7. Calendly.** Point the webhook at `https://api.oleseajalba.md`. Recreate the
subscription rather than editing it, and check the signing key matches
`CALENDLY_WEBHOOK_SIGNING_KEY`.

**8. maib.** Register the callback and return URLs in the bank's portal, add the
server's IP to their allow list, fill the four `MAIB_*` variables and restart the
API. The startup warning should be gone. The first real callback is the first
end-to-end evidence that path works.

**9. Working hours.** Have the client confirm her schedule in the back office —
saving it is what clears `isPlaceholder`.

**10. Prices.** If the database did not come from the new seed, run the
`UPDATE` for `quick_question.priceLabel*` recorded in `PLAN.md` step 8.

**11. Backups.** Run `backup.sh` once by hand and confirm three things, not
one: both archives are there, `last-run.json` says `ok: true`, and
`gzip -dc db-<stamp>.sql.gz | tail -3` ends with
`-- PostgreSQL database dump complete`. That last line is what separates a
backup from a file (audit A11, H1). Then do the restore drill against a scratch
database, read the row counts it prints, and write the date into the drill
history above. Decide the off-site destination and set `RCLONE_REMOTE`.

**12. Uptime.** Register the two external checks from "Observability" above and
send a test alert to the address that will receive them. This is not optional
and it is not a later task: until it exists, an outage at 02:00 on a Sunday is
noticed by whoever tries to book an appointment.

**13. ClamAV.** Decide whether malware scanning goes in now or is accepted as a
known gap in writing.

---

## Losing the second factor as the only administrator

Two-factor authentication is per account, and an admin can clear it for someone
else (`POST /api/users/:id/2fa/reset`, admin only, never on oneself). With a
single admin account there is nobody to ask, so the way back in is the database.

The recovery codes come first: eight of them are shown once at enrolment and any
unused one works in the code field at login. Only when those are gone too:

```sql
-- Clears the second factor for one account. The password is unchanged, so the
-- next login is email + password alone, and enrolment starts again from the
-- Securitate page.
UPDATE "User"
SET "totpSecret" = NULL,
    "totpEnabled" = false,
    "totpEnabledAt" = NULL,
    "totpRecoveryCodes" = '{}',
    "totpFailedCount" = 0,
    "totpLockedUntil" = NULL
WHERE email = 'the.address@example.com';
```

Run it through the compose stack, against the running database:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

The same statement without the `totpSecret` line, keeping only
`"totpFailedCount" = 0, "totpLockedUntil" = NULL`, lifts the lock that five
wrong codes in a row put on an account. That lock doubles from one minute to a
ceiling of fifteen and clears itself; it is worth waiting rather than reaching
for SQL.

Whoever runs this can read every patient record in the same session, so it is a
last resort, not a support procedure. Note the date and the reason somewhere the
client can see it.

---

## Still open

- **Host not chosen** — waiting on the client, decided 2026-09-10 (`PLAN.md`
  step 8d).
- **Off-site backup target** — needs the host first. `RCLONE_REMOTE` is wired
  and skipped until then.
- **Malware scanning** for patient uploads (§11.14): nothing in the stack scans
  files. The mitigations that do exist are that uploads are never executed and
  never served from the public static route. Wire ClamAV here.
- **Retention period** is a placeholder.
- **Restore drill against production** — untested by definition until there is
  a production.
- **API image size**: 1 GB on `node:22-slim`, and roughly 160 MB of that is
  still the Prisma CLI's own dependencies (`@prisma/studio-core`, `effect`,
  `pglite`, `typescript`). This entry used to say they were shipped "because
  migrations run at container start", and that was wrong: migrations moved to
  their own container on 2026-09-11 and the image did not change size
  (218,656,582 bytes before, 218,646,950 after). `@prisma/client` declares
  `prisma` as an optional peer dependency, so the pruned lockfile installs it
  either way. Getting those bytes out means not having the CLI in the workspace
  at all — `pnpm dlx` in the builder and in CI — which trades a deterministic
  install for a fetch, and is a bigger decision than it looks.
- **`alt` text for the photographs on `/about`.** They render as `alt=""`,
  which marks them decorative; they are a doctor at work, which is not the same
  thing. The images come from `AboutPage.images`, a list of URLs with nothing to
  describe them, so this needs a field in the back office and a migration. It
  was listed here as "audit pass A9" — A9 came and went (2026-09-11) without
  touching it, and it is nobody's task until it is scheduled as one.
- **Error tracking is configured and off.** All three applications carry the
  Sentry SDK and none of them has a DSN, which is correct until the account
  exists and is also indistinguishable from an integration that silently does
  not work. The first real report is the evidence, the same way the first maib
  callback is.
