# maib e-Commerce Checkout — integration analysis

Status: **analysis only, nothing built.** Payments are still blocked on scope/budget
sign-off (see `docs/brief-changes-2026-06-24.md` §11) and on the client's legal-entity
data (see `docs/questions_v3.md` §1). This file is what we know from maib's own docs,
what it means for our stack, and what has to be answered before a line of code is written.

Source: <https://docs.maibmerchants.md/checkout> (read 2026-09-10). Every page is also
available as raw Markdown by appending `.md`, and the index lives at
`https://docs.maibmerchants.md/checkout/llms.txt`.

**Sandbox credentials arrived 2026-09-10** and are in `.env` / `apps/api/.env` as
`MAIB_CLIENT_ID`, `MAIB_CLIENT_SECRET`, `MAIB_SIGNATURE_KEY`, with
`MAIB_BASE_URL=https://sandbox.maibmerchants.md`. Everything marked **✅ verified** below
was checked against the live sandbox, not just read in the docs — and in four places the
sandbox disagrees with the documentation. See §11. **§12 records the client's exchange with
the bank on 2026-09-10** — currency is resolved (EUR + MDL, settled in MDL), card saving is
the new open question.

---

## 1. Which maib API to use

maib publishes four payment APIs. Two are candidates for us:

| API                                       | What it is                                                                                    | Methods                              | Currencies                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| **e-Commerce Checkout** (`/checkout`, v2) | **Hosted payment page.** We create a session, redirect the payer to maib, they pay there.     | Card, Apple Pay, Google Pay, **MIA** | MDL + EUR per maib; ⚠️ our profile is **MDL-only until they enable EUR** (§7.1) |
| **e-Commerce API** (`/e-commerce`, v1)    | Merchant-controlled flow. Also has two-step (auth+capture), recurring, one-click saved cards. | Card, Apple Pay, Google Pay (no MIA) | **MDL / EUR / USD**, explicitly documented                                      |

**Recommendation: Checkout v2 — but see the caveat below.**

- Card data never touches our servers → PCI scope is SAQ-A. (v1 also uses a bank-hosted
  card page, so this is not the deciding factor it first looks like.)
- It is the only one of the two that carries **MIA**, which the client confirmed to the
  bank she wants — _"dacă acesta poate fi oferit concomitent cu … card bancar"_, which is
  exactly what the v2 hosted page does.
- It is a much smaller surface: 5 endpoints and one callback, versus v1's full transaction
  lifecycle.
- Currency: maib confirmed **MDL and EUR both work**, with settlement always in MDL — so
  the EUR catalog survives, once they enable EUR on our profile (§7.1).

⚠️ **The caveat: card saving.** The client also told the bank she wants _"soluția tehnică
aleasă să permită activarea ulterioară a salvării cardului … pentru plăți recurente sau
abonamente"_. **Checkout v2 has no card saving, no recurring and no one-click** — those
live only in v1. No single maib API covers MIA _and_ saved cards today.

The three ways out, in order of preference:

1. **Ask maib** whether card saving is coming to Checkout v2, or can be enabled on our
   profile. Cheapest outcome by far; ask before designing around it.
2. **Checkout v2 now, v1 added later** only for the saved-card path — if maib allows both
   integrations on one merchant profile (also a question for them).
3. **v1 e-Commerce + Direct MIA QR** as two separate integrations. Covers everything the
   client asked for, and costs roughly twice the integration work plus two callback paths.

Before spending anything on this, pressure-test the requirement with the client: **subscriptions
were decided on-request on 2026-07-01** — the doctor contacts the patient and sets duration
and price by hand. There is no recurring charge in the product today, so "keep the option
open" may be worth exactly one question to maib and nothing more.

---

## 2. Environments and auth

| Environment | Base URL                           |
| ----------- | ---------------------------------- |
| Sandbox     | `https://sandbox.maibmerchants.md` |
| Production  | `https://api.maibmerchants.md`     |

Endpoints and payloads are identical across both; only the credentials differ.

Auth is a short-lived bearer token, minted from a client id/secret pair:

```
POST /v2/auth/token
{ "clientId": "...", "clientSecret": "..." }

→ { "result": { "accessToken": "...", "expiresIn": 300, "tokenType": "Bearer" }, "ok": true }
```

The documented example shows `expiresIn: 300`; ✅ sandbox actually returns **1800**. Either
way, never hardcode it — cache the token in memory keyed off the returned `expiresIn` with
a safety margin (refresh at ~80% of TTL) and re-mint on `401`.

Every _successful_ response carries a top-level `ok: true`. **Errors do not** — see §5.
So the check is `ok === true`, never `!errors` and never the HTTP status alone.

---

## 3. Endpoints

| Endpoint                      | Method | Purpose                                                         |
| ----------------------------- | ------ | --------------------------------------------------------------- |
| `/v2/auth/token`              | POST   | Mint an access token                                            |
| `/v2/checkouts`               | POST   | Create a session → returns `checkoutId` + `checkoutUrl`         |
| `/v2/checkouts/{id}`          | GET    | Full session detail: status, order, payer, payment              |
| `/v2/checkouts`               | GET    | Paginated list, with filters                                    |
| `/v2/checkouts/{id}/cancel`   | POST   | Cancel a session that is not in a terminal state                |
| `/v2/payments/{payId}/refund` | POST   | Refund a completed payment (`amount` + `reason`, both required) |
| `/v2/payments/refunds/{id}`   | GET    | Refund detail                                                   |
| `/v2/payments/{id}`           | GET    | Payment detail                                                  |

There is **no capture/void** — Checkout v2 is single-step. Money moves at payment time,
and the only reversal is a refund.

### Creating a session

```
POST /v2/checkouts
Authorization: Bearer {accessToken}
Content-Type: application/json
```

