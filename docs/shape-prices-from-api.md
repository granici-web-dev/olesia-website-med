# Shape — service prices come from the API

Written 2026-09-10 for `PLAN.md` step 8, per `AGENTS.md` R1.
**Approved 2026-09-10**, with the three open questions decided below.

## Goal

Editing a price in the back office changes it on the site within a minute, and no
euro figure for a group-A or group-B service survives anywhere in the front end.

## What the code actually looks like now

Four things the brief did not say, found while reading. Two of them change the plan.

1. **Prices live in six places, not four.** The two extra ones:
   - `FALLBACK_SERVICES` in `pricing/page.tsx` (lines 24–74) — a full 55-line
     `ServiceDto[]` mirror of the seed, prices included, served whenever
     `api.services()` comes back empty. This is the worst copy in the repo: it renders
     a complete, authoritative-looking tariff table out of a constant, which is exactly
     the lie this step exists to remove.
   - `SERVICE_CATALOG` in `packages/shared` — seeds the database and is read by the back
     office for the monitoring price. Its comment calls it "a safe fallback for the
     public site"; the site has never read it. The comment is wrong, not the code.
2. **The five service pages show no price at all.** `pediatrics`, `nutrition`,
   `integrative`, `monitoring`, `quick-question` display durations only inside prose
   ("apelul video de 30 de minute") and monitoring's "price is set individually". There
   is nothing to convert there, and adding a price block to five pages is a design
   change, not this step.
3. **`Services.tsx` already fetches.** It is already an async server component calling
   `api.services()` for the Calendly URL map. Only price and duration still come from
   i18n.
4. **`quick_question.priceLabel*` is not a price.** The seed holds `price: 8` together
   with `priceLabelRo: '~1 h · răspuns scris'`. Under the agreed rule that a label
   overrides the number, EXPRESS would stop showing **8 €** and start showing its
   duration in the price slot. Decided below: the label is cleared.

## Approach

One formatter, `apps/frontend/lib/service-price.ts`, owns every price and duration
string the site renders. Both surfaces that show prices read the API through it:
`Services.tsx` (already fetching) and `/pricing`. Group C keeps local trilingual copy
but takes its numbers from `DELIVERABLE_CATALOG`, so the five euro figures duplicated
on `/pricing` disappear. Every numeric fallback is deleted; when the API says nothing,
the site says nothing.

### 1. The formatter

Three exports, all pure:

```ts
formatEur(locale, amount): string                       // 28 → "28 €"
formatServicePrice(locale, service): string | null      // null = nothing to show
formatServiceDuration(locale, durationMin): string | null
```

`formatServicePrice` in order: the locale's `priceLabel*` through the existing `loc()`
(which already treats `''` as missing and falls back RU → RO) wins if non-empty; then
`price === 0` → `la cerere` / `on request` / `по запросу`; otherwise `formatEur`.
`formatServiceDuration` returns `null` for `null` minutes, `"90 min"` / `"90 мин"`
below 120, and hours above (`"2 h"` / `"2 ч"`) — no service is there today, so this is
one branch, not a unit system.

**`null` means "we do not know", and every caller renders nothing for it.** No caller
may substitute a number. That is the whole point of the step, and it is why the return
type is nullable rather than a string with a default.

### 2. How the home page gets its services

`Services.tsx` keeps its own `api.services()` call rather than taking a prop from
`page.tsx`. It already makes that call for the Calendly URLs, Next dedupes an identical
fetch inside one render, and threading a prop down would split the section's data
between two files for no gain — the component would still need the list it already has.
The tile stays self-contained; the page keeps knowing nothing about services.

The nutrition tile is one tile over two services (`nutrition_copii`, `nutrition_adulti`,
both 38 € / 60 min today). Rule: when the split services agree, show the shared value;
when they diverge, show `de la {min} €` / `from` / `от`. Cheap, and it stops the tile
lying the day the client prices children and adults differently.

### 3. When the API is silent

`revalidate = 60` already gives us the honest version of "keep the last known answer":
a failed revalidation serves the last good render, so a tunnel that drops for an hour
changes nothing a visitor sees. What is left is the genuinely cold case — a fresh
deploy that has never reached the API.

There, the site shows no price rather than a remembered one:

- **`/pricing`** — `FALLBACK_SERVICES` is deleted. With no services, the group-A/B
  section renders a short trilingual line saying the tariffs are momentarily
  unavailable, with a link to `/contact`. Group C still renders (its numbers are local
  by design) and so does the free-consult block.
- **Home page** — tiles render as today from i18n titles and tags, minus the price and
  duration lines.

Booking controls stay live in both cases. A visitor who cannot see a price can still
reach the doctor, and an empty price beats an invented one.

### 4. What gets deleted

| Removed | Where | Lines |
|---|---|---|
| `SERVICE_PRICE_META` + its use | `lib/service-content.ts`, `pricing/page.tsx` | ~28 + ~15 |
| `FALLBACK_SERVICES` | `pricing/page.tsx` | 55 |
| `DELIVERABLES` price field | `pricing/page.tsx` | 5 figures |
| `items.*.price`, `items.*.duration` | `i18n/messages/{ro,en,ru}.json` | 10 keys × 3 |

`SERVICE_DESCRIPTIONS` and `SERVICE_INCLUDED` stay — they are copy, not prices, and the
client has no back-office field for them.

