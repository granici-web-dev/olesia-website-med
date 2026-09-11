# STACK.md

Technology choices for `olesia-website-med`, read off the repository on **2026-09-10** and
corrected by the maintainer. Versions are as pinned in the manifests.

An Nx monorepo with three applications and one shared package: a public marketing and
booking site, a NestJS content and operations API, and a Romanian-only back office.

---

## Choices

| Area                      | Choice                                                                                                             | Version                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Language                  | TypeScript, `strict`                                                                                               | `^5.9.3`                                                        |
| Monorepo                  | Nx + pnpm workspaces                                                                                               | `nx 22.7.5`, `pnpm@9.15.9`                                      |
| API framework             | NestJS on Express                                                                                                  | `@nestjs/* ^11`, `express ^5.2.1`                               |
| Database                  | PostgreSQL via Prisma with the pg driver adapter                                                                   | `prisma ^7.8.0`, `@prisma/adapter-pg ^7.8.0`                    |
| API auth                  | JWT access + refresh (sessions in `RefreshSession`), passport-jwt, argon2 hashing                                  | `@nestjs/jwt ^11.0.2`, `argon2 ^0.44.0`                         |
| API validation            | class-validator + class-transformer DTOs                                                                           | `^0.15.1` / `^0.5.1`                                            |
| API docs                  | Swagger at `/api/docs`                                                                                             | `@nestjs/swagger ^11.4.4`                                       |
| API hardening             | helmet, @nestjs/throttler                                                                                          | `^8.3.0`, `^6.5.0`                                              |
| Error tracking            | Sentry, one SDK per app, all behind a DSN that is currently empty                                                  | `@sentry/nestjs` / `@sentry/nextjs` / `@sentry/react` `10.74.0` |
| Scheduled work            | @nestjs/schedule                                                                                                   | `^6.1.3`                                                        |
| Mail                      | nodemailer                                                                                                         | `^8.0.11`                                                       |
| Images                    | sharp, in the API's storage pipeline                                                                               | `^0.35.0`                                                       |
| Uploads                   | multer, pinned across the tree by a pnpm override                                                                  | `2.3.0`                                                         |
| Second factor             | otplib (TOTP + recovery codes), `TotpModule` under `auth`                                                          | `^13.4.1`                                                       |
| Payments                  | maib e-Commerce Checkout, hand-written client                                                                      | —                                                               |
| Public site               | Next.js App Router, React 19                                                                                       | `next 16.3.4`, `react ^19`                                      |
| Public site i18n          | next-intl, locales `ro` (default) / `en` / `ru`                                                                    | —                                                               |
| Public site styling       | Tailwind v4 + CSS Modules, brand tokens as CSS variables                                                           | `tailwindcss ^4`                                                |
| Markdown                  | react-markdown + remark-gfm, in **both** front ends since audit A7                                                 | `^10.1.0` / `^4.0.1`                                            |
| Back office               | React 19 + Vite, react-router-dom                                                                                  | `vite ^8`, `react-router-dom 6.30.3` (exact)                    |
| Back office UI            | shadcn/ui over Radix primitives, CVA, tailwind-merge, lucide, sonner                                               | —                                                               |
| Back office data          | TanStack Query over `features/<domain>/api.ts` — no mock layer                                                     | `^5.101.0`                                                      |
| Back office forms         | react-hook-form + zod                                                                                              | `^7.78.0`, `zod ^4.4.3`                                         |
| Shared types              | `packages/shared` — DTOs and enums, built with `tsc`                                                               | workspace                                                       |
| Formatter                 | Prettier, single option: `singleQuote`                                                                             | `~3.6.2`                                                        |
| Test runner (API)         | Jest with `@swc/jest`, 368 tests in 41 suites                                                                      | `jest ~30.3.0`                                                  |
| Test runner (public site) | Vitest, `apps/frontend/vitest.config.mts` — `lib/` helpers only, 89 tests                                          | `vitest ~4.1.0`                                                 |
| Test runner (back office) | Vitest in `vite.config.mts`, 45 tests since audits A9 and A10                                                      | `vitest ~4.1.0`                                                 |
| CI                        | GitHub Actions: two typechecks, **all three test suites**, three builds, migration check, **the API Docker image** | —                                                               |
| Deploy (site)             | Vercel                                                                                                             | —                                                               |
| Deploy (API)              | Docker Compose + Postgres, nightly backups                                                                         | `docker-compose.prod.yml`                                       |
| Dependency updates        | Dependabot, grouped                                                                                                | —                                                               |

## Decisions

