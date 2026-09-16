# Shape — the group-C catalog moves into the database

Written 2026-09-16 for `PLAN.md` step 18, per `AGENTS.md` R1. Follows decision 8c
(closed 2026-09-16): the catalog stays an enum, and what she edits is the five
products that already exist.

## Goal

Changing the price or the name of a menu or a protocol in the back office shows up
on `/pricing`, on its checkout page and on the next order, without a deployment.
No euro figure and no product name for group C survives in compiled code.

## Decision: a separate table, not rows in `Service`

`DeliverableCatalog`, keyed by the `DeliverableProduct` enum, five rows.

Putting them into `Service` under a new `C_deliverable` group was the tempting
option: the CRUD, the back-office page and the public endpoint already exist. It
loses on two counts, and the first is the expensive one.

1. **The services catalog is read in eleven places and none of them expects a
   menu.** Nine on the site — `Services.tsx`, `FreeConsult.tsx`, `lib/calendly.ts`,
   `/pricing`, the checkout page and the four service pages — and two in the back
   office, `features/services/api.ts` and `features/appointments/api.ts`. Each would
   have to learn to filter the new group out, and audit A4
   (`docs/audit-2026-09-10.md`) is the record of what happens when a flag has to be
   remembered: of the four readers that had to filter on `active`, three did not, so
   a deactivated service kept its homepage tile and its booking button. Adding a
   group that every reader must skip is that bug with a new name.
2. **Half the `Service` row is meaningless here.** `durationMin`,
   `calendlyEventTypeUri`, `calendlySchedulingUrl`, the three `priceLabel*` columns.
   `ServicesService.remove` guards on appointment and subscription counts, which a
   deliverable has neither of; `CODE_META` in the back office maps every code to a
   group and a duration. Each of those becomes a branch on `group`.

A separate table costs one module and one back-office section — the shape every
other editable entity here already has, and what `PRINCIPLES.md` means by "anything
the client wants to change gets a module, not a constant".

**No foreign key from `DeliverableOrder.product`.** The column is already the same
enum, so the constraint would add nothing the enum does not guarantee, and it would
force the five rows into the migration instead of the seed.

## Schema

```prisma
model DeliverableCatalog {
  code      DeliverableProduct @id
  priceEur  Int
  titleRo   String
  titleEn   String
  titleRu   String
  sortOrder Int                @default(0)
  active    Boolean            @default(true)
  updatedAt DateTime           @updatedAt
}
```

The code is the primary key, as `SiteMedia.key` is: there are exactly five rows,
they are never created or deleted, and nothing needs a surrogate id. All three
titles are non-null, because we write these five ourselves and all fifteen strings
already exist in `lib/deliverable-content.ts`. `Service.titleRu` is nullable under
`AGENTS.md` R3, which is a rule and not a defect: content the client fills herself
is RO and EN required, `*Ru` optional with a RU → RO fallback. `sortOrder` replaces
what array order gave the constant for free. `active` is how she stops selling a
product without a developer; the public endpoint filters on it so that no reader
has to.

**The migration adds a table and drops nothing.** Orders already snapshot `titleRo`
and `priceEur` at the moment of ordering, so history neither moves nor changes, and
a later price edit still cannot rewrite what somebody paid. The five rows arrive
through the seed (`seedDeliverables`, idempotent like `seedServices`), not through
the migration.

## API

New module `apps/api/src/app/deliverables/`:

- `GET /deliverables` — public, active only, sorted. What the site reads.
- `GET /deliverables/all` — admin/editor, the whole table. The split `services` and
  `materials` already use.
- `PATCH /deliverables/:code` — admin/editor. Price, three titles, `sortOrder`,
  `active`. No `POST`, no `DELETE`: the enum is the catalog.

`deliverable-price.ts` is the pure seam, modelled on `materials/material-price.ts`
for the same reason — this is the last point at which a price is our own data and
the first at which getting it wrong charges the wrong money:

```ts
deliverablePrice(row: { active: boolean; priceEur: number }):
  { amount: number } | { refusal: string }
```

Refusals: `deliverable_not_for_sale` for an inactive row, `price_on_request` for 0.
The bank's own floor stays in `checkoutAmount`, one rule in one place for all three
purchases. `leads.service.ts` and `deliverable-orders.service.ts` both replace
`deliverableEntry(dto.product)` with a lookup on this table plus this function;
neither reads a price from the request body, which is what they do today from the
constant.

## Site

