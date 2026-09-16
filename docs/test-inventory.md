# Test inventory — what each suite pins

Moved out of `TESTING.md` on 2026-09-16 so the posture document stays short.
This is the per-suite record as of 2026-09-12 (512 tests then; 534 after step 17; 554 after step 19; 568 after step 20).
Regenerate the counts with `find apps packages -name '*.spec.*'` rather than
trusting this file.

## Money and the bank

| Suite                                      | Tests | What it pins                                                                                                                                                                               |
| ------------------------------------------ | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `payments/payments.state.spec.ts`          |    27 | The bank's status strings mapped to our `PaymentState`, including the refund and partial-refund cases the sandbox spells differently from its own documentation.                           |
| `payments/maib.signature.spec.ts`          |    12 | Callback signature verification against recorded bodies. maib hashes `{rawBody}.{timestamp}` and base64-encodes it, the opposite order and a different encoding from the Calendly webhook. |
| `payments/start-guards.spec.ts`            |    10 | `checkoutAmount` and `resolveIntent`: a service priced 0 is "on request", maib refuses 1.00 or less, a repeat submit must neither charge twice nor strand a declined card.                 |
| `payments/maib.checkout-normalize.spec.ts` |     6 | The two spellings maib uses for `completedAt` / `paymentId`.                                                                                                                               |
| `payments/mirror-status.spec.ts`           |     6 | `paymentStatus` as a mirror of the `Payment` row, including a payment that stops being paid.                                                                                               |
| `payments/sla-clock.spec.ts`               |     4 | Where the EXPRESS clock starts: the bank's moment, not the moment the sweep noticed.                                                                                                       |
| `materials/material-price.spec.ts`         |     6 | What a paid material costs, composed with `checkoutAmount`.                                                                                                                                |
| `shared/deliverables.spec.ts`              |     6 | The group-C catalog: the brief's price per product, `undefined` for an unknown code. A price arriving in a request body is not a price.                                                    |
| `shared/phone.spec.ts`                     |     8 | E.164 normalisation; maib refuses a whole checkout with 42005 over a payer phone.                                                                                                          |

## Dates, deadlines and the promise to a patient

| Suite                                            | Tests | What it pins                                                                                                                 |
| ------------------------------------------------ | ----: | ---------------------------------------------------------------------------------------------------------------------------- |
| `working-hours/business-hours.spec.ts`           |    15 | `addWorkingMinutes` and `isOpenAt`: crossing midnight, weekends, both DST nights, all-days-closed, closes-before-opens typo. |
| `working-hours/normalize-days.spec.ts`           |     7 | What the `Json` schedule column becomes when it does not hold a schedule.                                                    |
| `working-hours/update-working-hours.dto.spec.ts` |     4 | The timezone field; an unknown zone used to turn every EXPRESS submission into a 500.                                        |
| `quick-questions/ticket-activation.spec.ts`      |     4 | Paying does not touch a ticket that is not `awaiting_payment`.                                                               |
| `deliverable-orders/order-activation.spec.ts`    |     5 | The same rule for a group-C order.                                                                                           |

## Access, sessions and the second factor

| Suite                                            | Tests | What it pins                                                                             |
| ------------------------------------------------ | ----: | ---------------------------------------------------------------------------------------- |
| `auth/refresh-rules.spec.ts`                     |    13 | Refresh-session validity: revoked, expired, rotated, reused; the 10-second grace window. |
| `auth/totp-code.spec.ts`                         |     7 | The TOTP acceptance window.                                                              |
| `auth/totp-lockout.spec.ts`                      |     4 | The per-account brake on guessing: doubling from one minute to fifteen.                  |
| `auth/totp-login-order.spec.ts`                  |     4 | The lock is reported before a code is asked for.                                         |
| `auth/guards/roles.guard.spec.ts`                |     6 | Deny by default.                                                                         |
| `auth/guards/must-change-password.guard.spec.ts` |     4 | The three routes an account on its starter password may reach.                           |
| `users/last-admin.spec.ts`                       |    10 | The practice keeps an administrator.                                                     |
| `users/starter-password.spec.ts`                 |     2 | CSPRNG, alphabet, length.                                                                |
| `seed/profile.spec.ts`                           |     6 | The seed refuses to give production an administrator with a password nobody chose.       |

## Files, uploads and what leaves the server

| Suite                                | Tests | What it pins                                                                        |
| ------------------------------------ | ----: | ----------------------------------------------------------------------------------- |
| `storage/file-signature.spec.ts`     |    17 | The magic-byte sniffer, including mp4 and webm.                                     |
| `uploads/upload-rules.spec.ts`       |    16 | Accepted types and the token rules: unknown, expired and revoked indistinguishable. |
| `materials/grant-rules.spec.ts`      |    14 | Who may have a paid material's file and for how long.                               |
| `materials/materials.mapper.spec.ts` |     9 | What the storefront may know about a material: neither `fileUrl` nor `fileKey`.     |
| `common/uploaded-file-url.spec.ts`   |    10 | `fileUrl` and `coverImageUrl` validated by path, deliberately not by host.          |

## Patient data and GDPR

