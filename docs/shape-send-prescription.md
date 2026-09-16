# Shape — the doctor sends a prescription or a document to the patient

Written 2026-09-16 for `PLAN.md` step 19, per `AGENTS.md` R1. No code until approved.

## Goal

On a `prescription` or `document` entry in the dossier, "Trimite pacientului" emails it
to the patient in their language: the prescription as text in the body, the document
as an attachment. Every send is recorded (who, when, to which address) and shown
under the entry, and can be sent again. Without SMTP nothing pretends to have left.

## Approach

`POST /patients/:id/entries/:entryId/send`, `admin` only (same as the whole
controller). The service checks refusals in a fixed order, sends through
`PatientNotificationsService`, and **records the send only after the transport
accepted it**. The recipient is always `Patient.email` at that moment, never a typed
address: a free-text field is how a medical file reaches the wrong parent.

Refusals, in this order (a pure function, `send-refusal.ts`):

1. type is not `prescription` / `document` → `422 entry_not_sendable`
2. prescription with an empty body, or document with no file → `422 entry_empty`
3. SMTP not configured → `503 mail_not_configured` (before the size check: fixing the
   file is pointless while mail is off)
4. file larger than `ATTACHMENT_MAX_BYTES` → `422 attachment_too_large`
   `{ sizeBytes, maxBytes }`
5. transport rejected the message → `502 mail_send_failed`; no row written

**Attachment limit: 10 MB of file.** Base64 adds a third, so ~13.4 MB on the wire,
which fits Gmail (25 MB) and Outlook.com (20 MB) with room for the body. Uploads allow
20 MB (`DOCUMENT_MAX_BYTES`), so a 10–20 MB document can be stored but not emailed;
the back office says so and tells her to send it another way. No link fallback (below).

**Language.** `Patient` has no locale. The four lead tables do. `findOne` adds
`lastKnownLocale`: the locale of the patient's most recent appointment, subscription,
EXPRESS ticket or group-C order, `null` if none (pure function `patient-locale.ts`).
The dialog preselects it (`null` → `ro`), she can change it, and the request carries
`locale` explicitly. The chosen locale is stored on the send row.

**From / Reply-To.** From stays `SMTP_FROM`, the practice mailbox. Reply-To comes from
a new optional env `DOCTOR_REPLY_TO_EMAIL`; unset means no header and replies land in
the practice mailbox, which is honest, not broken. Only this message sets Reply-To.

**Templates.** Two kinds, each in ro/en/ru in the existing `Templates<Vars>` shape:
`PRESCRIPTION_TEMPLATES` (greeting, the body text verbatim, signature) and
`DOCUMENT_TEMPLATES` (greeting, entry title, "the file is attached", signature). Plain
text like every other patient message; markdown in the body goes as written.

**Attachment in `MailService`.** `ClientMail` gains optional `attachments`
(`{ filename, path, contentType }`, streamed by nodemailer from disk, never read into
a buffer) and `replyTo`. Nothing else in the service changes.

## Schema

New table, generated migration `patient_entry_sends`:

```
PatientEntrySend
  id          uuid pk
  entryId     → PatientEntry, onDelete Cascade   (erasure takes it with the entry)
  sentById    → User?, onDelete SetNull           (name shown in history)
  toEmail     String                              (snapshot; patient email may change)
  locale      Locale
  fileName    String?                             (what was attached, if anything)
  sentAt      DateTime default now()
  @@index([entryId, sentAt])
```

`PatientEntryDto.sends: PatientEntrySendDto[]` (newest first), `PatientDto.lastKnownLocale`.

## Files

API
- `apps/api/prisma/schema.prisma`, `migrations/<ts>_patient_entry_sends/`
- `apps/api/src/app/mail/mail.service.ts` — `attachments`, `replyTo` on `ClientMail`
- `apps/api/src/app/mail/patient-templates.ts` (+ spec) — the two template sets
- `apps/api/src/app/mail/patient-notifications.service.ts` — `prescription()`,
  `document()`; reads `DOCTOR_REPLY_TO_EMAIL`; distinguishes "not configured" from
  "transport failed" (today both are `sent: false`)
- `apps/api/src/app/patients/send-refusal.ts` (+ spec), `patient-locale.ts` (+ spec)
- `apps/api/src/app/patients/dto/send-entry.dto.ts` — `locale: Locale`
- `apps/api/src/app/patients/patients.{controller,service,mapper,module}.ts` — route,
  `sendEntry`, sends in `timeline`, `lastKnownLocale` in `findOne`, a
  `PatientEntrySend` cascade count in the erasure report, audit line
  `entry.send patientId entryId sendId userId` (no address)
- `packages/shared/src/lib/dto.ts`, `packages/shared/src/lib/uploads.ts` —
  DTOs, `ATTACHMENT_MAX_BYTES`

