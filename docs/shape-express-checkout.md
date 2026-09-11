# Shape — the EXPRESS checkout

Written 2026-09-11 for `PLAN.md` step 12a, per `AGENTS.md` R1. Follows the A8
architecture pass over `payments` + `leads` + `mail` + `quick-questions`.
**Approved 2026-09-11** with the five decisions recorded under "Open questions"
below; `PLAN.md` step 12a carries the same five. One of them reverses the wording
of 12a, and one of them corrects the "Files" list in this document — both are
written out where they apply.

## Goal

A visitor buys an EXPRESS question on the site: one page collects the question, the
payer details, the terms acceptance and the currency notice, the bank's hosted page
takes 8 €, and the ticket only becomes visible to the doctor once the money is in.
Everything works against the sandbox with no callback delivered, because the bank has
nowhere to deliver one yet.

## What the code actually looks like now

Six things found while reading. Three of them change the plan.

1. **`PaymentsService.start()` takes an `amount`.** It is a plain number supplied by
   the caller (`StartPaymentInput.amount`). If a public route accepts that field from
   the request body, an 8 € consultation is bought for 1.01. The public entry point
   must take a *descriptor* of the purchase and read the price server-side. This is the
   single most expensive mistake available in this step.
2. **`start()` has no guards at all.** No `amount > 1.00` (maib refuses below it), no
   E.164 normalisation of the phone (a non-E.164 phone fails the whole session with
   `42005`), no `orderInfo.items`, no `orderInfo.date`. All four are §18 of
   `docs/payments-maib-checkout.md`, and all four belong in `start()`, not in callers.
3. **`QuickQuestion.dueAt` is `NOT NULL` and computed at intake.** Under pay-first the
   SLA clock starts at payment, so an unpaid ticket must not carry a deadline: the
   back office's overdue tab and dashboard counter both key off it. The column becomes
   nullable.
4. **`markTargetPaid` writes one column and swallows `P2025`.** For EXPRESS it now has
   to set `status` and `dueAt` as well. Switching it to a conditional `updateMany`
   scoped to `status: awaiting_payment` solves three things at once: a redelivered
   callback cannot walk an already-answered ticket back to `open`, a deleted ticket
   stops raising `P2025`, and the `try/catch` around it can go.
