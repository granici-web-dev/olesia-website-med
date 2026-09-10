# Shape — the site publishes nothing it does not have

Written 2026-09-10 for `PLAN.md` step 10a, audit pass A1, per `AGENTS.md` R1.
Decisions come from `PLAN.md` §"Решения второго обхода".

**Status: approved 2026-09-10**, with the two decisions recorded under
"Decisions taken at approval" below.

## Goal

Nothing on the public site carries the doctor's name unless she wrote it or
entered it in the back office. Eight invented articles, eight invented weekly
menus and three unverified numbers stop being served, and the pages that held
them either say plainly that there is nothing yet or stop existing.

## What the code actually looks like now

Five things found while reading. Three of them change the plan.

1. **`/menus` is linked from two places, not three.** `Footer.tsx:23` and
   `sitemap.ts:27`. The home page composes `Hero · HowItWorks · Services ·
   Testimonials · About` and links no menus at all; `Nav.tsx` never did either.
2. **The sitemap and `/articles` are already on different sources**, and the
   sitemap is the honest one: it maps `api.posts()` (`sitemap.ts:71`), so today
   it declares zero articles while the page renders eight. After this change
   both read `api.posts()` and the sitemap's article block needs no edit — only
   the `/menus` entries and the `/menus` static path come out.
3. **The empty state already exists.** `BlogList` takes `emptyTitle`,
   `emptyBody`, `emptyCta`, `emptyCtaHref` and renders them when `posts.length
   === 0` (`BlogList.tsx:110`). `articles/page.tsx` currently passes four empty
   strings. This is copy to write, not UI to build.
4. **`Credentials.tsx` is imported by nothing.** `PLAN.md` 10a says "путь уже
   есть в `Credentials.tsx`" — the component exists (36 lines, olive band, it
   already returns `null` on an empty array) but no page renders it, and
   `api.about()` has no caller anywhere in the front end. The hero is the first
   consumer of `/about → stats`, not the second.
5. **`/menus` cannot survive as a gutted route.** Both pages import
   `PLACEHOLDER_MENUS`, which the decision deletes, and the listing's only other
   dependency, `MenuLibrary.tsx`, has no second consumer. Keeping the files
   means keeping 632 lines that no longer compile against anything.

## Approach

Three independent edits, in the order they can be checked:

1. **Articles.** Delete the placeholder branch and its data. `api.posts()` is
   the only source; an empty answer fills `BlogList`'s existing empty state in
   three languages; `[slug]` loses the placeholder fallback and `notFound()`
   already handles the rest.
2. **Menus.** Delete the two routes, `MenuLibrary.tsx` and
   `placeholder-menus.ts`; drop the footer link and its three i18n strings; drop
   `/menus` from `sitemap.ts`. Group-C deliverable copy on `/pricing`,
   `/services` and `/terms` — where a menu is a paid product, not a published
   article — is untouched.
3. **Hero numbers.** `Hero` reads `api.about()` and renders the **first three**
   entries of `stats`, in the order the back office holds them; with one or two
   it renders one or two; with none it renders no band at all. The three
   `home.hero.stats.*` blocks leave the JSON.

## Files

**Articles**

- `apps/frontend/app/[locale]/articles/page.tsx` — drop the `USE_LIVE` flag, the
  `usingLive` ternary, the placeholder imports (`PLACEHOLDER_POSTS`,
  `PLACEHOLDER_CATEGORIES`, `Bi`) and the `lc()` helper they needed; keep the
  live mapping, the API-derived categories and the age filter, both of which the
  live branch already builds. Fill the four empty-state strings, RO/EN/RU.
  Rewrite the header comment: it currently documents the fallback as a feature.
  −60 / +25
- `apps/frontend/app/[locale]/articles/[slug]/page.tsx` — drop
  `findPlaceholderPost`, `placeholderCategoryLabel` and the synthetic `post`
  object built from them. `const post = await api.post(slug); if (!post)
  notFound();` and the two `ph!` non-null assertions go with it. −28 / +3
- `apps/frontend/lib/placeholder-posts.ts` — **deleted**, 166 lines.

**Menus**

- `apps/frontend/app/[locale]/menus/page.tsx` — **deleted**, 428 lines.
- `apps/frontend/app/[locale]/menus/[slug]/page.tsx` — **deleted**, 204 lines.
- `apps/frontend/components/sections/MenuLibrary.tsx` — **deleted**, 155 lines.
- `apps/frontend/lib/placeholder-menus.ts` — **deleted**, 234 lines.
- `apps/frontend/components/layout/Footer.tsx` — one line out of
  `RESOURCE_LINKS`. −1