| Field                    | Required | Notes                                                                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `amount`                 | yes      | Major units, **must be > 1.00**                                                                                              |
| `currency`               | yes      | ISO 4217                                                                                                                     |
| `language`               | no       | `ro` \| `ru` \| `en` — maps 1:1 onto our three locales                                                                       |
| `callbackUrl`            | no       | Back-channel notification target                                                                                             |
| `successUrl` / `failUrl` | no       | Browser redirect targets                                                                                                     |
| `orderInfo`              | no       | `id`, `description` (max 125 chars), `date`, `orderAmount`, `orderCurrency`, `deliveryAmount`, `deliveryCurrency`, `items[]` |
| `orderInfo.items[]`      | no       | `externalId`, `title` (max 125), `amount`, `currency`, `quantity`, `displayOrder`                                            |
| `payerInfo`              | no       | `name`, `email`, `phone` (E.164), `ip`, `userAgent`                                                                          |

Response: `result.checkoutId` (UUID) and `result.checkoutUrl` — the bank URL to redirect to.
The session starts in `WaitingForInit`.

If `callbackUrl`/`successUrl`/`failUrl` are omitted, maib falls back to the values
configured in the merchant portal for the project. ✅ With an unconfigured sandbox project
that fallback means `callbackUrl: null` — **no callback fires at all**, silently — while
success/fail default to maib's own result pages. **Always send all three explicitly.**

### Session status machine

`WaitingForInit` → `Initialized` (payer opened the link) → `PaymentMethodSelected` →
`Completed`.

Terminal failure states: `Expired`, `Abandoned` (payer never opened the link), `Cancelled`
(we cancelled it), `Failed`.

Cancel only works while the session is non-terminal.

⚠️ ✅ The sandbox returns these values in **different casing than the docs** — a freshly
created session reads `Waitingforinit`, not `WaitingForInit`. Compare case-insensitively
(normalise to lowercase on ingest); do not build a TS union straight off the doc spelling.

✅ Session lifetime in sandbox is **25 minutes** (`createdAt` → `expiresAt`). Not
configurable through the API — the payer has 25 minutes from session creation, so create
the session at the moment of redirect, never earlier.

---

## 4. Callbacks — the part that needs the most care

### Browser redirect (untrusted)

maib redirects the payer back to `successUrl`/`failUrl` with query params:
`checkoutId`, `checkoutStatus` (`Completed` | `Failed`), `orderId`.

**These are user-controllable and must never drive state.** The return page shows a
neutral "checking your payment" state and asks _our_ API for the authoritative status.

### Back-channel callback (trusted, after signature check)

maib POSTs the full payment payload to `callbackUrl`. Notable fields: `checkoutId`,
`paymentId`, `amount`, `currency`, `paymentStatus` (`Executed` | `Failed` | …),
`paymentMethod` (`Card` | `MiaQr` | …), `orderId`, `orderDescription`, `payerName`,
`payerEmail`, `payerPhone`, `payerIp`, `senderCardNumber` (masked), `senderIban`,
`retrievalReferenceNumber` (RRN), `approvalCode`, `processingStatus` /
`processingStatusCode`, `threeDsResult` / `threeDsReason`, `completedAt`,
`paymentExecutedAt`, `terminalId`.

Headers:

| Header                  | Value                       |
| ----------------------- | --------------------------- |
| `X-Signature`           | `sha256=<base64 hmac>`      |
| `X-Signature-Timestamp` | Unix epoch **milliseconds** |

Signature:

```
signature = Base64( HMAC_SHA256( signatureKey, `${rawBody}.${timestamp}` ) )
```

`rawBody` is the exact transmitted bytes — compact JSON, UTF-8, no re-serialisation.

Verification, per maib's own instructions: constant-time compare, plus a freshness window
on the timestamp to block replays (they say "N minutes" and leave N to us — 5 minutes is
the sane default).

> ⚠️ **Gotcha vs. our existing Calendly webhook.** We already do exactly this in
> `apps/api/src/app/appointments/calendly.service.ts`, but the two differ in two ways
> that will silently produce a valid-looking mismatch:
>
> |               | Calendly                        | maib                            |
> | ------------- | ------------------------------- | ------------------------------- |
> | message order | `` `${timestamp}.${rawBody}` `` | `` `${rawBody}.${timestamp}` `` |
> | encoding      | hex                             | **Base64**                      |
>
> The docs say hex _or_ Base64 is acceptable "as long as all parties agree", but every
> official sample (.NET, PHP, Node) and the worked example use Base64 — so Base64 it is,
> and this is worth confirming with maib in writing before go-live.

`rawBody: true` is already enabled in `apps/api/src/main.ts`, so `req.rawBody` is
available — no bootstrap change needed.

### Reconciliation

The docs describe the back-channel callback as firing "after a successful payment" and do
not promise one for every failure. Callbacks also get lost. So the callback is an
_optimisation_, not the source of truth:

1. Callback arrives → verify → apply (idempotent on `checkoutId` + `paymentId`).
2. Return page → poll `GET /v2/checkouts/{id}` through our API.
3. Scheduled sweep → re-check any session stuck in a non-terminal state past its
   `expiresAt`, and mark it accordingly.

---

## 5. Errors

Documented shape: `{ ok: false, errors: [{ errorCode, errorMessage, errorArgs }] }`.

⚠️ ✅ **The sandbox does not honour this.** A rejected `POST /v2/checkouts` came back as
**HTTP 200** with `{"errors":[…]}` and **no `ok` field at all**:

```json
{
  "errors": [
    {
      "errorCode": "payments.acquiring.payments.app-0602003",
      "errorMessage": "Payment profile … does not support currency == EUR",
      "errorArgs": null
    }
  ]
}
```

Two consequences for the client wrapper:

- Treat a **missing** `ok` as failure. The rule is `ok === true` or throw — anything else,
  including HTTP 200 with no `ok`, is an error.
- There is a **second error namespace**, `payments.acquiring.payments.app-*`, that is not
  in the documented catalogue below. Log `errorCode` verbatim and never switch on the
  documented codes exhaustively — always have a default branch.

