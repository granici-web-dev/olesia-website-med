# apps/api — NestJS API

Loaded when you work in this directory. General rules: `../../AGENTS.md`. Standards:
`PRINCIPLES.md`, `STACK.md`, `TESTING.md` at the root.

## Shape

One module per domain under `src/app/<domain>/`: module, service, controller, DTOs,
mapper. 27 modules. `packages/shared` holds every DTO and enum the front ends read;
mappers are typed by them. Public GETs are read-only and unauthenticated; everything else
sits behind `JwtAuthGuard` + `RolesGuard` (deny by default: a route without `@Roles` is
refused, `@Public()` opts out explicitly).

## Rules that bite

- **Validate at boundaries only.** `class-validator` DTOs with `whitelist` and
  `forbidNonWhitelisted`; every free-text field has `@MaxLength`. Internal calls trust
  the types.
- **Prisma 7 through `@prisma/adapter-pg`.** Anything instantiating Prisma outside Nest
  must construct it the same way. Writes that can hit a unique or FK constraint go
  through `common/prisma-errors.ts` (P2002 → 409, P2003 → 409, P2025 → 404). Prisma 7
  puts the constraint name in `meta.driverAdapterError`, not `meta.target`.
- **Migrations are generated**, then hand-corrected only when generation would lose
  data, with a comment saying what. Generate against a throwaway database; never
  `db push`. CI applies every migration to a clean Postgres and diffs the schema.
- **`nodenext` module resolution** here only; the two front ends use `bundler`.
- **Raw body is kept** (`rawBody: true` in `main.ts`) for two HMAC webhooks with
  opposite conventions: Calendly signs `{t}.{body}` in hex, maib signs `{body}.{timestamp}`
  in base64. Do not "unify" them.
- **`paymentStatus` is a mirror** of the `Payment` row, written by
  `payments/fulfilment.service.ts`. Offline money is a `Payment` with method `manual`.
  Prices come from the catalog (`Service.price`, `DELIVERABLE_CATALOG`, `Material.price`),
  never from a request body.
- **PII never reaches logs.** Log ids and counts; mask emails with `common/mask-email`.
  Patient files live in `PRIVATE_UPLOADS_DIR` under UUID names and are only streamed to
  authenticated staff; unknown, expired and revoked upload tokens answer the same 404.
- **Config is validated at boot.** `main.ts` refuses to start in production without JWT
  secrets (≥ 32 chars, different), `LEADS_NOTIFY_EMAIL`, `RECAPTCHA_SECRET`,
  `PRIVATE_UPLOADS_DIR`, `UPLOADS_DIR`, `PUBLIC_API_URL`, `PUBLIC_SITE_URL`,
  `CORS_ORIGINS`. Empty `MAIB_*`, `SENTRY_DSN`, `SMTP_*`, `CALENDLY_*` mean "off", with
  one warning each.
- **Comments carry provenance** (`audit A5 F1`, `module_calendly.md §8.4`, a date). Do
  not strip them.

## Tests

Jest via `@swc/jest`, `jest.config.cts` (ESM transform for otplib is deliberate). Pure
functions only, no Prisma mocks; the seam is a function you export for the purpose.
Run: `pnpm nx test api`.

## Pointers

Payments: `docs/payments-maib-checkout.md`. Booking: `module_calendly.md`. Patients and
uploads: `module_patients.md`. Environment and runbook: `docs/deployment.md`.