5. **`WorkingHoursModule` and `MailModule` are both `@Global()`.** So `payments` can
   inject `WorkingHoursService` (for `expressDueAt()`) and
   `PatientNotificationsService` (for the bank's receipt) without a single new module
   import and without any risk of an import cycle. This is what makes fulfilment inside
   `payments` cheap rather than tangled.
6. **The site has no legal-entity data and neither does the API.**
   `apps/frontend/lib/legal-entity.ts` is empty constants; the API has nothing. The
   bank's required confirmation email names the company and its IDNO. Introducing them
   as API env vars while the front end keeps its own constants would create two sources
   of truth for exactly the data the acquirer's compliance review checks. Folded in
   below as a small, deliberate piece of this step.

## Approach

The question is collected **before** the redirect and the ticket is created in a new
`awaiting_payment` state, bound to the `Payment` row from the start. One new public
route in `leads` owns the whole pre-checkout: it writes the ticket, calls
`PaymentsService.start()` and answers with the bank's `checkoutUrl`. Everything that
makes the purchase real — the ticket going live, the SLA clock, the receipt — hangs off
`PaymentsService.persist()`, which is the one place all three inbound paths converge
(callback, return-page poll, reconcile cron). That is why the flow is complete without
a delivered callback: the return page's poll asks the bank itself.

The four maib divergences from §18 are absorbed into `start()` and `MaibService`, so no
caller ever learns that the bank has opinions about phone formats.

### The reversal from `PLAN.md` 12a

12a says "сначала оплата, потом форма вопроса … `QuickQuestion` создаётся при `paid`".
This shape does the opposite, for one decisive reason: **pay-first has no working
recovery path today.** If the patient pays and then closes the tab before typing the
question, the only ways back in are an email (SMTP is not configured) or a token that
died with the tab. The money is taken and the patient has nothing. Form-first makes the
worst case "a question we store for seven days and delete", which costs the patient
nothing.

The client's requirement — *pay before you get an answer* — is still met exactly: an
`awaiting_payment` ticket is not in the doctor's working list and has no answer box.
The brief itself lists both orders (`docs/brief-changes-2026-06-24.md` §11.4b: "pay,
then the question form (or the form, then a checkout that gates delivery)"). This picks
the second. **If SMTP lands before this is built, the decision is worth re-opening.**

## Files

**API**

- `apps/api/prisma/schema.prisma` — `QuickQuestionStatus += awaiting_payment`;
  `QuickQuestion.dueAt` nullable; `Payment.intentKey String? @unique`;
  `Payment.confirmationSentAt DateTime?`.
- `apps/api/src/app/payments/payments.service.ts` — `start()` gains the amount guard,
  the E.164 call, `orderInfo.items` + `orderInfo.date` and `intentKey` resolution;
  `markTargetPaid` gains the EXPRESS branch as a conditional `updateMany`; a new
  post-commit `deliverReceipt()` step.
- `apps/api/src/app/payments/maib.service.ts` — `normalizeCheckout()` reading
  `CompletedAt`/`completedAt`, `FailedAt`/`failedAt`, `CancelledAt`/`cancelledAt`.
- `apps/api/src/app/payments/payments.controller.ts` —
  `POST /payments/:id/resend-confirmation` (admin).
- `apps/api/src/app/payments/payment-status.controller.ts` — unchanged; its service
  method returns the wider payload.
- `apps/api/src/app/leads/checkout.controller.ts` — **new.**
  `POST /leads/quick-question/checkout`, public, captcha + honeypot + throttle.
- `apps/api/src/app/leads/dto/checkout.dto.ts` — **new.** `QuickQuestionCheckoutDto`:
  the lead fields plus `termsAcceptedVersion` and `intentKey`.
- `apps/api/src/app/leads/leads.service.ts` — `startQuickQuestionCheckout()`.
- `apps/api/src/app/leads/leads.module.ts` — imports `PaymentsModule`.
- `apps/api/src/app/quick-questions/quick-questions.service.ts` — `findAll` gains a
  status filter; `answer()` refuses an `awaiting_payment` ticket.
- `apps/api/src/app/quick-questions/quick-questions.purge.ts` — **new.** Daily cron,
  deletes `awaiting_payment` tickets older than 7 days whose payments are all terminal
  and none paid.
- `apps/api/src/app/mail/patient-templates.ts` — `PAYMENT_RECEIPT_TEMPLATES`, RO/EN/RU.
- `apps/api/src/app/mail/patient-notifications.service.ts` — `paymentReceipt()`.
- `apps/api/src/main.ts` — ~~`LEGAL_ENTITY_NAME`, `LEGAL_ENTITY_IDNO`,
  `LEGAL_ENTITY_ADDRESS` added to `REQUIRED_IN_PRODUCTION`.~~ **Corrected by
  decision 3 below (approved 2026-09-11): they are documented env vars and stay
  out of `REQUIRED_IN_PRODUCTION`.** The API must boot without them — the rest of
  the site is not blocked on the client's incorporation. The checkout route is the
  only thing that needs them, and it answers `503 legal_entity_missing` while they
  are empty.
- `apps/api/src/app/contacts/contacts.service.ts` — the public payload carries the
  legal entity read from env.

**Shared**

- `packages/shared/src/lib/phone.ts` — **new.** `toE164(raw, 'MD')`.
- `packages/shared/src/lib/terms.ts` — **new.** `TERMS_VERSION`, the same shape the
  upload consent already uses.
- `packages/shared/src/lib/enums.ts` — the new enum member mirrored.

**Site**

- `apps/frontend/app/[locale]/quick-question/checkout/page.tsx` — **new.** Server
  component: order summary from `/services`, then the form island.
- `apps/frontend/components/sections/ExpressCheckoutForm.tsx` — **new.** Client island:
  name, email, phone, question, consent, terms checkbox, FX notice, one submit.
- `apps/frontend/app/[locale]/payment/success/page.tsx` — **new.**
- `apps/frontend/app/[locale]/payment/failed/page.tsx` — **new.**
- `apps/frontend/components/sections/PaymentResult.tsx` — **new.** Client island that
  polls `/payment-status/:orderId` and renders the order details.
- `apps/frontend/lib/checkout.ts` — **new.** The typed client for the new route.
- `apps/frontend/components/ui/BookGroupBButton.tsx` — for `quick_question`, links to
  the checkout route instead of opening `LeadFormModal`.
- `apps/frontend/lib/legal-entity.ts` — reduced to a type; values come from the API.
- `apps/frontend/app/[locale]/terms/page.tsx` — the payment section gains the refund
  policy the bank looks for.

**Back office**

- `apps/back-office/src/pages/quick-questions.tsx` — a `Neachitate` tab; the answer box
  disabled while unpaid; the ticket's payment strip.
- `apps/back-office/src/pages/payments.tsx` — the receipt column with
  `Confirmare netrimisă · copiază` and the resend action.
- `apps/back-office/src/i18n/ro.ts` — the new strings.

**Tests**

- `packages/shared/src/lib/phone.spec.ts` — new.
- `apps/api/src/app/payments/maib.checkout-normalize.spec.ts` — new.
- `apps/api/src/app/payments/start-guards.spec.ts` — new.
- `apps/api/src/app/quick-questions/ticket-activation.spec.ts` — new.

## Schema / API changes

Four migrations, all additive, all generated:

```
QuickQuestionStatus   += awaiting_payment
QuickQuestion.dueAt    DateTime  →  DateTime?     (DROP NOT NULL, no data loss)
Payment.intentKey           String?  @unique      (new)
Payment.confirmationSentAt  DateTime?             (new)
```

`dueAt` nullable is the one worth arguing. The alternative is to keep it NOT NULL and
stamp a deadline at intake, then recompute it at payment — but then every unpaid ticket
carries a deadline it was never owed, and the overdue counter on the dashboard starts
counting people who have not paid. Nullable says the honest thing: no clock until the
money lands.

New routes:

| Route | Access | Body / returns |
|---|---|---|
| `POST /leads/quick-question/checkout` | public, captcha + honeypot, 3/min | `{name, email, phone?, question, locale, termsAcceptedVersion, intentKey, company?}` → `{checkoutUrl, orderId}`. **No amount field.** |
| `POST /payments/:id/resend-confirmation` | admin | → the payment DTO |

Changed payload: `GET /payment-status/:orderId` gains `targetType`, `description`,
`paidAt`. Still no payer PII. `GET /contacts` gains the legal entity.

Price resolution: the route reads `Service` where `code = quick_question` and uses its
`price`. A price of `0` is refused with `price_on_request`, an amount at or below 1.00
with `amount_below_minimum` — both before the bank is called.

## Test plan

Unit, Jest and Vitest, no database and no Nest test module — the `business-hours.spec.ts`
model. Every one of these is arithmetic over money, deadlines or bank input, which is
what `TESTING.md` says is worth covering.

**Seam: `toE164(raw, 'MD')`, exported from `packages/shared`.**
`069123456` → `+37369123456`; `+373 69 123 456` with spaces → normalised; `0037369…` →
`+37369…`; `069 123 456 (Viber)` → `null`; `+1` → `null`; empty → `null`. Asserts that
an unparseable phone yields `null` rather than throwing, because the caller omits the
field rather than refusing the sale.

**Seam: `normalizeCheckout(raw)`, exported from `maib.service.ts`.**
The documented capitalised payload and the sandbox lower-case payload produce the same
object; `PaymentId` and `paymentId` both read; a payload with neither leaves the field
undefined rather than `"undefined"`.

**Seam: the guard helper `checkoutAmount(price)` exported from `payments.service.ts`.**
`0` → `price_on_request`; `1` → `amount_below_minimum`; `1.0` → refused (maib is
strictly `> 1.00`); `8` → accepted.

**Seam: `activateTicketData(current)` exported from `quick-questions.service.ts`** — the
pure part of the fulfilment branch. `awaiting_payment` → `{status: open, dueAt}`;
`open` → no change; `answered` → no change (a redelivered callback must not reopen an
answered ticket).

**Seam: `resolveIntent(existing)` exported from `payments.service.ts`.** No row → open a
session; a non-terminal unexpired row → return its `checkoutUrl`; a terminal row →
detach the key and open a fresh session.

**Manual acceptance, against the sandbox through the tunnel (this is step 12b):**
the full EXPRESS path with the test card `5102180060101124`; the ticket invisible in the
doctor's list until `paid` and visible after; `dueAt` counted from the payment moment
against the real schedule; a second submit with the same `intentKey` returning the same
`checkoutUrl`; the return page opened with a foreign `orderId` answering 404; an
abandoned session expiring and the ticket staying unpaid; a refund from the back office
moving the mirror to `pending` without touching the answer.

Currency for 12b: the profile still refuses EUR, so the run uses `PAYMENT_CURRENCY=MDL`
and a nominal amount. It proves the wiring, not the pricing. Production is EUR the day
the bank enables it.

## Tradeoffs / alternatives considered

**Pay first, question form on the return page** — the literal reading of 12a and of the
client's reference. Rejected because the recovery path for a closed tab is an email, and
there is no SMTP; the failure mode is money taken and nothing delivered. It also leaves
a paid `Payment` row with `targetId: null`, invisible to `historyForTarget`. Revisit if
SMTP arrives first.

**An event bus for fulfilment** (`@nestjs/event-emitter`, `payment.paid` consumed by
each domain). Rejected: it is a new mechanism in a codebase that has none, and a handler
running outside `persist()`'s transaction either observes uncommitted state or fires
twice on a redelivered callback. The `switch` inside `payments` keeps fulfilment in the
same transaction as the payment write, and both collaborators it needs are already
`@Global()`. Recorded as a real cost: `payments` now knows one fact about each payable
thing. The trigger to split it into `payments/fulfilment/<target>.ts` is a sixth payable
thing or a second branch needing more than one collaborator.

**`orderId` as the capability for everything after payment** — zero new columns. It is
72 bits of CSPRNG, so cryptographically fine, but it travels to the bank, lives in the
merchant portal and lands on statements. Acceptable for a PII-free status lookup, which
is what it already does; not acceptable as the key that hands over a file. That decision
matters in 12c, and it is why the paid-material grant gets its own token there.

**Putting the checkout route in `payments`.** Rejected: `payments` would then import
`leads`, and `leads` already owns the public front door with its captcha, honeypot,
rate limits and locale rule. `leads → payments` is one new edge with no cycle.

**A separate `checkout` module.** Rejected: two modules would write `QuickQuestion`.

## Open questions

**All five were answered on 2026-09-11. Status: approved 2026-09-11.** The same five
decisions are recorded in `PLAN.md` step 12a; where this section and the body of the
shape disagree, this section is the later word and wins.

1. **The reversal above needs a yes.** — **Decided: yes, form first.** The ticket is
   written before the redirect in the new `awaiting_payment` status and bound to its
   `Payment` row through `targetId`; the redirect to the bank comes after. The reason
   stands as argued above: pay-first has no recovery path for a closed tab while SMTP
   does not exist, and the client's requirement — *pay before you get an answer* — is met
   by the unpaid ticket being invisible to the doctor, not by the order of the two steps.
   This knowingly contradicts the wording of `PLAN.md` 12a, and 12a now says so.
   Re-open if SMTP lands before this is built.

2. **Seven days for purging unpaid tickets.** — **Decided: seven days.** An unpaid
   `awaiting_payment` ticket older than seven days whose payments are all terminal and
   none paid is deleted by the daily cron. It is an operational choice, not a statutory
   one, so the retention period goes into `/gdpr` in the client's own words rather than
   living only in the cron.

3. **The legal entity is folded into this step.** — **Decided: yes, here, but not as a
   boot requirement.** `LEGAL_ENTITY_NAME`, `LEGAL_ENTITY_IDNO` and
   `LEGAL_ENTITY_ADDRESS` become API env vars served through the public `/contacts`
   payload, and the front-end constants in `apps/frontend/lib/legal-entity.ts` are
   deleted so there is one source of truth for the data the acquirer's compliance review
   checks. **They do not join `REQUIRED_IN_PRODUCTION`** — this corrects the "Files"
   entry for `apps/api/src/main.ts` above. The values are blocked on the client's
   incorporation, and the rest of the site is not: the API boots without them and the
   checkout route alone answers `503 legal_entity_missing` until they are filled. That
   also keeps the placeholder honest in the way `PRINCIPLES.md` asks — the draft banner
   on `/gdpr` and `/terms` is derived from emptiness, not from a flag someone must
   remember to flip.

4. **SMTP is now a launch blocker, not a wish.** — **Decided: yes, and the client is to
   be told in those words.** The bank's go-live checklist requires a payment
   confirmation email, so payments cannot go live without a mailbox and SMTP
   credentials. The return page carries the order details, which covers the other
   checklist item, but nothing covers this one. The code ships regardless and records
   the truth: `confirmationSentAt` stays `null` when the mail does not go out, and the
   back office shows `Confirmare netrimisă` with a resend action rather than pretending
   a receipt was sent.

5. **`PAYMENT_CURRENCY` as an env var.** — **Decided: yes, but only outside production.**
   It exists so 12b can prove the whole path in MDL while the merchant profile still
   refuses EUR. In production the currency is EUR, taken from the catalog; an attempt to
   override it there is ignored and logged with a warning. The knob is a testing
   affordance with a fence around it, not a production setting.