**Content management: a custom CMS, built in this repository.** The content modules of the
NestJS API (`services`, `blog`, `about`, `contacts`, `faq`, `testimonials`,
`media-appearances`, `materials`, `site-media`, `working-hours`) plus the
`apps/back-office` admin panel on React + Vite + shadcn/ui, Romanian-only interface.

Third-party CMSes, Sanity included, were rejected deliberately on **2026-06-10**: the same
admin surface has to own appointments, payments, patient files and the `admin` / `editor`
roles, and an off-the-shelf CMS does not give that. The legacy Sanity integration is fully
gone as of 2026-09-10 — the `lib/sanity/` directory, the `cdn.sanity.io` remote pattern in
`next.config.ts`, and the `apps/frontend/api/` directory whose only file described it. The
legacy Cal.com directory went earlier, booking having moved to Calendly.

This is a settled decision, not an absence to be filled later. New editable content gets a
module here, not an external service.

**The Prisma CLI is a devDependency, and migrations are their own container.** Since
2026-09-11 the API image runs `node main.js` and nothing else; `docker/Dockerfile.api` has
a second target, `migrate`, which installs the dev set and runs `prisma migrate deploy`
once per deploy. The CLI's 160 MB is still inside the runtime image anyway, because
`@prisma/client` declares `prisma` as an optional peer — measured, and written down in
`docs/deployment.md` rather than assumed away.

**Prisma 7 through the pg driver adapter, not the default engine.** `PrismaService`
constructs the client with `new PrismaPg({ connectionString })`. Anything instantiating
Prisma outside Nest (a script, a probe) must do the same or it fails at construction.

**No Redis.** Throttler storage is in-memory and the module comment says so plainly: this
is correct for a single instance, and a multi-instance deployment would need a shared
store. Recorded as a known limit rather than solved in advance.

**No ESLint.** Prettier with a single option is the whole formatting policy. Discipline
comes from `strict` TypeScript plus the rules in `AGENTS.md`, not from a linter.

**`nodenext` applies to the API only.** `tsconfig.base.json` sets
`module`/`moduleResolution: nodenext`; the back office and the site override both to
`esnext` / `bundler`. `apps/api/tsconfig.app.json` carries a comment about the dependency
incompatibility behind this.

**Dependencies are pooled at the root.** The root `package.json` holds runtime dependencies
for all three applications at once (`next`, `@nestjs/*`, `react-router-dom`, `sharp`),
while `apps/frontend` also has its own manifest. Ownership of a given dependency is
therefore ambiguous by inspection. Stated as fact, not as a recommendation.

**i18n is asymmetric.** The public site is `ro` / `en` / `ru`. API content is trilingual
too — RO and EN required, `*Ru` nullable (added 2026-07-27, migration
`20260727190927_content_ru_fields`), with readers falling back RU → RO through `loc()`,
which treats an empty string as missing. An empty RU field is the client's to fill; we do
not translate her content for her. The back office is Romanian-only, with every string in
one dictionary (`src/i18n/ro.ts`). Page copy on the site is _not_ in the JSON — see
`AGENTS.md` R3.

**`apps/frontend/origin/` is a read-only reference design.** HTML and JSX prototypes that
define the visual intent. Never edited; implementations live in `components/` and `app/`.

## Anti-choices

- **No mock data layer in the back office.** Removed on 2026-09-11 (audit A10): 21
  `mock.ts` files, the 21 `data.ts` switches in front of them, `VITE_API_MOCKS` and the
  `USE_MOCKS` flag. It was there to demonstrate the panel without a backend, and the
  failure mode was a build that showed invented patients and a demo admin signed in
  without a password, with nothing on the screen to say so. Every screen reads the API
  and reports an outage instead (audit A9). Fixtures live in tests.
- **No GraphQL.** REST with Swagger.
- **No ORM other than Prisma**, and no raw SQL in application code. Hand-written SQL exists
  only in migrations.
- **No `prisma db push`.** Migrations are generated and committed; see `PRINCIPLES.md`.
- **No state library anywhere.** The back office has TanStack Query for server state and
  nothing else. The public site has neither: its pages are server components that read the
  API directly, and the few interactive pieces hold their state in `useState`. Zustand and
  TanStack Query were both declared in `apps/frontend/package.json` and imported by two
  files nobody rendered; all four went with audit A7 on 2026-09-11.
- **No Edge runtime** on the site; the API is a long-running Node process.

## Dead or near-dead dependencies

Kept honest so nobody treats them as load-bearing.

- **`agentation`** — dev-tools components only, and a `devDependency` since audit A7:
  `DevTools` returns null outside development, so it never reached a production bundle,
  but declaring it as a runtime dependency said otherwise.

