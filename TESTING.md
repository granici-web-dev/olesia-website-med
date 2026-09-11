# TESTING.md

Testing posture for `olesia-website-med`, as observed on **2026-09-11** and corrected by
the maintainer.

**486 tests cover the arithmetic that would be expensive to get wrong, and CI runs all of
them on every PR.** The suite was 3 files in August and 124 tests on 2026-09-10; the audit
programme (A2–A11) is what put the rest there, because a finding worth fixing is usually a
finding worth pinning. What follows describes what is covered, what deliberately is not,
and the defaults for adding to it.

---

## Three runners

| Runner | Where | Tests | Files |
| --- | --- | ---: | ---: |
| Jest + `@swc/jest` | `apps/api` — and, through its roots, `packages/shared` | 352 | 39 |
| Vitest | `apps/frontend`, config `vitest.config.mts`, environment `node` | 89 | 9 |
| Vitest | `apps/back-office`, `test` block in `vite.config.mts`, environment `jsdom` | 45 | 8 |

All three are unit tests over pure functions: no database, no Nest test module, no rendered
component. Together they take about four seconds.

Two of the API's suites sit outside `src/app`: `src/seed/profile.spec.ts`, and
`packages/shared/src/lib/phone.spec.ts` — the shared package has no runner of its own, and
the API's Jest is the only one in the tree that sees it.

## What exists today

**Money and the bank.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `payments/payments.state.spec.ts` | 27 | The bank's status strings mapped to our `PaymentState`, including the refund and partial-refund cases the sandbox spells differently from its own documentation. |
| `payments/maib.signature.spec.ts` | 12 | Callback signature verification against recorded bodies. maib hashes `{rawBody}.{timestamp}` and base64-encodes it — the opposite order and a different encoding from the Calendly webhook, which is exactly the kind of mismatch that fails silently. |
| `payments/start-guards.spec.ts` | 10 | `checkoutAmount` and `resolveIntent`: a service priced 0 is "on request" rather than free, maib refuses 1.00 or less, and a repeat submit must neither charge twice nor strand a declined card. |
| `payments/maib.checkout-normalize.spec.ts` | 6 | The two spellings maib uses for `completedAt` / `paymentId`. Reading one of them gives a payment marked paid with no date, or one that cannot be refunded. |
| `payments/mirror-status.spec.ts` | 6 | `paymentStatus` as a mirror of the `Payment` row, including the direction that used to be wrong — a payment that stops being paid. |
| `payments/sla-clock.spec.ts` | 4 | Where the EXPRESS clock starts: the bank's moment, not the moment the sweep noticed. |
| `materials/material-price.spec.ts` | 6 | What a paid material costs, and its composition with `checkoutAmount`. |
| `shared/phone.spec.ts` | 8 | E.164 normalisation. maib refuses a whole checkout with error 42005 over a payer phone, so this function decides whether a sale happens. |

**Dates, deadlines and the promise to a patient.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `working-hours/business-hours.spec.ts` | 15 | `addWorkingMinutes` and `isOpenAt` against a declared schedule: crossing midnight, weekends, both nights a year Moldova changes its clocks, an all-days-closed schedule, a closes-before-opens typo. |
| `working-hours/normalize-days.spec.ts` | 7 | What the `Json` schedule column becomes when it does not hold a schedule. Every way of being wrong fails the same way — a day read as closed pushes an EXPRESS deadline into next week. |
| `working-hours/update-working-hours.dto.spec.ts` | 4 | The timezone field. `Intl.DateTimeFormat` throws a `RangeError` on an unknown zone, and a typo saved here used to turn every EXPRESS submission into a 500. |
| `quick-questions/ticket-activation.spec.ts` | 4 | Paying does not touch a ticket that is not `awaiting_payment`. The bank redelivers and the sweep writes the same transition from the other side. |
| `deliverable-orders/order-activation.spec.ts` | 5 | The same rule for a group-C order: paying twice must not walk a finished one backwards. |

**Access, sessions and the second factor.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `auth/refresh-rules.spec.ts` | 13 | Refresh-session validity: revoked, expired, rotated, reused. |
| `auth/totp-code.spec.ts` | 7 | The TOTP acceptance window — wide enough for a phone with a slow clock, no wider. |
| `auth/totp-lockout.spec.ts` | 4 | The per-account brake on guessing: doubling from one minute to a ceiling of fifteen, and clearing itself. |
| `auth/totp-login-order.spec.ts` | 4 | The lock is reported **before** a code is asked for. The other order answered `totp_required`, so the panel opened an empty field with no timer and every guess typed into it pushed the lock further out. |
| `auth/guards/roles.guard.spec.ts` | 6 | Deny by default. The guard used to allow a route that carried no `@Roles`, so "somebody forgot the decorator" and "everyone with a token may do this" were the same thing to read. |
| `auth/guards/must-change-password.guard.spec.ts` | 4 | The three routes an account still on its starter password may reach, named here rather than re-read off the controllers. |
| `users/last-admin.spec.ts` | 10 | The practice keeps an administrator. The single admin account could demote or deactivate itself, and the way back is a psql prompt on the production host. |
| `users/starter-password.spec.ts` | 2 |  |
| `seed/profile.spec.ts` | 6 | The seed refuses to give production an administrator with a password nobody chose. |

