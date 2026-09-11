# Shape — deliverables and paid materials, through the same checkout

Written 2026-09-11 for `PLAN.md` step 12c, per `AGENTS.md` R1. Builds directly on
`docs/shape-express-checkout.md`, which is both the precedent and the machinery:
`intentKey`, `resolveIntent`, `persist()` with fulfilment by target type, the
receipt, the return pages. Read that one first; this document only records what
is different.

**Status: approved 2026-09-11.** The four open questions below were decided with
the approval and are recorded there; `PLAN.md` step 12 carries the same four.

## Goal

The two remaining payable things on the site are bought the way the EXPRESS
question already is: a group-C order is invisible to the doctor until it is paid
and hands the buyer an upload link the moment it is, and a paid library material
is a file the buyer downloads through a token that belongs to them rather than a
PDF sitting on a public URL with a price written next to it.

## What the code actually looks like now

Five things found while reading. Three of them change the plan.

1. **The paid PDFs are on the public route.** `toPublicMaterialDto` withholds
   `fileUrl` for a paid material, and the mapper's own comment says why that is a
   stopgap: the file is in the same public `/uploads` directory as the free ones,
   so the URL *is* the file. Withholding a URL is not access control, it is
   obscurity with a comment apologising for itself. All four paid materials
   currently have `fileUrl: null`, so nothing is exposed today — the fix is
   cheap now and expensive the week after the client uploads a file.
2. **`POST /leads/deliverable` creates a payable order that nothing charges for.**
   It is the only way a group-C order is created, and the back office has no
   create form. Once the checkout exists, that route is a public door that makes
   an unpaid order the doctor sees and works on. It goes, along with
   `LeadsService.createDeliverable` and `submitDeliverableLead` on the site.
3. **`PaymentsService` is about to acquire two more collaborators.** It already
   holds Prisma, maib, working hours and mail. The deliverable branch needs
   `uploads`, the material branch needs the grant. `docs/shape-express-checkout.md`
   named exactly this as the trigger to split fulfilment out of the service, so
   this step spends it: the post-commit half moves to
   `payments/fulfilment.service.ts` and `PaymentsService` keeps the in-transaction
   mirror writes it already has.
4. **`UploadsService.linkForOrder` already re-issues rather than duplicating**,
   and `savePrivateDocument` already stores a 20 MB PDF outside the public tree
   under a UUID key. Both are reused as they stand; the material file needs no
   new storage primitive.
5. **`/terms` already carries the refund policy for all three purchases**
   (consultations, EXPRESS, menus/protocols, library materials), written for the
   acquirer's compliance review. Nothing to add there.

## Approach

**One checkout page, three purchases.** `app/[locale]/checkout/[...target]/page.tsx`
serves `/checkout/express`, `/checkout/deliverable/<product>` and
`/checkout/material/<slug>`. It reads the summary from whichever catalog prices
that target, renders the same payer block, terms checkbox and currency notice,
and submits to the route for its kind. `/quick-question/checkout` becomes a
redirect. The API keeps **three** routes rather than one discriminated body:
each one validates exactly its own fields with a plain `class-validator` DTO and
carries its own captcha action, which is the shape the other five public routes
already have.

**A group-C order is an EXPRESS ticket with a different noun.** New
`DeliverableOrderStatus.awaiting_payment`, created before the redirect, invisible
in the doctor's list, activated by the same conditional `updateMany` inside the
same transaction, purged after seven days by the same cron. What is new is that
paying also issues the upload link — the documents the protocol is built from are
the next thing the buyer has to do, and asking them to wait for the doctor to
press a button is a day lost on every order.