Codes worth handling by name:

| Code                           | Meaning                                        | HTTP |
| ------------------------------ | ---------------------------------------------- | ---- |
| `maib.merchant.payments-42000` | Invalid currency                               | 400  |
| `maib.merchant.payments-42001` | Amount must be > 0                             | 400  |
| `maib.merchant.payments-42004` | Unsupported language (RO/RU/EN only)           | 400  |
| `maib.merchant.payments-42006` | Required field missing                         | 400  |
| `maib.merchant.payments-43001` | Checkout does not exist or expired             | 404  |
| `maib.merchant.payments-44000` | Merchant not active                            | 409  |
| `maib.merchant.payments-44001` | No payment methods available for this checkout | 409  |
| `maib.merchant.payments-44002` | Current status forbids the operation           | 409  |
| `maib.merchant.payments-44003` | Payment profile misconfigured                  | 409  |
| `common.error-1`               | Unexpected server error                        | 500  |

`44000` / `44003` are configuration problems on maib's side — they must page us loudly
rather than show the patient a generic failure.

---

## 6. Testing

Sandbox at `https://sandbox.maibmerchants.md`, with its own credentials.

Test card: `5102180060101124`, exp `06/28`, CVV `760`, cardholder `Test Test`.

MIA QR does **not** auto-complete in sandbox — a QR is displayed, the payment stays
pending, and completion must be simulated via the MIA QR API (list QRs → take the newest
`qrId` → call the simulation endpoint, sandbox IBAN `MD88AG000000011621810140`).
Budget time for this: it is a second API to wire up just to test the first.

SDKs exist for **PHP** and **.NET** only. There is no Node/TypeScript SDK — we write the
client by hand, which is fine given the surface is seven endpoints.

---

## 7. Open questions

### For maib (`ecom@maib.md`)

1. ⚠️ **Enable EUR on our payment profile.** ✅ maib have confirmed in writing to the
   client: _"Integrarea este posibila in ambele valute, insa decontarea finala va fi in
   MDL"_ — both currencies work, settlement is always MDL. But our profile is **not
   enabled for EUR yet**; re-checked after their reply and still refused:

   | Currency | Result                                                                                     |
   | -------- | ------------------------------------------------------------------------------------------ |
   | `MDL`    | ✅ session created                                                                         |
   | `EUR`    | ❌ `Payment profile 55c944fd-1792-4ac1-9cdd-5ebe786a5397 does not support currency == EUR` |

   **This is now a concrete request, not an open question.** Write to `ecom@maib.md` quoting
   that profile id and error code, and ask for EUR to be enabled on the sandbox profile —
   and on the production profile when it is created. Then re-run the probe.

   Two follow-ups that "settlement in MDL" raises:
   - **At what rate, and when?** The doctor's actual MDL revenue per 8 EUR question is not
     fixed — it depends on the bank's conversion at settlement time. She should know this
     before she prices anything in EUR.
   - **How is a refund of an EUR payment converted?** If the patient is refunded EUR but the
     merchant was settled MDL, an adverse rate move means the refund costs more than the sale
     brought in. Ask which rate applies and who absorbs the difference.

2. **Signature encoding** — Base64 confirmed, and what is the replay window they recommend?
3. ~~**Session lifetime**~~ — ✅ answered: **25 minutes** in sandbox. Still worth confirming
   it is the same in production and whether it can be raised.
4. ~~**Are medical/telemedicine consultations acceptable?**~~ — ✅ effectively answered:
   the client described the activity in full to maib (§12) and they issued sandbox keys.
   Only the questionnaire and contract make it formal.
5. **Is a PFA (persoană fizică autorizată) eligible**, or only SRL/SA/ÎI? The requirements
   page lists "SRL, SA, ÎI, etc."; the client's legal form is still unknown.
6. **Does Checkout v2 support (or plan) card saving / recurring?** If not, can one
   merchant profile run both Checkout v2 and the v1 e-Commerce API, or v1 + Direct MIA QR?
   The client asked the bank for a solution that can enable card saving later — see §1.
7. Fees, settlement period, refund window, and whether refunds are full-only or partial.

### For the client

These are already in `docs/questions_v3.md`; maib makes them hard blockers rather than
nice-to-haves:

- §1.1 legal entity (form, name, IDNO, legal address) — **must be a registered Moldovan
  business and a maib bank client**. No entity, no merchant account, no payments.
- §2.1 hosting — the callback URL must be a **stable public HTTPS endpoint**. The API is
  currently on a temporary cloudflared tunnel; maib also asks for the server IP at
  portal-registration time.
- Who signs the contract (administrator or authorised signatory), in person or with a
  digital signature.

### For us

- Whether to keep a single `Payment` table keyed by `checkoutId`, or extend the existing
  `PaymentStatus` enum (currently just `pending` / `confirmed`) on each payable entity.
  Recommendation: a dedicated table plus a polymorphic reference, because one payment
  needs to serve appointments, EXPRESS questions, deliverable orders and paid materials.
- Refund UX in the back office: who can trigger it, and does it need a second confirmation.

---

## 8. What maib requires from the site before go-live

From the integration requirements page — several of these are already on our list, but
they become mandatory rather than optional:

- [x] HTTPS — done.
- [ ] **Terms & Conditions page** covering general provisions, personal-data protection,
      privacy policy, ordering and payment, delivery conditions, return policy, contacts.
      Ours exist but are marked **draft** pending the entity data and a lawyer.
- [ ] **A T&C acceptance checkbox on the payment step.** Because the payment page is hosted
      by maib, this checkbox has to live on _our_ pre-redirect step. Nothing like it exists today.
- [ ] **Payment confirmation email** to the patient with order number, company name, site
      name, amount, currency, date, and a description of what was bought. Needs the mail
      provider that is still unresolved (Brevo was proposed; no SMTP configured).
- [ ] **Order details on the return page** — order number, details, payment date.
- [ ] **Company contact details on the site** — IDNO, legal name, legal address. Blocked on
      the same entity data.
