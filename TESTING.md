# TESTING.md

Testing posture for `olesia-website-med`, as observed on **2026-09-10** and corrected by
the maintainer.

**The honest headline: this project has almost no tests, and CI does not run the ones it
has.** What follows describes that accurately and then proposes defaults for the stack,
rather than inventing conventions the repository does not have.

---

## What exists today

Three spec files in the whole repository:

| File | What it is |
| --- | --- |
| `apps/api/src/app/app.controller.spec.ts` | Nx scaffolding, 21 lines |
| `apps/api/src/app/app.service.spec.ts` | Nx scaffolding |
| `apps/api/src/app/working-hours/business-hours.spec.ts` | The one real test, 155 lines |

`business-hours.spec.ts` is the model to copy. It tests `addWorkingMinutes` and `isOpenAt`
as pure functions against a declared `Schedule`, with no database, no mocks and no Nest
test module, and it pins the cases that actually break: crossing midnight, weekends, and
the two nights a year Moldova changes its clocks. Its header comment says why the file
exists at all: the EXPRESS deadline is the one number a patient is told to expect.

## What CI does, and does not do

`.github/workflows/ci.yml` runs on every PR:

1. Build the shared types, generate the Prisma client.
2. `tsc --noEmit` on the API.
3. Build all three applications.
4. Apply every migration to a clean Postgres and assert the schema matches them.

It does **not** run Jest or Vitest.

**Step 4 is the most valuable check in the project and should be treated as such.** It is
the only integration test here: it proves the 23 committed migrations apply in order to an
empty database and leave a schema that matches `schema.prisma`. Given that five migrations
are hand-corrected, that check earns its keep every time it runs.

## Known gap in the safety net

**Back-office type errors reach `main`.** The Vite build does not run `tsc`, so CI's
"Build back office" step passes with type errors present. Right now
`tsc -p apps/back-office/tsconfig.app.json --noEmit` fails on an unused `AreaField` in
`apps/back-office/src/features/about/block-editors.tsx`.

Closing this is a one-line CI change, and it is worth more than any new test file: it
restores the compiler as a real gate on a 224-file application. Do that before writing a
suite.

## Tooling

- **API:** Jest, configured in `apps/api/jest.config.cts`, transformed by `@swc/jest`.
  Working.
- **Back office:** Vitest is installed and referenced from `vite.config.mts`
  (`/// <reference types='vitest' />`) through the Nx plugin, but there is no test
  configuration and no tests.
- **Public site:** no test runner at all.

## Defaults for new tests

Follow these unless a specific case argues otherwise.

**Worth testing.**

- **Pure functions and mappers**, in Jest, with no database and no Nest test module. The
  standing examples: `business-hours.ts` (already covered), `toPaymentState` in
  `payments.service.ts`, and any future money or date arithmetic.
- **Signature verification**, against recorded raw bodies. `verifySignature` in
  `calendly.service.ts` and `maib.service.ts` both hash exact bytes, and the two use
  different argument orders and encodings. A test with a captured payload and its real
  header is the only thing that catches a silent mismatch there.
- **Webhook ingestion**, driven by a recorded body plus a valid signature, asserting the
  state transition and that a second delivery of the same payload changes nothing.

**Not worth testing.**

- Generated code (`apps/api/src/generated/`), Prisma itself, NestJS wiring.
- Controllers that only delegate to a service.
- The Nx scaffolding specs above, which assert nothing about this project. Delete them
  when a real API test suite appears.
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