**A paid material has no order row at all.** There is nothing to create before
payment and nothing to purge: the `Payment` row is the whole record of an
abandoned purchase. What payment buys is a `MaterialGrant` — a 32-byte token, 30
days, a download limit, bound to the payer's email — and `GET
/materials/download/:token` streams the file out of `PRIVATE_UPLOADS_DIR`. Buying
the same material again with the same address extends that grant instead of
minting a second one, exactly as `linkForOrder` does.

**The grant link reaches the buyer twice, and never through the `orderId`.**
`docs/shape-express-checkout.md` ruled that `orderId` is fine as the key to a
PII-free status lookup and not fine as the key that hands over a file: it travels
to the bank, lives in the merchant portal and lands on card statements. So
`/payment-status/:orderId` is unchanged, and the return page claims the link with
`POST /materials/grant {orderId, intentKey}` — the intent key never leaves the
buyer's tab. The receipt carries it too, for the tab that was closed.

## Files

**Schema and data**

- `apps/api/prisma/schema.prisma` — `DeliverableOrderStatus += awaiting_payment`;
  `Material.fileKey String?`; `model MaterialGrant`. ~35 lines.
- Three generated migrations, one concern each. `ALTER TYPE … ADD VALUE` is
  alone in its own, as `QuickQuestionStatus` was.
- `apps/api/src/scripts/move-paid-material-files.ts` — **new**, ~70. One-off:
  copy every paid material's file from `UPLOADS_DIR` to `PRIVATE_UPLOADS_DIR`,
  write `fileKey`, null `fileUrl`, unlink the public copy. Idempotent, dry-run by
  default. All four paid materials have `fileUrl: null` today, so it will move
  nothing — it exists because the client may upload one before this ships.

**API**

- `apps/api/src/app/payments/fulfilment.service.ts` — **new**, ~190. Everything
  that happens after the money is committed: the receipt, the order's upload
  link, the material grant. `deliverReceipt` and `resendConfirmation` move here.
- `apps/api/src/app/payments/payments.service.ts` — `activateOrder()` beside
  `activateTicket()`; the `material` branch stays a documented no-op in the
  transaction; `persist()` calls `fulfilment.settle()`. +40 / −90.
- `apps/api/src/app/payments/payments.module.ts` — imports `UploadsModule` and
  `MaterialsModule`, provides the fulfilment service. +6.
- `apps/api/src/app/payments/payments.controller.ts` — resend delegates to
  fulfilment, then re-reads the DTO. +5.
- `apps/api/src/app/uploads/uploads.module.ts` — `exports: [UploadsService]`. +1.
- `apps/api/src/app/leads/checkout.controller.ts` — two routes, same honeypot
  and throttle, captcha actions `deliverable_checkout` and `material_checkout`. +45.
- `apps/api/src/app/leads/dto/checkout.dto.ts` — `DeliverableCheckoutDto`
  (product code), `MaterialCheckoutDto` (slug). Neither carries an amount. +40.
- `apps/api/src/app/leads/leads.service.ts` — `startDeliverableCheckout()`,
  `startMaterialCheckout()`; `createDeliverable()` deleted. +110 / −45.
- `apps/api/src/app/leads/leads.controller.ts` — `POST /leads/deliverable` deleted. −10.
- `apps/api/src/app/materials/material-grants.service.ts` — **new**, ~140. Mint,
  extend, look up, count a download, resolve the file path.
- `apps/api/src/app/materials/material-price.ts` — **new**, ~30. The pure seam
  between a `Material` row and a chargeable amount.
- `apps/api/src/app/materials/materials.controller.ts` — `POST /materials/grant`,
  `GET /materials/download/:token`, `POST /materials/file/private`. +60.
- `apps/api/src/app/materials/materials.service.ts` — a paid material stores
  `fileKey` and no `fileUrl`, a free one the reverse; flipping `access` clears the
  file rather than moving bytes between two volumes. +25.
- `apps/api/src/app/materials/materials.mapper.ts` — `fileKey` in the back-office
  payload, neither column in the public one. +8.
- `apps/api/src/app/materials/materials.module.ts` — the grants service, exported. +4.
- `apps/api/src/app/deliverable-orders/deliverable-orders.service.ts` — a status
  filter on `findAll`; `activateOrderData()` exported. +35.
- `apps/api/src/app/deliverable-orders/deliverable-orders.purge.ts` — **new**, ~70.
- `apps/api/src/app/deliverable-orders/deliverable-orders.module.ts` — +3.
- `apps/api/src/app/mail/patient-templates.ts` — the receipt gains one optional
  block: what you can do now, plus its URL. RO/EN/RU. +45.
- `apps/api/src/app/mail/patient-notifications.service.ts` — +10.

**Shared**

- `packages/shared/src/lib/enums.ts` — the new order status. +2.
- `packages/shared/src/lib/dto.ts` — `MaterialDto.fileKey`, `MaterialGrantDto`. +40.

**Site**

- `apps/frontend/app/[locale]/checkout/[...target]/page.tsx` — **new**, ~210.
  Replaces `app/[locale]/quick-question/checkout/page.tsx` (deleted).
- `apps/frontend/components/sections/CheckoutForm.tsx` — **new**, ~380. Replaces
  `ExpressCheckoutForm.tsx` (deleted). One payer block, one per-kind field block.
- `apps/frontend/lib/checkout.ts` — two more start functions and
  `claimMaterialGrant()`. +60.
- `apps/frontend/components/sections/PaymentResult.tsx` — the material branch:
  claim the grant once the poll says `paid`, render the link and what it is good
  for. +70.
- `apps/frontend/components/ui/OrderDeliverableButton.tsx` — a `Link` to the
  checkout route. −20.
- `apps/frontend/components/ui/LeadFormModal.tsx` — the deliverable mode goes;
  the monitoring lead stays. −60.
- `apps/frontend/components/sections/MaterialLibrary.tsx` — a paid card links to
  its checkout instead of `/contact`. +10.
- `apps/frontend/lib/leads.ts` — `submitDeliverableLead` deleted. −15.
- `apps/frontend/next.config.ts` — one permanent redirect from
  `/quick-question/checkout`. +8.
- `apps/frontend/app/robots.ts`, `app/sitemap.ts` — `/checkout/` joins the
  private prefixes. +4.

**Back office**

- `apps/back-office/src/pages/orders.tsx` — a `Neachitate` tab and the payment
  strip, mirroring `quick-questions.tsx`. +60.
- `apps/back-office/src/features/orders/{api,types,mock}.ts` — the status filter. +30.
- `apps/back-office/src/features/library/material-form-sheet.tsx` — a paid
  material uploads to the private endpoint; flipping `access` clears the file and
  says so. +50.
- `apps/back-office/src/features/library/{api,types}.ts` — +14.
- `apps/back-office/src/pages/payments.tsx` — a material payment shows its
  download link with copy, next to the receipt column. +35.
- `apps/back-office/src/i18n/ro.ts` — +40.

**Tests**

- `apps/api/src/app/materials/material-price.spec.ts` — new.
- `apps/api/src/app/materials/grant-rules.spec.ts` — new.
- `apps/api/src/app/deliverable-orders/order-activation.spec.ts` — new.

## Schema / API changes

Three migrations, all additive:

```
DeliverableOrderStatus += awaiting_payment
Material.fileKey  String?                          (new)