- [ ] **maib + Visa/Mastercard logos**, recommended in the footer. Asset pack is linked
      from the requirements page.
- [x] Detailed service descriptions, incl. method and terms of delivery — our service pages
      already do this; worth a re-read against their wording before submitting.

## 9. Onboarding sequence (maib's own steps)

1. Integrate and test against sandbox. Request test credentials (_Project ID / Project
   Secret / Signature Key_) from `ecom@maib.md`, naming the site and integration type.
2. Send successful test `payId`s + the site URL back to `ecom@maib.md` for review.
3. Complete and submit the merchant questionnaire (downloadable from the steps page).
4. Bank verifies the requirements in §8.
5. Sign the acceptance contract (branch or digital signature).
6. Register on the maibmerchants portal — needs domain, platform, **server/hosting IP**,
   and the user who gets portal access.
7. Activate the production project, fill Callback/Ok/Fail URLs, receive production
   credentials, and run one live transaction of ~10 MDL.

**Note the ordering:** testing comes _first_, before the contract. We can build and prove
the integration in sandbox while the entity and contract questions are still open — but we
cannot take a single real lev until steps 2–6 are done, and those are on the client's
calendar, not ours.

---

## 10. Proposed shape in our stack

Nothing here is built. This is the sketch to cost.

**`apps/api/src/app/payments/`** (new module)

- `maib.service.ts` — token cache + typed client for the seven endpoints; `verifySignature()`
  modelled on `calendly.service.ts` but with maib's message order and Base64 encoding.
- `payments.service.ts` — create a session for a payable thing, apply a callback
  idempotently, expose status, trigger refunds.
- `maib-webhook.controller.ts` — public `POST /payments/maib/callback`, reads `req.rawBody`,
  verifies, returns 200 fast, processes after.
- `payments.controller.ts` — authenticated back-office reads + refund; public
  `GET /payments/:checkoutId/status` for the return page (returns only a status, no PII).
- `payments.reconcile.ts` — scheduled sweep of non-terminal sessions.

**Prisma** — a `Payment` model (`checkoutId` unique, `paymentId`, `amount`, `currency`,
`status`, `method`, `rrn`, `approvalCode`, masked card, `orderId`, target type + id,
raw callback JSON for audit, timestamps) and a `Refund` model. Keep the existing
`PaymentStatus` on the domain entities as a derived mirror so nothing that reads it breaks.

**Frontend** — a pre-payment step per product (summary + T&C checkbox + payer details),
then a server action that calls our API and redirects to `checkoutUrl`; return pages at
`/[locale]/payment/success` and `/[locale]/payment/failed` (English slugs, matching the
existing route convention) that poll our status endpoint.

**Env** (`apps/api/.env.example`): `MAIB_BASE_URL`, `MAIB_CLIENT_ID`, `MAIB_CLIENT_SECRET`,
`MAIB_SIGNATURE_KEY`, `MAIB_CALLBACK_URL`, `MAIB_SUCCESS_URL`, `MAIB_FAIL_URL`.

**Payable things, in the order they are worth building:**

1. **Întrebare EXPRESS** (8 EUR) — smallest, and the client's own example flow is
   pay-then-ask, so there is no fulfilment risk if the payment fails.
2. **Deliverables** (menus, protocols) — `DeliverableOrder` already stores a stamped
   `priceEur`; pay → form → delivery.
3. **Paid library materials** — `Material.price` already exists and its comment already
   says it is waiting on this module.
4. **Consultations** — last, because it has to interleave with the Calendly booking flow,
   and "pay before the slot is held" versus "hold then pay" is a real UX decision that has
   not been made.

**Rough effort**, once unblocked: 2–3 days for the API module and sandbox proof, 2–3 days
for the frontend flows and return pages, 1–2 days for back-office visibility and refunds,
plus the client-side onboarding calendar which we do not control. MIA sandbox simulation
adds most of a day on its own.

---

## 11. Sandbox findings vs. the documentation (2026-09-10)

Verified with the sandbox credentials, `MAIB_BASE_URL=https://sandbox.maibmerchants.md`.
Every one of these would have cost debugging time if we had trusted the docs.

| #   | Docs say                                          | Sandbox does                                      | Impact                                                                       |
| --- | ------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | `expiresIn: 300`                                  | `1800`                                            | Read the value, never hardcode the TTL.                                      |
| 2   | Errors are `{ ok: false, errors: [...] }`         | HTTP **200**, `errors[]` present, **`ok` absent** | Success test must be `ok === true`, not "no errors" and not the status code. |
| 3   | Error catalogue is `maib.merchant.payments-4xxxx` | Also `payments.acquiring.payments.app-0602003`    | A second, undocumented namespace. Always keep a default branch.              |
| 4   | Status `WaitingForInit`                           | `Waitingforinit`                                  | Normalise case before comparing; do not type the union off the docs.         |

Also observed, and not in the docs at all:

- Session lifetime is **25 minutes** from creation.
- Omitting `callbackUrl` yields `callbackUrl: null` and **no callback is ever sent** — a
  silent failure mode. Always pass all three URLs.
- The hosted page lives at `https://checkout-sandbox.maib.md/{checkoutId}`; production is
  presumably `checkout.maib.md`, to be confirmed.
- Our profile is **MDL-only** today (see §7.1).

### What can be built now, before the client unblocks

The sandbox works, so the API module and its sandbox proof (§10) can be built and tested
today — maib's own onboarding puts testing _before_ the contract. What still cannot happen
without the client: a public HTTPS callback URL (hosting), the legal entity, the
questionnaire, the contract, and therefore any real payment.

---

## 12. What the client told the bank (2026-09-10)

maib asked her for the standard onboarding questionnaire; her answers are now binding
inputs for us, and three of them change things.

