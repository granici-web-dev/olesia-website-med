# TESTING.md

Testing posture for `olesia-website-med`, as observed on **2026-09-10** and corrected by
the maintainer.

**The honest headline: 108 tests cover the arithmetic that would be expensive to get
wrong, and CI still does not run them.** The suite grew from 3 files to 11 over the
hardening passes of 2026-09-10. What follows describes what is covered, what deliberately
is not, and the defaults for adding to it.

---

## What exists today

108 tests in 11 suites, all in the API, all unit tests over pure functions:

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `working-hours/business-hours.spec.ts` | 15 | `addWorkingMinutes` and `isOpenAt` against a declared schedule: crossing midnight, weekends, both nights a year Moldova changes its clocks, an all-days-closed schedule, a closes-before-opens typo. The EXPRESS deadline is the one number a patient is told to expect. |
| `payments/payments.state.spec.ts` | 27 | The bank's status strings mapped to our `PaymentState`, including the refund and partial-refund cases the sandbox spells differently from its own documentation. |
| `payments/maib.signature.spec.ts` | 12 | Callback signature verification against recorded bodies. maib hashes `{rawBody}.{timestamp}` and base64-encodes it — the opposite order and a different encoding from the Calendly webhook, which is exactly the kind of mismatch that fails silently. |
| `uploads/upload-rules.spec.ts` | 16 | Which files a patient upload link accepts, and the token rules: unknown, expired and revoked must be indistinguishable. |
| `storage/file-signature.spec.ts` | 12 | The magic-byte sniffer. A declared MIME type is what the uploader claims; the first bytes are what the file is. |
| `auth/refresh-rules.spec.ts` | 11 | Refresh-session validity: revoked, expired, rotated, reused. |
| `auth/totp-code.spec.ts` | 7 | The TOTP acceptance window — wide enough for a phone with a slow clock, no wider. |
| `auth/totp-lockout.spec.ts` | 4 | The lockout that brakes code guessing: doubling from one minute to a ceiling of fifteen, and clearing itself. |
| `users/starter-password.spec.ts` | 2 | |
| `app.controller.spec.ts`, `app.service.spec.ts` | 2 | Nx scaffolding. They assert nothing about this project — delete them the next time this list is edited. |

`business-hours.spec.ts` is still the model to copy: a pure function, a declared fixture,
no database, no mocks, no Nest test module, and a header comment saying why the file exists
at all.

The **front ends have no tests**. Vitest is installed and referenced from
`vite.config.mts` through the Nx plugin, but there is no test configuration and no specs.

## Jest configuration

`apps/api/jest.config.cts`, transformed by `@swc/jest`. Two settings are not defaults and
should not be "cleaned up":

- The transform pattern is `^.+\.[cm]?[tj]s$` rather than the usual `^.+\.[tj]s$` —
  otplib's published entry points use both `.cjs` and `.mjs`.
- `transformIgnorePatterns` re-includes `otplib`, `@scure` and `@noble`, which ship ESM
  only. Everything else in `node_modules` is left alone, which is what the default does.

## What CI does, and does not do

`.github/workflows/ci.yml` runs on every PR:

1. Build the shared types, generate the Prisma client.
2. `tsc --noEmit` on the API **and on the back office**.
3. Build all three applications.
4. Apply every migration to a clean Postgres and assert the schema matches them.

It does **not** run Jest or Vitest. The suite is fast (about a second) and there is no
good reason left for that; adding it is a small CI change.

**Step 4 is the most valuable check in the project and should be treated as such.** It is
the only integration test here: it proves the 26 committed migrations apply in order to an
empty database and leave a schema that matches `schema.prisma`. Given that five migrations
are hand-corrected, that check earns its keep every time it runs.

## The gap in the safety net, and how it was closed

**Back-office type errors used to reach `main`.** The Vite build does not run `tsc`, so
"Build back office" passed with type errors present, and the only thing that typechecked
that 225-file application was someone's laptop. An unused `AreaField` in
`apps/back-office/src/features/about/block-editors.tsx` had been sitting on `main`
because of it.

Closed by **`7c0234d`**, which deleted the dead helper and added
`tsc -p apps/back-office/tsconfig.app.json --noEmit` next to the existing API step. It
was worth more than any new test file: it restored the compiler as a real gate on the
largest of the three applications.

**What is still open:** the site itself. `next build` typechecks as it builds, so errors
there do fail CI — but there is no test runner, and no plan to add one for presentational
components.

## Defaults for new tests

Follow these unless a specific case argues otherwise.

**Worth testing.**

- **Pure functions and mappers**, in Jest, with no database and no Nest test module. The
  standing examples are `addWorkingMinutes` and `toPaymentState`; anything that computes
  money, a date or a deadline belongs here the day it is written, not later.
- **Signature verification**, against recorded raw bodies. `verifySignature` in
  `calendly.service.ts` and `maib.service.ts` both hash exact bytes, and the two use
  different argument orders and encodings. A test with a captured payload and its real
  header is the only thing that catches a silent mismatch there.
- **Webhook ingestion**, driven by a recorded body plus a valid signature, asserting the
  state transition and that a second delivery of the same payload changes nothing. **Still
  uncovered** for both Calendly and maib, and the maib callback has additionally never been
  delivered by the bank — the first real one will be the first end-to-end evidence that
  path works.

**Not worth testing.**

- Generated code (`apps/api/src/generated/`), Prisma itself, NestJS wiring.
- Controllers that only delegate to a service.
- The two Nx scaffolding specs, which assert nothing about this project. The real suite
  they were waiting on exists now; they are two of the 108 and should go.
- Presentational React components.

**Mocking policy: do not mock Prisma.** A mocked Prisma client asserts that the test
author understood the query, not that the query works. Test the pure logic without a
database, and let the migration check in CI cover the schema. If a service genuinely needs
database coverage, run it against a real Postgres rather than a mock.

**Fixtures.** Inline literals in the test file, as `business-hours.spec.ts` does with
`MON_FRI_9_17`. No factory layer until the third test needs the same shape.

**Layout and naming.** Co-located with the source, `<subject>.spec.ts`. Test names read as
sentences about behaviour, not about method names.

**Snapshots: no.** Nothing here has an output stable enough to be worth a snapshot, and a
snapshot of Romanian marketing copy would fail on every content edit.

**Coverage target: none.** Cover what would be expensive to get wrong: money, dates,
signatures, retention and deletion. A coverage percentage on a codebase that is mostly
content plumbing would measure the wrong thing.

**Runtime.** The suite should stay fast enough to run on every commit, well under a minute.
If a test needs a database or the network, it belongs in a separate integration target,
not in the default run.