model MaterialGrant {
  id             String   @id @default(uuid())
  token          String   @unique                  // 32 bytes, base64url
  material       Material @relation(onDelete: Cascade)
  materialId     String
  payerEmail     String                            // lowercased
  expiresAt      DateTime
  maxDownloads   Int      @default(10)
  downloadCount  Int      @default(0)
  lastDownloadAt DateTime?
  paymentId      String?                           // which purchase opened it
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([materialId, payerEmail])
  @@index([expiresAt])
}
```

`@@unique([materialId, payerEmail])` is the rule, not an optimisation: buying the
same guide twice extends one grant rather than leaving two live tokens, the same
decision `linkForOrder` makes and for the same reason. The token is **kept** on
renewal, so a link already sitting in somebody's inbox keeps working. It is
stored in the clear for the reason `UploadLink.token` documents — the back office
has to hand out the same link again — and what it opens is one PDF the buyer paid
for, never a patient document.

Thirty days and ten downloads: long enough for a phone, a laptop and a reinstall,
short enough that a leaked link is not a distribution channel. An exhausted
grant, an expired one and an unknown token all answer **404**, per
`PRINCIPLES.md`; the recourse is the back office re-issuing, which is why the
`Plăți` page shows the link.

New routes:

| Route | Access | Body / returns |
|---|---|---|
| `POST /leads/deliverable/checkout` | public, captcha + honeypot, 3/min | `{product, name, email, phone?, message?, locale, termsAcceptedVersion, intentKey, company?}` → `{checkoutUrl, orderId}`. **No amount.** |
| `POST /leads/material/checkout` | public, captcha + honeypot, 3/min | `{slug, name, email, phone?, locale, termsAcceptedVersion, intentKey, company?}` → `{checkoutUrl, orderId}`. **No amount.** |
| `POST /materials/grant` | public, 10/min | `{orderId, intentKey}` → `{downloadUrl, expiresAt, downloadsLeft}`. 404 for a wrong key, a payment that is not `paid`, or a target that is not a material. |
| `GET /materials/download/:token` | public, 30/min | Streams the file. 404 for unknown, expired and exhausted alike. |
| `POST /materials/file/private` | admin / editor | The paid-material upload → `{key, name}`. |
| `GET /deliverable-orders?status=…` | admin / editor | The `Neachitate` tab. |

**Deleted:** `POST /leads/deliverable`.

Price resolution, server-side and never from the request: a deliverable reads
`DELIVERABLE_CATALOG` by product code, a material reads `Material.price`. Both
then pass through the existing `checkoutAmount()`, so maib's floor and the
"priced 0 means on request" rule are enforced in one place for all three
purchases. A free material offered for sale is refused with
`material_not_for_sale` before any of that.

## Test plan

Unit, Jest, no database and no Nest test module — the `business-hours.spec.ts`
model. Each seam is arithmetic over money or over who may have a file.

**Seam: `materialPrice(material)`, exported from `materials/material-price.ts`.**
`{access: 'free'}` → `material_not_for_sale`; `{access: 'paid', price: null}` →
`price_on_request`; `price: 0` → `price_on_request`; `price: 9` → `9`. And the
composition that matters: `price: 1` reaches `checkoutAmount` and is refused with
`amount_below_minimum`, so a mispriced material never reaches the bank.

**Seam: `grantUsable(grant, now)` and `extendGrant(existing, now)`, exported from
`materials/material-grants.service.ts`.** A live grant is usable; one past
`expiresAt` is not; one at `downloadCount === maxDownloads` is not; one over that
count is not either. `extendGrant` pushes `expiresAt` 30 days from `now`, resets
`downloadCount` to 0 and **leaves `token` untouched** — the assertion that a
re-purchase does not invalidate the link already in somebody's inbox.

**Seam: `intentMatches(payment, candidate)`, exported from the grants service.**
Equal keys match; different keys do not; a different-length key does not and does
not throw. Constant-time: this is a capability check, not a lookup.

**Seam: `activateOrderData(status)`, exported from
`deliverable-orders.service.ts`** — the pure part of the fulfilment branch, the
twin of `activateTicketData`. `awaiting_payment` → `{status: 'new'}`; `new`,
`in_progress`, `delivered` and `canceled` each → `null`, so a redelivered
callback cannot walk a finished order back to the start of the queue.

**Manual acceptance, against the sandbox through the tunnel**, with
`PAYMENT_CURRENCY=MDL` and the test card `5102180060101124`:

1. A group-C order from `/checkout/deliverable/menu_7`: absent from `Comenzi`
   before payment, present after, with an upload link already issued and the same
   link in the receipt. A second submit with the same `intentKey` returns the same
   `checkoutUrl` and rewrites the order's notes rather than creating a second one.
2. A paid material from `/checkout/material/<slug>`: the return page claims the
   grant and the file downloads. The same URL opened in another browser still
   downloads — the token is the capability, and that is the intended behaviour;
   what it must not be is guessable or derivable from the `orderId`.
3. The same material bought again with the same email: one row in `MaterialGrant`,
   the counter back to zero, the original link still live.
4. `POST /materials/grant` with a correct `orderId` and a wrong `intentKey` → 404.
   With a correct pair but a payment refunded from the back office → 404.
5. `GET /materials/download/<token>` after the eleventh download → 404, and the
   `Plăți` page still offers the link so an operator can re-issue.
6. A public `curl` of `/uploads/<the paid file>` after the migration script → 404.
7. The purge deletes an unpaid order older than seven days and leaves one whose
   payment is still `pending`.

## Tradeoffs / alternatives considered

**One `POST /leads/checkout` with a discriminated body.** Rejected: `class-validator`
discriminated unions need `@ValidateNested` plus a discriminator configured on the
pipe, which is machinery this codebase has nowhere, and it would collapse three
distinct captcha actions into one. Three small controller methods over three
plain DTOs is less code and validates more.

**Keep the paid PDFs public and rely on an unguessable filename.** Rejected on the
plainest ground: a UUID in a URL is not a payment. The file would be one forwarded
link away from free, and `PRINCIPLES.md` already settled the equivalent question
for medical documents. The private directory and its streaming endpoint exist and
cost nothing to reuse.

**`orderId` as the key to the download**, no `MaterialGrant` table at all.
Rejected, and the reason is written down in `docs/shape-express-checkout.md`: the
order reference travels to the bank, lives in the merchant portal and appears on
card statements. A grant token that never leaves our side is the difference
between a status lookup and a capability.

**Move the file between stores when an editor flips `access`.** Rejected: the two
directories are separate volumes in `docker-compose.prod.yml`, so it is a copy
plus an unlink that can half-fail, written for a case that has never happened —
the four paid materials have no file at all. Flipping `access` clears the file and
asks for it again, which the storefront already renders honestly as "în curând".

**Issue the upload link only for the two protocol products.** Rejected: a menu is
also written from what the client sends, and "these three codes get a link, those
two do not" is a rule somebody will get wrong in six months. One rule, and the
doctor ignores the link on an order that does not need it.

**An event bus for fulfilment.** Still rejected, on the same grounds as in the
EXPRESS shape. What changed is the size of the switch, and the answer to that is
the file this step extracts, not a new mechanism.

## Open questions — all four decided, 2026-09-11

1. ~~**Ten downloads and thirty days are ours, not the client's.**~~ **Decided:
   the two numbers stay ours until she says otherwise, and they ship as two named
   constants.** Both are operational, neither has legal weight, and both are
   stated to the buyer in the receipt and on the return page. Asking her first
   would block the step on an answer that changes two integers; changing them
   later costs one edit plus the three translations the wording already needs.
2. ~~**What happens when a material is refunded.**~~ **Decided: a refund revokes
   the grant, and the token then answers 404 like any other dead one** — on the
   same `recomputeTargetMirror` path that already un-confirms the other purchases.
   `/terms` says a downloaded file is not refundable, so this only ever fires for
   a refund the doctor grants deliberately, which is exactly when she means it.
3. ~~**A buyer in a private window loses the return-page link.**~~ **Decided:
   accepted, not solved, and the recourse is a person rather than a mechanism.**
   `checkoutIntentKey()` mints a fresh key when `sessionStorage` throws, so the
   claim will not match and the return page shows no link. With no SMTP the
   receipt does not cover it either, so the buyer writes in and the doctor hands
   the link over with the `copiază link` button on the `Plăți` page — which is
   why that button is in this step and not a later one. The alternative is making
   `orderId` the capability, which is the thing this shape exists to avoid.
4. ~~**Deleting `POST /leads/deliverable` leaves no way to record an order the
   client took by phone.**~~ **Decided: the route still goes, and the gap is
   closed by a create form in the back office — `PLAN.md` step 13d, not this
   one.** The same gap the other purchases have, and the same answer:
   `POST /payments/manual` against an order, once an order exists to point it at.
   A public door that makes an unpaid order the doctor works on is not an
   acceptable placeholder for an admin form.