**Files, uploads and what leaves the server.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `storage/file-signature.spec.ts` | 17 | The magic-byte sniffer. A declared MIME type is what the uploader claims; the first bytes are what the file is. |
| `uploads/upload-rules.spec.ts` | 16 | Which files a patient upload link accepts, and the token rules: unknown, expired and revoked must be indistinguishable. |
| `materials/grant-rules.spec.ts` | 14 | Who may have a paid material's file and for how long: a grant that outlives its purchase, a repeat purchase invalidating a link already sent, a capability check that can be guessed. |
| `materials/materials.mapper.spec.ts` | 9 | What the storefront is allowed to know about a material — neither `fileUrl` nor `fileKey`, and `hasFile` decides whether a card sells at all. |
| `common/uploaded-file-url.spec.ts` | 10 | `fileUrl` and `coverImageUrl` are an anchor and an `<img>` on the public site. The rule is the path, deliberately not the host. |

**Patient data and GDPR.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `patients/erasure-targets.spec.ts` | 8 | The erasure plan against one row per table, including the four rows an audit found surviving it. |
| `patients/interactions.spec.ts` | 5 | Which branch each lead kind takes into the dossier timeline; group-C orders had none. |
| `common/patient-email.spec.ts` | 5 | The dedup key for a medical record — the cases that used to merge two people. |
| `common/mask-email.spec.ts` | 5 |  |
| `mail/patient-templates.spec.ts` | 12 | Which language a patient is written to in, and the fallback for every row predating the `locale` column. |

**Boundaries and plumbing.**

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `appointments/calendly.payload.spec.ts` | 20 | What we keep from a Calendly payload and what we refuse to keep, including the reschedule link the free test account cannot reproduce live. |
| `appointments/calendly.signature.spec.ts` | 13 | Calendly's webhook signature, against recorded bodies. |
| `common/prisma-errors.spec.ts` | 14 | Four writes that answered 500 — a taken slug, a taken event type, a service still carrying appointments, a post pointing at a deleted category. |
| `common/captcha/captcha.service.spec.ts` | 13 | The captcha is fail-open by design, and a _hanging_ Google has to fail open too: Node's `fetch` has no default timeout. |
| `common/slugify.spec.ts` | 8 | One `slugify` in `packages/shared`, after three copies disagreed about the cedilla. |
| `common/dto/pagination.spec.ts` | 7 | The envelope and its ceiling; `page` becomes an SQL OFFSET. |
| `blog/post-visibility.spec.ts` | 6 | Deferred publication, boundary included. An article dated next spring used to be live and sorted to the top. |

**The public site** (`apps/frontend`, Vitest) — all of it under `lib/`.

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `lib/form-errors.spec.ts` | 17 | The four failures a visitor can act on stay distinguishable, in all three languages. |
| `lib/service-price.spec.ts` | 16 | Every price and duration string the site renders, in all three locales: the client's `priceLabel` beating a compiled-in one, the RU → RO fallback, `price: 0` reading as "on request". |
| `lib/api.spec.ts` | 14 | `serviceTag` in three languages, and `getJson`'s two branches — emptiness at build time, an outage at runtime. |
| `lib/working-hours.spec.ts` | 14 | The opening hours and the EXPRESS promise, read correctly in all three languages. |
| `lib/validation.spec.ts` | 7 | The one anchored email regex, against the cases the four unanchored ones got wrong. |
| `lib/calendly.spec.ts` | 6 | The **absence** of a fallback: a service with no scheduling URL gets `null` and renders no button, rather than booking a stranger's calendar. |
| `lib/contacts.spec.ts` | 6 | A phone number is written for a human and dialled by a machine. |
| `lib/service-content.spec.ts` | 5 | An untranslated field reads as Romanian; an empty one renders nothing. |
| `lib/markdown.spec.tsx` | 4 | GFM tables survive, and an outbound link carries `rel="noopener"`. |

**The back office** (`apps/back-office`, Vitest).

| Suite | Tests | What it pins |
| --- | ---: | --- |
| `auth/session-rules.spec.ts` | 8 | `totpLockSeconds` reading the API's 429, and the return path that used to drop its query string. |
| `api/http.spec.ts` | 6 | What the HTTP client makes of an answer that is not a 200 with JSON — a 2FA switch reporting "Cod invalid" after it had already turned the factor off, a stopped API leaving spinners running. |
| `features/media/parse-url.spec.ts` | 7 | Every shape of media link the doctor might paste; the wrong one shows a blank player to visitors. |
| `features/payments/format.spec.ts` | 6 | The receipt pasted into her own mail client while there is no SMTP, and money typed on a Romanian keyboard. |
| `features/about/form-schema.spec.ts` | 5 | Only the Romanian title is required — a page held back until three translations exist is a page that never ships. |
| `features/quick-questions/format.spec.ts` | 5 | The EXPRESS countdown: two units, never seconds. |
| `features/working-hours/sla.spec.ts` | 5 | How any SLA value the client types reads in Romanian. |
| `features/dashboard/format.spec.ts` | 3 |  |

