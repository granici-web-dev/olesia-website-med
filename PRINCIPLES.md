# PRINCIPLES.md

Engineering posture for `olesia-website-med`. Reverse-engineered from the code on
**2026-09-10** and corrected against the repository by the maintainer. This describes what
the project *is*, not what it aspires to be. Re-run `/rigorous document` when the posture
shifts materially.

Procedural rules (read order, file naming, styling, i18n keys, commit format) live in
`AGENTS.md`, and `CLAUDE.md` carries project orientation. This file covers judgment, not
procedure. Where the two disagree, see "Known divergences" at the end.

---

## Engineering posture

- **The main risk is shipping something untrue, not shipping slowly.** This is a single
  doctor's practice handling patient health data and, soon, money. A wrong price, an
  invented testimonial, or a leaked document costs more than a late feature.
- **Design properly the first time, in small pieces.** Features land as vertical slices
  with a `docs/shape-<slug>.md` written first (`AGENTS.md` R1). Carve-outs: typos, i18n
  copy, dependency bumps.
- **The compiler is the safety net.** With almost no test suite, TypeScript strictness and
  the CI build are what catch regressions. That is a deliberate trade, and it is why the
  escape hatches below are effectively banned.

## Abstractions

- **Rule of three.** Extract a helper or component only at the third occurrence
  (`AGENTS.md` R6). Two near-identical blocks beat a premature abstraction.
- **No interfaces with one implementation.** The codebase has none. Interfaces describe
  data shapes (DTOs, API payloads, webhook bodies); they are not seams for swapping
  implementations that do not exist.
- **Concrete classes are the default in the API.** NestJS services and controllers are
  concrete. Note that class count is not evidence of anything on its own: 52 of the
  API's classes are DTOs, because `class-validator` requires classes.
- **One module per domain.** `apps/api/src/app/<domain>/` with its own module, service,
  controller, DTOs and mapper. The back office mirrors it as
  `src/features/<domain>/{types,api,mock,data,query-key}.ts` plus `src/pages/<name>.tsx`,
  where `data.ts` is the `USE_MOCKS` switch between the mock and the real client.

## Comments and naming

> **This section overrides the default "zero comments" policy.** Do not strip these
> comments during `simplify`, `critique`, or `refactor`. They are load-bearing.

- **A comment carries provenance.** The house style is a comment that says *why*, and
  points at where the decision came from: `module_calendly.md §8.4`,
  `client answers v2 §10`, `brief §11.14`, `decided 2026-07-01`, `corrected 2026-08-04`.
  A reader six months from now needs the source, not a restatement.
- **Density is low and deliberate.** Roughly 12% of API lines, 3% in the back office, 5%
  in frontend components. Most files have none; the ones that do, earn it.
- **WHAT-comments are banned.** If a comment paraphrases the line under it, delete the
  comment and fix the name.
- **Long, specific names.** No abbreviations in identifiers. A name that needs a comment
  to be understood is the wrong name.
- **Named exports for components.** One default export exists outside the Next.js pages
  that require them, `apps/back-office/src/app/app.tsx`. Everything else is named.

## Error handling and validation

- **Validate at boundaries, nowhere else.** `class-validator` DTOs on every HTTP entry
  point in the API (31 files); `zod` on the two front ends for forms (12 files). Internal
  calls trust the type system: no defensive `if (!arg) return` in helpers.
- **Throw, do not catch.** 17 `try/catch` blocks across 158 hand-written API files, all at
  real boundaries: third-party calls, JSON parsing of untrusted bodies, filesystem. Inside
  business code, throw `NotFoundException` / `BadRequestException` and let Nest's built-in
  exception filter answer. There are no custom `@Catch` filters, and none are wanted.
- **A swallowed error must say why it is swallowed.** The few `catch {}` blocks that
  continue carry a comment explaining the fallback (best-effort logout, bank unavailable
  and the sweep will retry).
- **No escape hatches.** Zero `any`, zero `@ts-ignore` in hand-written code. Three
  `as unknown as` casts exist in committed code, in two places: the JSON `days` column in
  `working-hours.service.ts`, and the raw text response in
  `apps/back-office/src/api/http.ts`. Both are points where a value leaves the type system
  entirely. A fourth needs a reason in a comment.

## Truthfulness of content