| maib asked           | She answered                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site URL             | `https://dr.oleseajalba.md` — ⚠️ wrong, see §12.1                                                                                                                                                                    |
| Test user            | Not needed yet; the developer will supply one if required                                                                                                                                                            |
| Platform             | Custom, individually developed                                                                                                                                                                                       |
| Activity             | Medical & nutrition services: pediatrics, nutrition (children + adults), integrative consultations, monitoring and subscription packages, digital educational materials — deliverable online and payable on the site |
| Transaction currency | **MDL**                                                                                                                                                                                                              |
| Integration type     | **Standard payment, no card saving** — but the solution must allow enabling card saving later for recurring/subscriptions                                                                                            |
| MIA                  | **Yes**, if it can run alongside card payment                                                                                                                                                                        |
| Technical contact    | `granici.design@gmail.com` (Serghei)                                                                                                                                                                                 |

Good news first: the activity description is on record and maib issued sandbox keys after
reading it, so open question §7.4 (are medical consultations acceptable) is effectively
answered in practice — though only the questionnaire and contract make it formal.

### 12.1 ⚠️ The domain she gave the bank is not the one she owns

She told maib the site is at `https://dr.oleseajalba.md`. The domain she actually bought
is the apex — **`oleseajalba.md`**, with no `dr.` subdomain. The checkout page already
displays the merchant as `oleseajalba.md`, so the bank's own profile and her questionnaire
answer disagree with each other.

**Correct this with maib explicitly** (it is in the feedback draft), otherwise step 3 of
onboarding — the compliance review, where the bank opens the URL and looks for the T&C
page, the IDNO and the logos — points at a hostname that will never exist.

Current state, checked 2026-09-10: the domain is registered but **has no nameservers
delegated yet** — no `NS`, no `A`, nothing resolves for the apex, `www`, or `dr.`. So there
are two separate pieces of work here, not one:

1. **Delegate DNS** — point the domain at nameservers. Independent of us and of the deploy;
   worth starting now because propagation is dead time.
2. **Deploy the site to it.** The frontend is on Vercel today under a `vercel.app` alias
   (see `[[vercel-deploy]]`), so this is a domain attachment plus DNS records. The API is
   the harder half — it still needs the stable public HTTPS host from
   `docs/questions_v3.md` §2, and maib's portal registration (step 5) asks for the
   **server IP** as well as the domain.

Until the site is live at `oleseajalba.md`, the bank's compliance check cannot pass, and
neither can the callback ever be delivered (§14).

### 12.2 Currency — resolved, mostly

Her questionnaire said MDL, but she went back and asked maib whether both were possible.
Their answer: _"Integrarea este posibila in ambele valute, insa decontarea finala va fi in
MDL."_

So **the EUR catalog can stay** — the earlier worry that we would have to re-price
everything in MDL is off the table. Two things still need doing:

1. **Get EUR enabled on our profile** — it is refused today. See §7.1; this is a one-line
   request to `ecom@maib.md`, and until it lands we cannot test a single EUR payment.
2. **Decide what the patient sees.** "Both currencies are possible" is a technical fact,
   not a product decision. The realistic options:
   - **EUR only** — matches the site and the 2026-06-24 brief. Simplest. Local patients pay
     in EUR on an MDL card and their issuer converts.
   - **MDL only** — no conversion for local patients, but reverses the brief.
   - **Patient picks at checkout** — best for a practice split between Moldova and the
     diaspora, and the closest match to her own reference site (Dr. Petrache). Costs a
     currency toggle, two price fields per service, and a rounding policy.

   Recommendation: **EUR only for now**, patient-selectable later if the diaspora traffic
   justifies it. One currency in the catalog is one currency in the database, and
   `Service.price` / `DeliverableOrder.priceEur` / `Material.price` are all single-value
   `Int` columns today — adding a second currency is a schema change, not a config flag.

3. ⚠️ **Disclose the conversion.** A patient paying EUR with an MDL card is converted by
   _their_ issuer, at a rate we do not control and often with a fee. Her own reference site
   carries exactly such a note. This belongs on the pre-payment step next to the T&C
   checkbox, in all three languages — and it is the kind of thing the bank looks for during
   the site review.

### 12.3 Card saving

Covered in §1. Short version: no maib API does MIA and saved cards at once, so the "allow
it later" clause needs one question to maib and one to her about whether recurring is a real
plan — the subscriptions decided on 2026-07-01 are on-request and involve no automatic charge.

---

## 13. Validation tests for maib (2026-09-10) — both passed

maib asked for two tests before issuing production access: one successful payment and one
refund of it, then a short written report. Both were run against sandbox with the official
test card (`5102180060101124`, `06/28`, CVV `760`, cardholder `Test Test`).

|               | Value                                      |
| ------------- | ------------------------------------------ |
| `checkoutId`  | `21e8f276-4ff5-49ff-829b-7faec3d49771`     |
| `orderId`     | `VALIDARE-20260910-1042`                   |
| Amount        | 160.00 MDL                                 |
| **`payId`**   | **`3a8b125b-165f-4fdb-b97c-51d1fb4d11ac`** |
| RRN           | `625308713525`                             |
| Approval code | `413316`                                   |
| Terminal      | `0149587`                                  |
| `refundId`    | `67c9c205-3efd-4a36-ae75-01c83f8f2e38`     |

Payment: checkout `Completed`, payment `Executed`. Refund: full, `Created` → `Accepted`,
payment moved to `Refunded` with `refundedAmount: 160.0`.

### What the tests taught us beyond the docs

- ⚠️ **MIA is not enabled on our profile.** The hosted page offered a single method, `Card`.
  The client told the bank she wants MIA alongside card (§12) — this has to be requested
  explicitly, and until it is, the main reason we chose Checkout v2 over v1 is not actually
  available to us.
- ⚠️ **`paymentMethod` is `Card` before the refund and `None` after it.** Capture the method
  at payment time and store it; do not read it back off the payment after a refund.
- **Payment status gains `Refunded`**, which is not in the documented enum. Another reason
  to normalise defensively rather than typing a union off the docs (§11).