Back office
- `apps/back-office/src/features/patients/send-entry-dialog.tsx` — new: recipient
  address, language select, attachment name and size, previous sends, confirm
- `apps/back-office/src/features/patients/timeline.tsx` — action on the two entry
  types, send history under the card
- `apps/back-office/src/features/patients/api.ts` — mutation, invalidates the timeline
- `apps/back-office/src/i18n/ro.ts` — action, dialog, the four error messages

Infra and docs
- `docker-compose.yml` — `mailpit` service under profile `mail` (1025 SMTP, 8025 UI,
  `MP_SMTP_AUTH_ACCEPT_ANY=1`, `MP_SMTP_AUTH_ALLOW_INSECURE=1`, because `MailService`
  requires user and password)
- `.env.prod.example`, `docs/deployment.md` — `DOCTOR_REPLY_TO_EMAIL`
- `module_patients.md`, `docs/test-inventory.md`

## What it deliberately does not do

- **No download link instead of an attachment** for files over 10 MB. A public token
  to a medical file is a new attack surface; `MaterialGrant` shows the cost. Separate
  step if she asks.
- **No typed or alternative recipient.** Wrong address means she fixes the dossier.
- **No failed-attempt rows.** The history lists messages that left; failures are the
  error on screen and a log line.
- **No idempotency on repeat.** Sending again is the feature; the dialog shows prior
  sends and the button is disabled while the request runs.
- **No HTML, no PDF generated from the prescription text**, no delivery or read
  tracking, no attachment on a prescription entry.
- **No Reply-To on other patient messages** (EXPRESS answer, prep, receipt).

## Test plan

Unit, pure, no database (`TESTING.md`):
- `send-refusal.spec.ts` — each refusal; the order (`mail_not_configured` before
  `attachment_too_large`, type before emptiness); exactly 10 MB passes, one byte more
  refuses.
- `patient-locale.spec.ts` — the newest lead wins across all four tables; none → `null`.
- `patient-templates.spec.ts` — both sets in three locales; prescription body verbatim;
  document names the title; unknown locale → `ro`.

Not unit-tested: controller, nodemailer wiring, the dialog. Covered by hand:

Manual, with Mailpit (`docker compose --profile mail up -d mailpit`, API started with
`SMTP_HOST=localhost SMTP_PORT=1025 SMTP_USER=dev SMTP_PASS=dev
SMTP_FROM=cabinet@test.local DOCTOR_REPLY_TO_EMAIL=doctor@test.local`, inbox at
`http://localhost:8025`):
1. Without `SMTP_*`: 503, back office shows "poșta nu este configurată", no row.
2. Prescription, patient whose last booking is `ru`: Russian message, From and
   Reply-To headers correct, body text intact with diacritics and Cyrillic.
3. PDF document and a DOCX: attachment opens; `shasum` equals the stored file.
4. An 11 MB PDF: refusal with size, nothing in Mailpit, no row.
5. Send twice: two lines in the history with name, time and address.
6. Mailpit stopped, SMTP still set: 502, no row.
7. Erase the patient: send rows gone, count in the erasure report.
8. `grep` the API log for the patient's address: nothing.

## Alternatives rejected

- **`sentAt` / `sentTo` columns on `PatientEntry`.** One slot: a repeat overwrites the
  first send, and "history" was asked for.
- **A generic `Notification` log for all patient mail.** Receipts already use
  `Payment.confirmationSentAt`, prep uses `Appointment.prepSentAt`; a third, different
  consumer is not there yet (rule of three).
- **Reply-To from the sender's `User.email`.** A login address is not a correspondence
  address, and replies would follow whoever clicked once roles widen. **From the
  `Contact` module:** that is the practice's public address, the same place From
  already points, so the header would do nothing.
- **A `locale` column on `Patient`.** A second source of truth next to four tables
  that already record it, and a manual patient would need it filled before the first
  send.

## Open questions

1. **Which address is Reply-To**, and does she want replies with medical content in a
   personal mailbox at all, rather than in the practice one? Until answered, the env
   stays unset.
2. **Legal basis for emailing medical documents unencrypted** (Legea 195/2024): is the
   consent in the dossier enough, or does she need a line in `/gdpr` and a checkbox?
   Add to `docs/questions_v3.md`.
3. **The 10 MB limit against the real provider.** Brevo's SMTP message limit is not
   verified; re-check when the SMTP account exists.
4. **Files over 10 MB:** is "send it another way" acceptable, or is a time-limited
   download link worth its own step?
5. **"Three templates"** read as three languages of two message kinds. If a third kind
   was meant (for example a separate "resend" wording), say which.
6. **Roles:** `admin` only, like the rest of the dossier, until the client answers who
   gets which account (`PLAN.md`).