| Suite                              | Tests | What it pins                                                                                                                                                                                                         |
| ---------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patients/erasure-targets.spec.ts` |     9 | The erasure plan against one row per table, including the rows that survived.                                                                                                                                        |
| `patients/interactions.spec.ts`    |     5 | Which branch each lead kind takes into the dossier timeline.                                                                                                                                                         |
| `common/patient-email.spec.ts`     |     5 | The dedup key for a medical record.                                                                                                                                                                                  |
| `common/mask-email.spec.ts`        |     5 | The one email mask the logs rely on.                                                                                                                                                                                 |
| `mail/patient-templates.spec.ts`   |    21 | Which language a patient is written to in, and the fallback; prescription text verbatim, no name in the greeting; the three prescription shapes (text, text and file, file only), text only unchanged line for line. |
| `patients/send-refusal.spec.ts`    |    11 | Why an entry cannot be emailed, in order: mail off before too large; exactly 10 MB passes; a prescription with a file passes, and text does not bypass the size limit.                                               |
| `patients/entry-content.spec.ts`   |     5 | What an entry may hold: a prescription text, file or both, a document a file, no file on anamnesis or a note.                                                                                                        |
| `patients/patient-locale.spec.ts`  |     3 | The patient's language is the newest lead's, across all four tables.                                                                                                                                                 |

## What leaves the building

| Suite                          | Tests | What it pins                                                                               |
| ------------------------------ | ----: | ------------------------------------------------------------------------------------------ |
| `shared/sentry-scrub.spec.ts`  |     9 | No request body, query, `Authorization` or `Cookie` leaves; token path segments redacted.  |
| `health/backup-status.spec.ts` |     7 | What `/health` makes of `last-run.json`: failed, stale, unparsable, `"false"` as a string. |

## Boundaries and plumbing

| Suite                                                 | Tests | What it pins                                                                   |
| ----------------------------------------------------- | ----: | ------------------------------------------------------------------------------ |
| `appointments/calendly.payload.spec.ts`               |    20 | What we keep from a Calendly payload, including the reschedule link.           |
| `appointments/calendly.signature.spec.ts`             |    13 | Calendly's webhook signature against recorded bodies; the 180 s replay window. |
| `media-appearances/media-appearances.service.spec.ts` |     5 | `youtubeVideoId`, the SSRF guard.                                              |
| `common/prisma-errors.spec.ts`                        |    14 | Four writes that answered 500 now answer 409/404.                              |
| `common/captcha/captcha.service.spec.ts`              |    13 | Fail-open by design, including a hanging Google.                               |
| `common/slugify.spec.ts`                              |     8 | One `slugify` in `packages/shared`.                                            |
| `common/dto/pagination.spec.ts`                       |     7 | The envelope and its ceiling.                                                  |
| `blog/post-visibility.spec.ts`                        |     6 | Deferred publication, boundary included.                                       |

## The public site (`apps/frontend`, Vitest)

| Suite                         | Tests | What it pins                                                                |
| ----------------------------- | ----: | --------------------------------------------------------------------------- |
| `lib/form-errors.spec.ts`     |    17 | The four failures a visitor can act on, in three languages.                 |
| `lib/service-price.spec.ts`   |    16 | Every price and duration string, in three locales.                          |
| `lib/api.spec.ts`             |    14 | `serviceTag` in three languages; `getJson` at build time versus at runtime. |
| `lib/working-hours.spec.ts`   |    14 | Opening hours and the EXPRESS promise.                                      |
| `lib/validation.spec.ts`      |     7 | The one anchored email regex.                                               |
| `lib/calendly.spec.ts`        |     6 | The absence of a fallback: no scheduling URL, no button.                    |
| `lib/contacts.spec.ts`        |     6 | A phone number written for a human and dialled by a machine.                |
| `lib/service-content.spec.ts` |     5 | An untranslated field reads as Romanian; an empty one renders nothing.      |
| `lib/site-media.spec.ts`      |     5 | An empty slot renders nothing rather than a blank rectangle (step 17).      |
| `lib/markdown.spec.tsx`       |     4 | GFM tables survive; outbound links carry `rel="noopener"`.                  |

## The back office (`apps/back-office`, Vitest)

| Suite                                          | Tests | What it pins                                                                    |
| ---------------------------------------------- | ----: | ------------------------------------------------------------------------------- |
| `auth/session-rules.spec.ts`                   |    8+ | `totpLockSeconds`, throttle lockout, and the return path with its query string. |
| `api/http.spec.ts`                             |    6+ | Answers that are not a 200 with JSON.                                           |
| `features/services/calendly-readiness.spec.ts` |     + | Green only when every group-A event exists and is active (step 17).             |
| `features/media/parse-url.spec.ts`             |     7 | Every shape of media link the doctor might paste.                               |
| `features/payments/format.spec.ts`             |     6 | The receipt text and money typed on a Romanian keyboard.                        |
| `features/about/form-schema.spec.ts`           |     5 | Only the Romanian title is required.                                            |
| `features/quick-questions/format.spec.ts`      |     5 | The EXPRESS countdown.                                                          |
| `features/working-hours/sla.spec.ts`           |     5 | How any SLA value reads in Romanian.                                            |
| `features/dashboard/format.spec.ts`            |     3 | The delta badge.                                                                |

## The end-to-end path, in detail

`apps/frontend-e2e/src/smoke.spec.ts`: the EXPRESS checkout on a production build,
a real maib sandbox session, the test card, the return page saying "Plata a fost
confirmată", then the back-office API confirming the ticket is `open`, `confirmed`
and carries a `dueAt`; the negative is asserted twice (the ticket is invisible
before payment). Runs in about 12 seconds with a trace and a video.

Two things learned writing it: the acquirer's expiry field is a keypress-driven
mask that splits into two hidden inputs, so `fill()` silently produces a rejected
form and card details are typed with `pressSequentially`; the checkout inputs are
addressed by label because `useId` changes between builds.

Not covered here: the bank's callback (never delivered, no public host), refunds,
the group-C and paid-material checkouts, the doctor's answer. Those are the 14
hand-run acceptance points recorded in `docs/plan-log.md`, step 12c.
