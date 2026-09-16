# CLAUDE.md — olesia-website-med

Public site, API and back office for a paediatric and nutrition practice in Moldova.
Three locales, custom CMS, maib payments, Calendly booking, patient document uploads.
This file is a map. Read the file a row points at only when the task needs it.

## Start here

- **`PLAN.md`** — where we are, the current step, what waits on the client. Under 150
  lines, read it whole. History and every decision: `docs/plan-log.md`, read on demand.
- **`AGENTS.md`** — the rules that hold everywhere: shape before code, commits, i18n
  principle, forbidden patterns. Per-app rules live next to the app (below).
- **Standards** for `/rigorous`: `PRINCIPLES.md` (judgment), `STACK.md` (technology),
  `TESTING.md` (what is worth testing). The skill loads them itself; do not read them
  up front.

## Where things live

| Topic                        | Code                                            | Rules and record                                           |
| ---------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Public site (Next.js 16)     | `apps/frontend/`                                | `apps/frontend/AGENTS.md`                                  |
| API (NestJS 11, Prisma 7)    | `apps/api/`                                     | `apps/api/CLAUDE.md`                                       |
| Back office (React + Vite)   | `apps/back-office/`                             | `apps/back-office/CLAUDE.md`                               |
| Shared DTOs and enums        | `packages/shared/`                              | imported by all three, never duplicated                    |
| Payments (maib Checkout)     | `apps/api/src/app/payments/`, `leads/checkout*` | `docs/payments-maib-checkout.md`                           |
| Booking (Calendly)           | `apps/api/src/app/appointments/`                | `module_calendly.md` (original spec, partly superseded)    |
| Patients, uploads, GDPR      | `apps/api/src/app/{patients,uploads}/`          | `module_patients.md`, `docs/gdpr.md`                       |
| Deploy, runbook, environment | `docker/`, `docker-compose.prod.yml`            | `docs/deployment.md`, `.env.prod.example`                  |
| Client scope and blockers    |                                                 | `docs/brief-changes-2026-06-24.md`, `docs/questions_v3.md` |
| Full audit and its findings  |                                                 | `docs/audit-2026-09-10.md`                                 |
| Tests, per suite             |                                                 | `docs/test-inventory.md`                                   |
| Dependency advisories        |                                                 | `docs/dependency-advisories.md`                            |
| Reference design             | `apps/frontend/origin/` (read-only, never edit) |                                                            |

## Facts that change how you work

- **Monorepo:** Nx + pnpm workspaces. Run tasks through `pnpm nx …`. For scaffolding
  invoke the `nx-generate` skill first; for exploring, `nx-workspace`.
- **No third-party CMS** (decided 2026-06-10): content is served by the API and edited
  in the back office. Sanity and Cal.com are gone.
- **Payments are live in code**: EXPRESS, deliverables and paid materials go through the
  maib checkout; `paymentStatus` mirrors the `Payment` row and is never set by hand.
  The bank's callback has never been delivered: no public HTTPS host yet.
- **Calendly needs the client's paid plan**; the test account's free plan keeps four of
  five event types inactive. Map a booking to a service by `event_type` URI only.
- **Deploy:** site on Vercel (production env vars still unset, see `PLAN.md`); API +
  Postgres via `docker-compose.prod.yml`, host not chosen yet.
- **Skills:** responsive work uses `tailwind-responsive-design`; back-office UI uses
  `impeccable`; engineering work goes through `rigorous` (shape → craft, audit → harden).

## Nx

- Prefer `pnpm nx run` / `run-many` / `affected` over the underlying tools.
- Plugin practices: `node_modules/@nx/<plugin>/PLUGIN.md` when present.
- `nx_docs` for advanced config, migrations and unfamiliar flags only. Never guess CLI
  flags; check `--help`.