`business-hours.spec.ts` is still the model to copy: a pure function, a declared fixture,
no database, no mocks, no Nest test module, and a header comment saying why the file exists
at all. Nearly every suite above now carries that header, and most of them name the audit
finding that put them there.

## Jest configuration

`apps/api/jest.config.cts`, transformed by `@swc/jest`. Two settings are not defaults and
should not be "cleaned up":

- The transform pattern is `^.+\.[cm]?[tj]s$` rather than the usual `^.+\.[tj]s$` —
  otplib's published entry points use both `.cjs` and `.mjs`.
- `transformIgnorePatterns` re-includes `otplib`, `@scure` and `@noble`, which ship ESM
  only. Everything else in `node_modules` is left alone, which is what the default does.

## What CI does, and does not do

`.github/workflows/ci.yml` runs on every PR and every push to `main`:

1. Build the shared types, generate the Prisma client.
2. `tsc --noEmit` on the API **and on the back office**.
3. **All three suites** — `pnpm nx test api`, `pnpm nx test @olesia/frontend`,
   `pnpm nx test back-office`.
4. Build all three applications.
5. Apply every migration to a clean Postgres and assert the schema matches them.

Step 3 arrived in two halves: the API and the site on 2026-09-10, the back office on
2026-09-11 with the first specs it had ever had. Until then the tests ran only where
someone remembered to run them, which is a strange arrangement for the tests that cover the
money, the dates and the webhook signatures.

**Step 5 is the most valuable check in the project and should be treated as such.** It is
the only integration test here: it proves the committed migrations apply in order to an
empty database and leave a schema that matches `schema.prisma`. Given that five migrations
are hand-corrected, that check earns its keep every time it runs.

**What CI still does not tell you:** whether a page renders correctly, whether Calendly or
the bank works end to end, and whether the Docker image builds — no job touches
`docker/` or `docker-compose.prod.yml`, so a broken image is found at deploy time.

## What is still open

- **Test code is not typechecked.** Both `tsc` steps exclude `src/**/*.spec.ts`
  (`apps/api/tsconfig.app.json`, `apps/back-office/tsconfig.app.json`), Jest and Vitest
  strip types without checking them, and `apps/api/tsconfig.spec.json` does not currently
  compile on its own. The site is the exception: its `tsconfig.json` includes `**/*.ts`,
  so `next build` checks its specs. A test that does not compile is still a test that
  passes, right up until it asserts against a shape that no longer exists.
- **Webhook ingestion, end to end.** Both signatures are pinned and both payload parsers
  are pinned, but nothing drives a recorded body through the controller and asserts the
  state transition, or that a second delivery of the same payload changes nothing. The
  maib callback has additionally never been delivered by the bank — the first real one
  will be the first end-to-end evidence that path works.
- **The seed itself**, as opposed to the decision it makes first, needs a database and has
  no coverage.

The earlier note that "the back office has a runner in name only" is no longer true and has
been removed: it has a config, 45 tests and a CI step. So is the note about the two Nx
scaffolding specs — they were deleted, as that note asked.

## Defaults for new tests

Follow these unless a specific case argues otherwise.

**Worth testing.**

- **Pure functions and mappers**, with no database and no Nest test module. The standing
  examples are `addWorkingMinutes` and `toPaymentState`; anything that computes money, a
  date or a deadline belongs here the day it is written, not later.
- **A guard's decision**, where the decision is a function of metadata and one request
  property. `roles.guard.spec.ts` uses a `Reflector` stand-in rather than a testing module,
  and that is the pattern.
- **Signature verification**, against recorded raw bodies. `verifySignature` in
  `calendly.service.ts` and `maib.service.ts` both hash exact bytes, and the two use
  different argument orders and encodings. A test with a captured payload and its real
  header is the only thing that catches a silent mismatch there.
- **Anything a three-language site renders**, in all three languages. A missing locale
  branch does not throw — it silently serves Romanian to a Russian reader, which is the
  failure mode `AGENTS.md` R3 exists to prevent and the one nothing else here catches.
- **The order of two refusals**, where the wrong order costs the user something.
  `totp-login-order.spec.ts` is the example.

**Not worth testing.**

- Generated code (`apps/api/src/generated/`), Prisma itself, NestJS wiring.
- Controllers that only delegate to a service.
- Presentational React components.

**Mocking policy: do not mock Prisma.** A mocked Prisma client asserts that the test author
understood the query, not that the query works. Test the pure logic without a database, and
let the migration check in CI cover the schema. If a service genuinely needs database
coverage, run it against a real Postgres rather than a mock. Where a service has to be
instantiated for a path that never queries — `totp-login-order.spec.ts` — hand it a client
that _throws_ on any access, so "no database was touched" is part of the assertion rather
than a claim in a comment.

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