**Removed 2026-09-11 (audit A7):** `zustand` and `@tanstack/react-query` from
`apps/frontend`. Each had exactly one importer — `store/ui.store.ts` and
`lib/query-client.ts` — and neither file was imported by anything. TanStack Query stays in
the root manifest, where the back office genuinely uses it.

**Removed 2026-09-10:** `ai` and `@google/genai`, which existed for one parked
script and nothing else. The script is kept for reference, outside the dependency
tree, at `docs/parked/generate-images.ts`. Images reach the site the supported
way — the client uploads them in the back office, into the site-media slots and
the storage pipeline. Reviving the generator means re-adding both packages
deliberately, which is the point of moving it out.

## Payments — maib e-Commerce Checkout

**Part of the stack since 2026-09-10** (merge `4fb7161`), which reverses the earlier
"payments out of scope — manual" position in `module_calendly.md`.

`apps/api/src/app/payments/` holds a hand-written maib client (`maib.service.ts`), the
checkout and status controllers, the callback receiver with HMAC signature verification,
a scheduled reconciliation sweep, and refunds. `Payment` and `PaymentRefund` are their own
tables (migrations `20260910120000_payments`, `20260910140000_payment_refund_guards`); the
`paymentStatus` field on an appointment, order, subscription or question is a **mirror**
of the payment row, written by `markTargetPaid()`, not a field anyone edits. The DTOs live
in `packages/shared`, the back office renders them on the `Plăți` page, and 39 unit tests
cover the state mapping and the signature.

**No third-party payment SDK**, because maib publishes PHP and .NET only.

**The flow is not connected.** Nothing calls `PaymentsService.start()`, the site has no
pre-checkout step and no return pages, and the bank's back-channel callback has never been
delivered — that needs a public HTTPS host, which does not exist yet. Treat
`docs/payments-maib-checkout.md` as the source of truth: it records the bank's API, four
places where the sandbox disagrees with the documentation, and what is still blocked on
the client and on the acquirer.

## Error tracking — Sentry, configured and switched off

Added 2026-09-11 (audit A11, H3), because nothing reported a failure: a patient
whose upload threw a 500 saw an error page and the practice found out if the
patient telephoned.

`@sentry/nestjs` in the API, `@sentry/nextjs` on the site, `@sentry/react` in
the back office, each initialised only when its DSN is set — `SENTRY_DSN`,
`NEXT_PUBLIC_SENTRY_DSN`, `VITE_SENTRY_DSN` (compiled in at build time, which is
why the panel's is a Docker build argument). **All three are empty today**, so
no client is created and nothing is sent. The account is not a technical
decision: it is the EU region, on the free tier, in the client's name, and it
waits with the hosting.

One filter for the three, in `packages/shared/src/lib/sentry-scrub.ts` and under
test: the request body, query string, cookies and the `Authorization` / `Cookie`
headers never leave, and the segment after `/incarcare/`, `/uploads/` and
`/download/` is redacted out of every URL — the first of those is a patient's
entire credential for their upload link. It lives in `packages/shared` because
it is the same decision three times, and the SDKs pass the same shape through
`beforeSend`.

**`SentryGlobalFilter` from `@sentry/nestjs/setup` is deliberately not used.**
pnpm resolves a second copy of `@nestjs/core` for `@sentry/nestjs`, so that
filter extends a `BaseExceptionFilter` bound to a different `HttpAdapterHost`
token than the container holds; the optional injection stays undefined and every
500 becomes `Cannot read properties of undefined (reading 'isHeadersSent')` —
the real error replaced by an error in the reporter. `SentryReportingFilter` in
`apps/api/src/app/common/` extends the class we import ourselves, changes no
response, and decides what is worth reporting (5xx and anything not meant as an
HTTP answer; not 4xx).

## Environment

The API's variables are documented in `docs/deployment.md`; the site's in
`apps/frontend/.env.local.example`. Two groups are worth naming here because they change
how the system behaves rather than where it points:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — at least 32 characters and different from
  each other. `main.ts` checks both at boot and exits rather than starting on a weak or
  shared secret. `COOKIE_SECURE` defaults to `true`, so the refresh cookie is `Secure`
  unless someone explicitly says otherwise.
- `MAIB_BASE_URL`, `MAIB_CLIENT_ID`, `MAIB_CLIENT_SECRET`, `MAIB_SIGNATURE_KEY` — all
  blank means online payment is simply off, which is the correct state until the acquirer
  contract exists. `MaibService.isConfigured()` tests the first three; a missing signature
  key makes every callback rejected and logged, deliberately.
