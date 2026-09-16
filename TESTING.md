# TESTING.md

Testing posture for `olesia-website-med`. Corrected against the repository on
2026-09-16. The per-suite inventory lives in `docs/test-inventory.md`; this file
is the rule, not the record.

**Unit tests cover the arithmetic that would be expensive to get wrong, and CI
runs all of them on every PR.** The suite was 3 files in August. The audit
programme (A2–A13, `docs/plan-log.md`) put the rest there, because a finding
worth fixing is usually a finding worth pinning. Count them with
`find apps packages -name '*.spec.*'` rather than trusting a number written here.

---

## Three runners

| Runner             | Where                                                                      | Environment |
| ------------------ | -------------------------------------------------------------------------- | ----------- |
| Jest + `@swc/jest` | `apps/api`, and through its roots `packages/shared`                        | node        |
| Vitest             | `apps/frontend`, `vitest.config.mts`, `lib/` helpers only                  | node        |
| Vitest             | `apps/back-office`, `test` block in `vite.config.mts`, `src/test-setup.ts` | jsdom       |

All three are unit tests over pure functions: no database, no Nest test module,
no rendered component. Together they take a few seconds. A fourth, one Playwright
spec in `apps/frontend-e2e`, is run by hand and never in CI.

`packages/shared` has no runner of its own; the API's Jest is the one that sees
its specs.

## Jest configuration

`apps/api/jest.config.cts`, transformed by `@swc/jest`. Two settings are not
defaults and should not be "cleaned up": the transform pattern is
`^.+\.[cm]?[tj]s$` because otplib publishes `.cjs` and `.mjs`, and
`transformIgnorePatterns` re-includes `otplib`, `@scure` and `@noble`, which
ship ESM only.

## The end-to-end path

`apps/frontend-e2e/src/smoke.spec.ts` covers the one thing no unit test can: a
stranger's money turning into a ticket on the doctor's desk. It fills the EXPRESS
checkout on a production build, pays at maib's sandbox with the test card, waits
for "Plata a fost confirmată", then asks the back-office API whether the ticket is
`open`, `confirmed` and carries a `dueAt`. It asserts the negative twice: an
unpaid question must be invisible to the doctor.

**Run it by hand. It is not in CI and must not be put there**: it needs a
database, sandbox credentials and someone else's payment page.

```sh
docker compose up -d postgres
pnpm nx build api && (cd apps/api && npx prisma db seed)   # once, dev profile

CORS_ORIGINS=http://localhost:3100 PUBLIC_SITE_URL=http://localhost:3100 \
PUBLIC_API_URL=http://localhost:3333/api PAYMENT_CURRENCY=MDL \
LEGAL_ENTITY_NAME='SRL Test E2E' LEGAL_ENTITY_IDNO='1000000000000' \
LEGAL_ENTITY_ADDRESS='mun. Chisinau, str. Test 1' node apps/api/dist/main.js

NEXT_PUBLIC_SITE_URL=http://localhost:3100 API_URL=http://localhost:3333/api \
NEXT_PUBLIC_API_URL=http://localhost:3333/api pnpm nx next:build @olesia/frontend
cd apps/frontend && NEXT_PUBLIC_SITE_URL=http://localhost:3100 \
API_URL=http://localhost:3333/api NEXT_PUBLIC_API_URL=http://localhost:3333/api \
npx next start -p 3100

pnpm nx e2e-smoke frontend-e2e        # first run only: npx playwright install chromium
```

Each variable has already cost a run: `PAYMENT_CURRENCY=MDL` because the sandbox
profile has no EUR; `LEGAL_ENTITY_*` because the checkout refuses with
`legal_entity_missing` without all three; `CORS_ORIGINS` naming the site's origin
or the POST is blocked; `PUBLIC_SITE_URL` because the bank is given it as the
return address. `src/global-setup.ts` checks all of them before the browser opens.

What it does not cover: the bank's callback (never delivered, no public host),
refunds, the group-C and paid-material checkouts, the doctor's answer. Those are
hand-run acceptance points, `docs/plan-log.md` step 12c.

## What CI does

`.github/workflows/ci.yml` on every PR and push to `main`: build shared types,
generate the Prisma client, `tsc --noEmit` on API and back office, all three test
suites, three builds, `prettier --check`, migrations applied to a clean Postgres
with a schema diff, and the API Docker image built without push.

The migration job is the only integration test here and the most valuable check
in the project: several migrations are hand-corrected. What CI still does not
tell you: whether a page renders, whether Calendly works end to end, whether the
compose stack comes up. Those are exercised by hand per `docs/deployment.md`.

## Still open

- **Test code is not typechecked.** Both `tsc` steps exclude `*.spec.ts`, and
  `apps/api/tsconfig.spec.json` does not compile on its own. The site is the
  exception: `next build` checks its specs.
- **Webhook ingestion end to end.** Both signatures and both payload parsers are
  pinned, but nothing drives a recorded body through the controller and asserts
  the transition, or that a second delivery changes nothing. The maib callback
  has never been delivered by the bank.
- **The seed itself** needs a database and has no coverage beyond the profile
  decision.

## Defaults for new tests

**Worth testing.** Pure functions and mappers, with no database and no Nest test
module; anything that computes money, a date or a deadline, the day it is
written. A guard's decision, with a `Reflector` stand-in rather than a testing
module. Signature verification against recorded raw bodies. Anything a
three-language site renders, in all three languages: a missing locale branch
silently serves Romanian to a Russian reader. The order of two refusals, where
the wrong order costs the user something.

**Not worth testing.** Generated code, Prisma itself, NestJS wiring, controllers
that only delegate, presentational React components.

**Mocking policy: do not mock Prisma.** Test the pure logic without a database and
let the migration check cover the schema. Where a service must be instantiated
for a path that never queries, hand it a client that throws on any access, so
"no database was touched" is an assertion.

**Fixtures** inline in the test file; no factory layer until the third test needs
the same shape. **Layout** co-located, `<subject>.spec.ts`, names as sentences
about behaviour. **Snapshots: no.** **Coverage target: none**; cover what is
expensive to get wrong. **Runtime** well under a minute; anything needing a
database or the network belongs in a separate target.