`api.deliverables()` joins `api.services()` in the `/pricing` fetch. An empty list
renders the existing `t.unavailable` line, the same honest answer the group-A/B
block gives. The checkout branch for `deliverable` stops calling `deliverableEntry`
and does what the `express` branch beside it already does: fetch the catalog, find
the code, return `null` for anything unknown or inactive, which the page renders as
a 404.

`lib/deliverable-content.ts` keeps `tag` and `desc` and loses `title` — the title is
now a column, and two sources for one string is how they drift.

## Back office

The five rows get a card on the existing **Servicii** page rather than a nav entry
of their own: "what I sell and for how much" is one place to look, and five rows that
cannot be created or deleted do not earn their own route. The table and its edit
sheet live in `features/deliverables/`, so `pages/services.tsx` grows by about ten
lines.

`order-form-sheet.tsx` builds its select and its zod enum from the query instead of
the constant. The price stays off that form; it is still stamped server-side.

## Files

**API** — `prisma/schema.prisma`; a generated `CreateTable` migration;
`app/deliverables/{deliverables.module,controller,service,mapper,deliverable-price}.ts`,
`dto/update-deliverable.dto.ts`, `deliverable-price.spec.ts`; `app/app.module.ts`;
`app/leads/{leads.service,leads.module}.ts`;
`app/deliverable-orders/{deliverable-orders.service,deliverable-orders.module}.ts`;
`seed/seed-deliverables.ts` (new), `seed/seed.ts`.

**Shared** — `lib/deliverables.ts` and `lib/deliverables.spec.ts` deleted;
`lib/dto.ts` gains `DeliverableCatalogDto` and `PublicDeliverableCatalogDto`;
`index.ts`; the stale comment on `DeliverableProduct` in `lib/enums.ts`.

**Site** — `lib/api.ts`, `lib/deliverable-content.ts`,
`app/[locale]/pricing/page.tsx`, `app/[locale]/checkout/[...target]/page.tsx`.

**Back office** — `features/deliverables/{api,types,query-key}.ts`,
`deliverables-card.tsx`, `deliverable-form-sheet.tsx` (all new);
`pages/services.tsx`; `features/orders/order-form-sheet.tsx`; `i18n/ro.ts`.

## What this deliberately does not do

- **No new products.** The enum stays five codes. A sixth needs its own page, its
  own copy and its own checkout, which is decision 8c and not this step.
- **The marketing copy stays in code.** `tag` and `desc` on `/pricing` are
  copywriting, they carry no number, and nothing in them goes stale when a price
  changes. Moving them is a separate step if she asks.
- **No price history and no scheduled price change.** The order row already holds
  what was charged; a "from 1 October" price is a feature nobody asked for.
- **`Service` is not touched.** No new group, no merged enum, no migration on the
  services table.
- **The e2e spec is not extended.** It covers the EXPRESS path; group C is already
  a hand-run acceptance point (`docs/plan-log.md`, step 12c).

## How it is verified

- **New unit tests.** `deliverable-price.spec.ts`: an inactive row refuses, `0`
  reads as on-request and not as free, a priced active row gives the amount, and a
  row priced at 1 € is refused by `checkoutAmount` rather than by the bank — the
  four cases `material-price.spec.ts` pins, because this is the same seam.
  `deliverables.mapper.spec.ts`: the public shape drops `active` and keeps all three
  titles. The five deleted assertions in `deliverables.spec.ts` are replaced by the
  database: an unknown code is now a lookup miss, not a missing array entry.
- **CI.** The migration job applies the new table to a clean Postgres and diffs the
  schema; three typechecks catch every reader of the deleted export; the formatting
  check; the whole suite.
- **By hand, the step's own criterion.** Change the 7-day menu from 28 € to 31 € in
  the back office; within a minute `/pricing` shows 31 € in all three languages,
  `/checkout/deliverable/menu_7` shows 31 €, and an order placed there is written
  with `priceEur: 31` while an order placed before the change still reads 28.
  Deactivate a protocol: it leaves `/pricing`, its checkout URL answers 404, and it
  leaves the back office's order-form select.
- **Grep.** No `DELIVERABLE_CATALOG`, no `deliverableEntry`, and no group-C euro
  figure anywhere outside `seed-deliverables.ts`.

## Open questions

1. **`active` is one column beyond "price and titles".** It is here because
   otherwise withdrawing a product needs a developer, and the checkout needs an
   "this is not on sale" branch regardless. Say so if you would rather keep the
   change to price and titles only.
2. **Card on Servicii, or its own nav entry?** Written as a card. If you expect her
   to look for menus under their own heading, it is a two-line change now and an
   awkward one later.