- **Refunds carry a `refundType`** — ours came back `Full`, so partial refunds exist even
  though the docs never say so. The refund status flow is `Created` → `Accepted`.
- The payment object carries undocumented fields we should persist: `refundedAmount`,
  `requestedRefundAmount`, `referenceNumber` (the callback calls the same thing
  `retrievalReferenceNumber`), `terminalId`, `mcc`, `note`, `type` / `providerType` (`MMC`).
- **No 3-D Secure challenge appeared** — the sandbox test card authorises straight through.
  So our 3DS handling is completely untested; `threeDsResult` never got exercised.
- Redirect parameters matched the docs exactly: `checkoutId`, `checkoutStatus=Completed`,
  `orderId`.
- The checkout page shows the merchant as **`oleseajalba.md`** — which is the domain she
  actually owns, not the `dr.` subdomain she gave the bank in the questionnaire (§12.1).

### Still untested

The **back-channel callback and its signature** — we have no public HTTPS endpoint yet, and
without `callbackUrl` maib sends nothing (§3). This is the single riskiest untested piece,
because it is where the signature-order and Base64 gotchas (§4) live. It has to be exercised
once the API is deployed somewhere reachable.

---

## 14. Where to check statuses — and two more traps

**There is no sandbox dashboard available to us.** The merchant portal at
`maibmerchants.md` is a real UI but sits behind a login, and portal registration is
onboarding **step 5** — after the questionnaire, the compliance check and the contract
(§9). `sandbox.maibmerchants.md` is the API host, not a UI; it answers 403 to a browser.

So today, status checks go through the API — with a caveat:

### ⚠️ The list endpoints are broken in sandbox

Both of them, on every call, with any combination of query parameters (none, `count`,
`offset`, `orderId`, `status`, `createdAtFrom`, `sortBy`/`order`):