- `apps/frontend/i18n/messages/{ro,en,ru}.json` — `footer.resources.menus`
  out of each. −3
- `apps/frontend/app/sitemap.ts` — `/menus` out of `STATIC_PATHS`, the
  `PLACEHOLDER_MENUS` import and its `map` out of the return, `/menus/` out of
  `priorityFor`. −5

**Hero**

- `apps/frontend/components/sections/Hero.tsx` — `api.about()` joins the
  existing `Promise.all`; `STAT_KEYS` and the three `t('stats.…')` calls give way
  to `(about?.stats ?? []).slice(0, 3)`, localized through `loc()` (`labelRu`
  falls back to `labelRo`, as `Credentials.tsx` already does); the
  `styles.stats` block renders only when that array is non-empty. −6 / +12
- `apps/frontend/components/sections/Hero.module.css` — **no change.** `.stats`
  is already `display: flex` with a gap (`Hero.module.css:62`), and stays flex
  at every breakpoint (`:194`, `:219`, `:237` adjust the gap only, and `:237`
  adds `flex-wrap` under 480px). One or two entries therefore lay themselves out
  side by side with no rule to add; the earlier reading of this file as a
  three-column layout was wrong.
- `apps/frontend/i18n/messages/{ro,en,ru}.json` — the `home.hero.stats` block
  out of each, 5 lines apiece. −15

## Deleted

Five files, 1187 lines: `placeholder-posts.ts`, `placeholder-menus.ts`,
`MenuLibrary.tsx`, and both `/menus` routes. `placeholder-media.ts` stays — its
three entries are real, verifiable broadcasts (`PLAN.md` 10a).

## Schema / API changes

None. `GET /blog/published`, `GET /blog/published/:slug` and `GET /about` all
exist and are already typed in `packages/shared`. No migration.

## Test plan

**Unit (Vitest, `apps/frontend/lib/`), seam: exported helpers.** There is no new
pure logic here — the change is deletion plus two reads of an API that
`lib/api.ts` already wraps. Adding a test that asserts `PLACEHOLDER_POSTS` is
gone would test the compiler. `TESTING.md` says presentational components stay
out, and these are presentational.

**What actually proves it, run against a local API with an empty blog:**

1. `/ro/articles`, `/en/articles`, `/ru/articles` render the empty state with
   real copy in each language, and no article cards.
2. `/ro/articles/introducerea-alimentelor-solide` — a slug that existed only as
   a placeholder — returns 404, in all three locales.
3. Seed one post through the back office: it appears on the listing, its
   category chip comes from the API, its page opens, and `sitemap.xml` lists it.
4. `/ro/menus` and `/ro/menus/meniu-1-3-ani` return 404.
5. `sitemap.xml` contains no `/menus` URL and no `/menus/` URL.
6. `grep -rn "menus" apps/frontend/components apps/frontend/i18n` returns only
   the group-C deliverable copy on `/pricing`, `/services` and `/terms`.
7. Home page with `AboutPage.stats` empty: no numbers band, and the layout below
   the CTAs does not collapse oddly. With one and with two stats entered in the
   back office: exactly those render, side by side, in the right language, with
   the RU → RO fallback, at 1440, 768 and 375 px. With four entered: the first
   three render and the fourth does not, on the home page only — `Credentials.tsx`,
   when a page finally mounts it, still shows all four.
8. `pnpm nx build @olesia/frontend` and both typechecks stay green — `next
   build` runs `tsc`, which is what catches a missed import of a deleted file.

## Tradeoffs / alternatives considered

- **Keep the `/menus` routes and call `notFound()` at the top**, which is how
  `PLAN.md` phrases it. Rejected: the visitor-visible result is identical (a
  localized 404), and the cost is 632 lines that import a deleted module and
  therefore have to be gutted to compile. What that preserves is the design, and
  git preserves the design already — the files come back with one `git revert`
  when the menus module exists, alongside the prototypes in
  `apps/frontend/origin/`. Dead code that cannot run is the thing `PRINCIPLES.md`
  says not to leave behind.
- **A `MENUS_ENABLED` flag.** Rejected on the same rule: a feature flag with one
  setting, guarding a page with no data source, is a shim for a decision already
  made.
- **Keep the placeholders behind an env var for design review.** Rejected: this
  is exactly the arrangement being removed. `USE_LIVE = false` was meant to be
  temporary too, and it shipped to production and stayed there.
- **Serve the hero numbers from the i18n JSON until the client confirms them.**
  Rejected: those are the numbers she has not confirmed. `PRINCIPLES.md` requires
  a placeholder to be visibly derived rather than remembered, and an empty
  `stats` array is exactly that — the band reappears the moment she fills it in,
  with nobody remembering to flip anything.