- **Never invent content a visitor will read.** Testimonials, years of experience, quotes,
  certifications, case numbers: it either came from the client or it does not ship. This
  project has removed fabricated reviews twice
  (`docs/brief-changes-2026-06-24.md`); it is the single most expensive recurring mistake
  made here.
- **A placeholder must be visible, and derived rather than flagged.** The draft banner on
  `/gdpr` and `/terms` renders for as long as the entity fields in
  `apps/frontend/lib/legal-entity.ts` are empty, so it cannot be left switched on by
  accident once the real data arrives. Working hours use the same pattern: provisional
  until a real schedule is saved. Build placeholders this way, not behind a boolean
  someone must remember to flip.
- **Do not assert a legal or regulatory number you have not verified.** Retention periods,
  statutory deadlines and entity data stay as "the period required by law" until the
  client's lawyer fills them in.

## The client edits her own content

This follows from the custom-CMS decision in `STACK.md`, and it explains a large share of
the code here.

- **Anything the client wants to change gets a module, not a constant.** Every entity she
  asked to control has an API module in `apps/api/src/app/<domain>/` and a page in
  `apps/back-office`: services, blog, about, contacts, FAQ, testimonials, media
  appearances, library materials, site media, working hours. She edits them herself,
  without a developer and without a deployment.
- **Reach for the module before reaching for a hardcoded value.** When new editable content
  appears, the default is a table plus a back-office page, not a constant someone has to
  ship a release to change.
- ⚠️ **Known debt: prices are still hardcoded on the front end.** `/pricing` and the home
  page read `SERVICE_PRICE_META` and the i18n JSON rather than the API, so editing a price
  in the back office does not change the site. This is the clearest violation of the rule
  above and the first thing to fix when prices next move.

## Sensitive data

- **Medical files never sit on a public route.** They are stored under UUID names in
  `PRIVATE_UPLOADS_DIR` and streamed only to an authenticated staff member.
- **Unknown, expired and revoked tokens answer identically.** A patient upload link that
  does not exist and one that was revoked both return 404. Distinguishing them leaks
  whether a link ever existed.
- **PII stays out of logs and URLs.** Log identifiers, not names, emails or diagnoses.
  Public status endpoints return a state, never the payer.

## Discipline

- **`docs/` is the decision log.** Decisions are dated, and corrections are written as new
  entries ("the earlier note was wrong, corrected on <date>"), never by silently editing
  history. Code points at `docs/`; `docs/` is not rewritten to match code.
- **Migrations are generated, then hand-corrected when generation would lose data.**
  18 of 23 come straight from `prisma migrate dev` (`-- CreateEnum`, `-- AlterTable`
  markers). Five were written or amended by hand (`faq_module`, `testimonials_module`,
  `post_age_keys`, `scalar_list_defaults`, `nutrition_split`), and each opens with a
  comment explaining what the generated SQL would have destroyed. `prisma db push` is
  never used.
- **Commits: type, optional scope, subject as a finished sentence about the outcome.**
  64 of 114 commits carry a scope (`feat(frontend):`, `fix(frontend):`), and the
  non-standard types `content` and `i18n` are in regular use. Scopes lapsed over the last
  ~25 commits as work moved into `api` and `back-office`; restoring them is welcome, not
  required. Subject ≤ 72 chars, body explains why.
- **The TODOs in the tree are litter, not a backlog.** 22 lines, almost all
  `TODO(api)` / `TODO(shared)` markers in the back office's `mock.ts` and `types.ts` files,
  left over from spring and long since done. They should be deleted, not worked through.
  A new TODO needs a plan next to it or it does not go in.
- **`apps/frontend/origin/` is read-only.** Reference design prototypes. Read them,
  never edit them (`AGENTS.md` R2).

## Known divergences from AGENTS.md

Recorded because pretending they do not exist is how the next agent gets it wrong.

- **R3 says every user-facing string goes through `next-intl`.** In practice 38 files use
  inline `locale === 'ru' ? … : en ? … : ro` ternaries against 7 that use `next-intl`.
  The ternaries are the dominant pattern; all three branches must be kept in sync by hand.
- **§3's file-naming table still lists Sanity query files.** Sanity was dropped in favour
  of the custom NestJS content API. There are no `*.query.ts` files.
- **§7 shows scoped commits.** The most recent ~25 commits have no scope. See above.
- **R1 requires a `docs/shape-<slug>.md` before non-trivial work.** There is not a single
  shape file in `docs/`. The work to date was done without them; the first one will come
  out of `/rigorous shape`.