| Endpoint            | Response                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET /v2/checkouts` | `maib.merchant.payments-1001` — "Technical error occurred in the system. Call system administrators." |
| `GET /v2/payments`  | `maib.common-2` — same message                                                                        |

Lookups **by id** work fine: `GET /v2/checkouts/{id}`, `GET /v2/payments/{id}`,
`GET /v2/payments/refunds/{id}`.

Two consequences:

1. **Report this to maib** along with the test feedback — if it is also broken in
   production, the back office cannot have a payments list at all.
2. **We must persist every id ourselves at creation time.** That was already the plan
   (§10, the `Payment` table), but it is now non-negotiable rather than a convenience:
   an id we fail to store is a payment we can never look up again.

`scratchpad/maib_status.py` is a throwaway CLI for checking ids by hand until the module
exists — it takes any mix of checkout / payment / refund ids and prints their state.

### ⚠️ The WAF rejects a GET that carries `Content-Type`

Found while writing that script. A `GET` with `Content-Type: application/json` is answered
by the WAF in front of the API with **403** and a body of `{"supportID": "…"}` — not an API
error, not JSON in the documented shape. Drop the header and the same request succeeds.

This will bite the NestJS client: a shared axios/fetch instance configured with a default
`Content-Type: application/json` header sends it on GETs too. **Set the header per-request,
only where there is a body.** The failure looks like an auth or routing problem, so without
knowing this it costs an afternoon.

---

## 15. The ledger — built 2026-09-10

`apps/api/src/app/payments/` now exists and persists payment state, linked to a patient.
Verified end to end against the real sandbox payment from §13.

### Who a payment belongs to

⚠️ **Patients have no accounts, by the client's own decision** — she chose the tokenized
personal link over a patient cabinet (`docs/questions_v3.md` §3). So "payment history"
means:

- **The doctor sees it**, per patient, in the back office: `GET /payments/patient/:id`.
- **The patient sees it by email** — the confirmation maib requires us to send (§8).

If a patient-facing "my payments" page is ever wanted, that needs patient authentication,
which is a separate and much larger piece of work. Nothing here blocks it: the `Payment`
row already carries the link.

The linking rule is deliberately conservative. A payment is attached to a `Patient` only
when one with that email **already exists** — paying for something does not silently create
a medical record. `payerEmail` is always stored, and `historyForPatient()` matches on the
link _or_ the email, so promoting a payer to a patient later brings their whole history
with them instead of starting it at zero.

### Schema

`Payment` — `checkoutId` (unique, the callback's idempotency key), `paymentId`, our own
unique `orderId`, normalized `state`, `Decimal(12,2)` amount and `refundedAmount`, method,
polymorphic `targetType`/`targetId`, payer fields, optional `patientId`, the bank's
`rrn` / `approvalCode` / `cardMask` / `threeDsResult` / `terminalId`, the verbatim
`rawCallback` for disputes, and `expiresAt` / `paidAt` / `failedAt`.
`PaymentRefund` — one row per refund, with who authorised it.

Migration `20260910120000_payments`, applied locally. Enums mirrored into
`packages/shared/src/lib/enums.ts` as the schema header requires.

### Routes

| Route                              | Access                | Purpose                                      |
| ---------------------------------- | --------------------- | -------------------------------------------- |
| `POST /payments/maib/callback`     | public, HMAC-verified | The bank's notification                      |
| `GET /payment-status/:orderId`     | public, no PII        | The return page asks us, not the redirect    |
| `GET /payments`                    | admin/editor          | The ledger, filterable by state              |
| `GET /payments/patient/:patientId` | admin/editor          | One person's history                         |
| `GET /payments/:id`                | admin/editor          | Detail with refunds                          |
| `POST /payments/:id/sync`          | admin/editor          | Re-ask the bank when a callback goes missing |
| `POST /payments/:id/refund`        | **admin only**        | Refund, recorded with the author             |

`GET /payment-status/:orderId` is a separate controller on its own path on purpose:
`RolesGuard` reads class-level `@Roles` metadata and does **not** consult `@Public()`, so a
public route inside a guarded controller returns 403. Its own path also keeps it clear of
`GET /payments/:id`, which would otherwise shadow it depending on controller order.

### Three defences worth keeping

1. **The row is written before the payer sees the page.** The bank's list endpoints are
   broken (§14), so an id we did not store is a payment we can never find again.
2. **The bank is the authority, not the callback.** `publicStatus` re-syncs any
   non-terminal payment, and a 10-minute cron sweeps anything still open past the
   25-minute session lifetime.
3. **`paymentStatus` on the bought thing is mirrored, not replaced** — every existing
   back-office screen keeps working without knowing that `Payment` exists.

### Verified

Seeded the real §13 checkout, called `GET /payment-status/...`, and the API fetched from
sandbox and mapped `Completed` + `Refunded` → our `refunded`, persisting amount 160.00,
`refundedAmount` 160.00, method `Card`, RRN `625308713525`, approval `413316`, terminal
`0149587`, `paidAt` 2026-09-10T08:42:49Z, linked to the seeded patient. Test rows removed
afterwards.

### Not built yet

- **Callback delivery has still never been exercised** (§13) — no public HTTPS host.
  The signature code is written and matches the documented algorithm, but until a real
  callback arrives it is unproven.
- **Nothing calls `PaymentsService.start()` yet.** The lead flows (EXPRESS, deliverables,
  materials, appointments) still have to be wired to it, along with the pre-payment step
  carrying the T&C checkbox and the currency-conversion notice (§8, §12.2).
- Amounts serialize as Prisma `Decimal` (`"160"`), so the DTO mapper for the back office
  should format them before display.

---

## 16. GDPR and the legal pages (2026-09-10)

The privacy policy said, in three languages, _"we don't collect card data — there is no
online payment"_, and the terms said payment was **exclusively** by bank transfer. True
until now; false the moment maib goes live, and precisely the kind of claim an acquirer
review reads closely. Both are updated.

### `/gdpr` — what changed

- **Payment-data category** rewritten: amount, currency, order reference, status, and from
  the bank the last digits of the card plus the transaction codes. Full card details never
  reach us.
- **New "Plăți online" section** with its own anchor in the table of contents. Three
  paragraphs: what we send the bank before the redirect, what comes back, and the fact that
  payment records are kept apart from medical data — the accounting documents never say
  what a consultation was about.
- **Legal basis** gained an entry: processing the payment performs the contract; keeping the
  record is an accounting and tax obligation.
- **Recipients**: BC "MAIB" S.A. named, and described as **its own controller** under
  banking and payment-scheme rules — not as our processor. Calling an acquirer an
  _împuternicit_ would be wrong, and the lawyer will check that line first.
- **Retention** gained the payment paragraph, including the part people actually need to
  hear: payment records survive an erasure request, because the law requires the fact and
  the amount to be kept — but nothing about their health.

### `/terms` — the minimum to stop it contradicting

The payment section now says card or MIA on the bank's secure page, or bank transfer. This
was a factual correction, not a rewrite of the payment terms.

`docs/gdpr.md` and `docs/termeni.md` carry the same edits, so the source docs and the pages
have not drifted.

### Deliberately not invented

**No retention period in months or years.** Moldovan accounting law sets it, the client's
entity determines which regime applies, and the page's existing convention is to say
"the periods required by law" rather than guess. It joins the list the lawyer has to fill in.

### Still owed before the acquirer review

- The **T&C acceptance checkbox on the payment step** (§8) — the hosted page is maib's, so
  the checkbox has to live on our pre-redirect step. Nothing like it exists yet.
- The **currency-conversion notice** for a patient paying EUR on an MDL card (§12.2), in
  all three languages, next to that checkbox.
- A **refund/return policy** the bank will look for in the T&C: the cancellation section
  covers consultations, but not the deliverables or paid library materials.
- Both legal pages remain **drafts** pending the entity data and a lawyer — unchanged by
  this pass, and still gated behind `LegalDraftNotice`.

---

## 17. What else of maib's is worth using

maib publishes four APIs. We use one. Reviewed the other three against what this practice
actually sells; ranked by whether they earn their integration cost.

### ⭐ Request to Pay — the one to take, and it answers the card-saving question

`POST /v2/rtp`: the merchant creates a payment request against a **phone number**
(`373xxxxxxxx`), the patient gets a prompt in their bank app, accepts or rejects, and we
get a server-to-server callback. Amount, description, `orderId`, `callbackUrl`, and an
expiry of anywhere from **1 minute to 60 days**. MDL only. Same auth, same envelope, same
signature scheme as Checkout — most of `MaibService` is reusable. Sandbox even ships
`test-accept` / `test-reject` endpoints, so it is testable without a phone.

**Why it matters here:** subscriptions were decided **on-request** on 2026-07-01 — the
doctor talks to the patient, agrees a duration and a price, and today that ends in a manual
bank transfer she has to go and check. RTP is exactly that workflow, automated: she sets
the price, sends the request, and the callback tells us it was paid.

And it is the honest answer to the client's _"let us enable card saving later for
subscriptions"_ (§1, §12.3). Recurring billing needs the v1 API, which has no MIA, plus
stored-card exposure. RTP gets the same outcome — money arriving for an agreed subscription
without re-entering card details — with no saved card, no PCI surface, and no second
checkout integration.

✅ **Already reachable on our credentials.** A probe returned:

```
maib.merchant.payments-14002 — MIA MCC is not set
(systemErrorCode: payments.acquiring.core-0202004)
```

Not "no such endpoint", not "not authorised" — a **profile setting**. The same setting that
is keeping MIA off the checkout page. So one configuration request to the bank plausibly
unlocks MIA on Checkout _and_ Request to Pay together; the feedback draft now asks whether
RTP needs a separate request.

### Free wins on the Checkout we already have

- **`orderInfo.items[]`** — we send only a description. The hosted page can list line items
  (title, amount, quantity), so a patient buying a 30-day menu plus a protocol sees what
  they are paying for on the bank's own page. Pure upside; the field is already in
  `MaibCheckoutRequest`.
- **`POST /v2/checkouts/{id}/cancel`** — wired in `MaibService`, called by nothing. When a
  booking is cancelled or a lead deleted before payment, cancel the session instead of
  leaving it to expire. Keeps the ledger honest and the `pending` tab meaningful.

### Direct MIA QR — only if there is an in-person moment

Static, dynamic and hybrid QR codes; static ones take a free or controlled amount and can
live on a sticker or poster. Genuinely useful if she ever takes payment in the cabinet.
Note it supports **callbacks only — no redirect URLs**.

We will likely touch this API anyway just to _test_ MIA in sandbox (§6), but that is a test
harness, not a product. **Recommend skipping** unless an in-person payment case actually
exists — a second integration for a hypothetical is how scope explodes.

### Two-step payment (v1) — tempting, recommend against

Authorise at booking, capture after the consultation happens. Attractive against no-shows,
but it lives in the **v1 e-Commerce API, which has no MIA** — adopting it costs the client
the payment method she asked for by name. Her 24-hour cancellation rule already covers the
case.

### Plugins and SDKs — not applicable

PHP and .NET only, plus Tilda/Gomag/Cartum/ECOM platform plugins. Nothing for a custom
Next.js + NestJS stack; we write the client by hand, which we have.

### Order of operations

None of this before the two things already blocking: **EUR and MIA enabled on the profile**,
and **the callback proven on a public HTTPS host** (§13). RTP is a callback-only flow — it
has no browser redirect to fall back on — so it is strictly downstream of getting callbacks
working at all.

---

## 18. Re-read of the documentation before the checkout build (2026-09-10, evening)

Read again from `https://docs.maibmerchants.md/checkout/llms.txt` (the page index; the
paths guessed from the section names 404, the index is authoritative). Compared against
`maib.service.ts`, `payments.service.ts` and §§1–17 above. What holds, what changed,
what the checkout step must add.