- **Redirect `/menus` to `/pricing`**, where menus are sold as a group-C
  deliverable. Rejected: a 301 from a URL Google may have indexed as editorial
  content to a price list is a different page, not a moved one. 404 is the honest
  answer, and `PLAN.md` still lists "will this section exist at all" as an open
  question for the client.

## Decisions taken at approval

Approved 2026-09-10. The two questions this shape raised were answered as
follows; both are now part of the approved scope, and the sections above are
written to match.

1. **`/menus` is deleted, not gutted.** Both routes, `MenuLibrary.tsx` and
   `placeholder-menus.ts` go entirely — the proposal in "Tradeoffs" is the
   decision. Git and `apps/frontend/origin/` keep the design; the route answers
   a localized 404 because it no longer exists, which is what `PLAN.md` 10a
   asked for. Nothing is left behind that imports a deleted module.
2. **The hero renders the first three `AboutStat`s, in the back office's own
   order.** One or two must read as deliberate rather than as a three-column
   layout missing a column, which the flex row already gives: `.stats` is
   `display: flex` with a gap at every breakpoint (`Hero.module.css:62`, `:194`,
   `:219`, `:237`), so two entries sit side by side at their own width and one
   sits alone under the rule. No CSS rule is added — the requirement is met by
   what is there, and the craft verifies it at 1440, 768 and 375 px instead of
   writing a new one. Zero entries render no band at all. A fourth entry is not
   shown on the home page; the hero takes three by `slice(0, 3)` rather than
   growing the band, because the row shares its width with the portrait. The
   client controls the count, and the band reappears the moment she fills the
   first one in.

## Open questions

1. **`Credentials.tsx`**, unused, and `api.about()`, uncalled until this change.
   Out of scope here; it is dead code for pass A6 (`PLAN.md` 10e) to sweep. Noted
   so it is not mistaken for something this change orphaned.
2. **Whether a menus section exists at all** is still the client's to answer
   (`PLAN.md` §"Ждём от клиента"). This change does not decide it — it removes
   what was invented, and the module comes back when there are real menus.

## Verified 2026-09-10, against a local API and Postgres

`pnpm nx serve api` on `localhost:3333`, the production build of the site on
`localhost:3010`, the blog emptied by moving its one seeded post to `draft` and
put back afterwards. Each numbered check is the one above.

1. **Empty state, three languages — pass.** `/ro/articles`, `/en/articles` and
   `/ru/articles` all answer 200 and render "Primele articole vin în curând" /
   "First articles are coming soon" / "Первые статьи скоро появятся" with the
   matching CTA, and zero links to an article.
2. **Placeholder slugs 404 — pass.** `/{ro,en,ru}/articles/introducerea-alimentelor-solide`
   all 404, as does the draft `diversificare`.
3. **A real post, published — pass.** The listing links it twice (featured card
   and heading), the category chip reads `Nutriție` from the API, the article
   page answers 200 with its own `<h1>`, and after the ISR minute `sitemap.xml`
   carries `/ro/articles/diversificare` — 17 URLs against 16 with an empty blog.
4. **`/menus` — pass.** `/ro/menus`, `/en/menus`, `/ru/menus` and
   `/ro/menus/meniu-1-3-ani` all 404.
5. **Sitemap — pass.** No `/menus` and no `/menus/` URL, in either state.
6. **Grep — pass.** `grep -rn "menus" apps/frontend/components apps/frontend/i18n`
   returns one line: the group-C comment in `OrderDeliverableButton.tsx`. Widened
   to the whole app, what is left is the group-C deliverable copy on `/pricing`
   and `/terms` and two comments about it.
7. **The hero band — pass, at four, two, one and zero stats.** Four in the
   database render the first three, the fourth dropped. Two render side by side
   at 1440, 768 and 375 px (`display: flex`, gap 32px at 768), and read as
   deliberate rather than as a gap; one sits alone under the rule; zero render no
   band, no rule, and the column simply ends after the CTAs with the portrait
   beside it. Localization behaves as specified: a `labelRu` is used on `/ru`,
   and an entry without one falls back to Romanian in the same band.
8. **Compiler — pass.** `pnpm nx build @olesia/frontend` green (no `/menus` in
   the route table), `tsc --noEmit` clean on the site and the back office,
   `nx test api` and `nx test @olesia/frontend` green.

**One correction to this document.** "The empty state already exists … `articles/page.tsx`
currently passes four empty strings" was half right: the empty-list branch already
carried real copy in three languages, and only the second `BlogList` — the filtered
grid, which never sees an empty list — passed the empty strings. Both now read one
`emptyState` object, so the copy exists once.