Group C becomes `DELIVERABLE_COPY: Record<DeliverableProduct, {tag, title, desc}>` on
the page, rendered by mapping `DELIVERABLE_CATALOG` and formatting `priceEur` through
`formatEur`. Copy stays on the front end; the number comes from the same constant the
API already stamps onto an order, so the page and the order confirmation can no longer
disagree. Making group C editable is deliberately still out of scope.

## Files

| File | Change | ~Lines |
|---|---|---|
| `apps/frontend/lib/service-price.ts` | new — the formatter | +45 |
| `apps/frontend/lib/service-price.spec.ts` | new — its tests | +70 |
| `apps/frontend/vitest.config.mts` | new — test runner for the site | +12 |
| `apps/frontend/components/sections/Services.tsx` | price/duration from the API, split rule | +30 / −4 |
| `apps/frontend/app/[locale]/pricing/page.tsx` | drop both constants, use the formatter, empty state | +35 / −135 |
| `apps/frontend/lib/service-content.ts` | drop `SERVICE_PRICE_META` | −28 |
| `apps/frontend/i18n/messages/{ro,en,ru}.json` | drop 10 keys each | −30 |
| `packages/shared/src/lib/service-catalog.ts` | correct the "fallback for the site" comment | ±3 |
| `apps/api/prisma/seed.ts` | `quick_question.priceLabel*` → `null` | ±3 |
| `PRINCIPLES.md` | drop the "prices are hardcoded" known-debt bullet | −6 |
| `.github/workflows/ci.yml` | run both suites on every PR | +6 |
| `STACK.md`, `TESTING.md` | record the site's test runner and that CI runs the tests | +12 |

Net: about 150 lines removed.

## Schema / API changes

None. `GET /services` already returns `price`, `durationMin` and `priceLabelRo/En/Ru`,
and the back office already edits all four. One **data** edit goes with it (decision 1),
not a schema one.

## Test plan

Seam: the three exported functions of `apps/frontend/lib/service-price.ts`. Vitest,
because the site has no runner and the back office's is unused — the dependency is
already in the tree at 4.1.8, so this is one config file, not a new tool. A money
formatter is precisely what `TESTING.md` says must be covered the day it is written.

`service-price.spec.ts`:

- `formatEur` renders 28, 38, 58, 8 and 0 in all three locales.
- `formatServicePrice` returns the `priceLabel` for the locale when set, for each of ro
  / en / ru, and falls back RU → RO when `priceLabelRu` is null.
- `price: 0` with no label returns `la cerere` / `on request` / `по запросу`.
- `price: 0` **with** a label returns the label — monitoring's real shape.
- `formatServiceDuration` returns null for null, `30 min` / `30 мин`, and `2 h` / `2 ч`
  at 120.
- An unknown locale string falls back to Romanian, matching `loc()`.

Manual, once: change `pediatric` from 28 to 29 in the back office, wait past the 60-second
window, confirm the home page and `/pricing` both show 29 in all three locales, then set
it back. Second manual pass: stop the API, load `/pricing` cold, confirm the notice
renders and no number appears.

**CI runs both suites from now on.** Two steps after the typechecks in
`.github/workflows/ci.yml`: "Test API" (`pnpm nx test api`) and "Test frontend"
(`pnpm nx test @olesia/frontend`). `TESTING.md` has been recording "CI does not run the
tests" as an unjustified gap since the suite existed; adding the site's first tests
without wiring them to CI would widen the same gap rather than close it. Both suites run
in about a second.

Not tested: the two page components. `TESTING.md` rules out presentational React, and
the manual pass covers the wiring.

## Tradeoffs / alternatives considered

**Keep a title-only offline fallback on `/pricing`** (services and booking links, no
prices) instead of an empty state. Rejected: a row with a Book button and no price
invites a visitor to book something whose cost we are refusing to state, which is a
worse failure than a clear "temporarily unavailable". Reconsider if the client demos the
site cold often enough for it to matter.

**Put the formatter in `packages/shared` and test it with the API's Jest** (one `roots`
line in `jest.config.cts`, no new runner). Rejected: the formatter is site-only — it
speaks three locales, and the back office is Romanian-only with its own formatting.
Putting presentation into the DTO package to borrow a test runner is the tail wagging
the dog, and `pnpm nx test api` would silently own tests for code the API never calls.

**Make `priceLabel` override the number only when `price === 0`**, which would preserve
EXPRESS's "8 €" and its "~1 h" line with no data edit. Rejected: it makes one back-office
field mean two different things depending on another field's value, and nothing in the
admin UI would explain that. A field that behaves differently based on a neighbour is how
the client eventually types something that silently does nothing.

## Decisions (2026-09-10)

1. **EXPRESS keeps its price.** `priceLabelRo/En/Ru` for `quick_question` are cleared in
   `seed.ts` and in the live row, so `/pricing` reads **8 €** and the duration slot stays
   empty. The "~1 hour during working hours" promise stays where it already lives: the
   service description and the EXPRESS page.
2. **Vitest goes in now**, as part of this step, and CI gains a step for each runner.
3. **`monitoring` is left alone.** Its `priceLabel*` and its `price: 0` produce the same
   words; the label is the client's to edit and beats a string we compiled in.