### Confirmed, no action

- Signature: `HMAC_SHA256(key, "{rawBody}.{timestamp}")`, base64, `X-Signature:
sha256=…`, `X-Signature-Timestamp` in **milliseconds**, constant-time compare,
  freshness "less than N minutes" with N left to us. Matches `verifySignature()` and the
  5-minute window exactly. The Node sample on the "Signature Key Verification" page is
  the same algorithm.
- Callback fires "after a successful payment"; nothing promised for failed, expired,
  cancelled or refunds. So `publicStatus` re-syncing with the bank and the 10-minute
  reconcile sweep remain the authority, not the callback.
- Redirect query on `successUrl`/`failUrl`: `checkoutId`, `checkoutStatus`
  (`Completed`|`Failed`), `orderId`. Still untrusted; our `?order=` is appended before
  theirs and the return page asks `/payment-status/:orderId`.
- Session statuses per docs: `WaitingForInit | Initialized | PaymentMethodSelected |
Completed | Expired | Abandoned | Cancelled | Failed`. Sandbox returns them in
  different casing (§11); `toPaymentState` lowercases, so both spellings work.
- Error envelope `{ ok:false, errors:[{errorCode, errorMessage, errorArgs}] }` and the
  catalogue `42000–42007`, `43000–43001`, `44000–44003`, `common.error-1`. Two codes we
  had not listed: `42005` "Field has invalid format" (this is what a non-E.164 phone
  will produce) and `43000` "merchant does not exist". The undocumented
  `payments.acquiring.payments.app-*` namespace seen in sandbox (§11) is still not in
  the docs; the default branch in the client stays.
- Refund: `amount` + `reason` (max 500) required, response status `Created` only.
  `RefundPaymentDto` already caps `reason` at 500. Sandbox additionally shows
  `Accepted` and `refundType` (§13); handled.
- Sandbox: same test card, MIA completes only through the QR API simulation with IBAN
  `MD88AG000000011621810140`. No failure or 3-D Secure test cards are documented, so
  the failed-payment path can only be exercised by abandoning or cancelling a session.
- No saved cards, recurring, tokenisation or one-click anywhere in the Checkout docs.
  §1 and §17 stand: Request to Pay is the honest answer to the subscription question.
- "Retrieve all checkouts" documents `count`/`offset`/`totalCount` filters and says
  nothing about sandbox; the endpoint is still broken there (§14). Persisting every id
  ourselves stays mandatory.

### Divergences that need code — go into the checkout shape (PLAN.md A8 / 12a)

1. **`CompletedAt`, `FailedAt`, `CancelledAt` are capitalised in the documented
   `GET /v2/checkouts/{id}` schema** (like `PaymentId`), while `MaibCheckout` reads
   `completedAt` in lower case. The sandbox returned lower case and the §15
   verification passed on it, so production may differ from sandbox in the other
   direction. Read both spellings, as already done for `PaymentId`/`paymentId`.
2. **`payerInfo.phone` must be E.164** or the whole session is refused with `42005`.
   Nothing in the codebase normalises phones; leads store them as typed. The checkout
   must normalise (`+373…`) or omit the field when it cannot.
3. **`amount` must be `> 1.00`**. `start()` has no guard. Services priced `0` (on
   request, free consult) and any future discount below one unit must never reach
   `createCheckout`; guard in `start()` with a clear error, not a bank error.
4. **`orderInfo.items[]`** (title ≤ 125, amount, currency, quantity, displayOrder) is
   still unused; the hosted page shows line items. Send one item per purchase.
5. `description` ≤ 125 is already sliced; `orderInfo.date` (ISO 8601) is cheap to add.

### Documented but not in this section of the docs

The merchant-site requirements (T&C page, acceptance checkbox, confirmation email,
return-page contents, company details, logos) and the onboarding steps quoted in §8–§9
are **not** part of the Checkout index any more; they lived on a separate
"integration requirements / steps" page that now 404s under `/checkout/`. Keep §8–§9
as the record of what maib asked, and ask `ecom@maib.md` for the current location of
that checklist before the compliance review.
