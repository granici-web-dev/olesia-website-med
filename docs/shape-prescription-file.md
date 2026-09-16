# Shape — a prescription can carry a file

Written 2026-09-16 for `PLAN.md` step 20, per `AGENTS.md` R1. No code until approved.
Builds on step 19, `docs/shape-send-prescription.md`.

## Goal

A `prescription` entry can hold text, a file, or both, never neither. The doctor
uploads a prescription file from the dossier, downloads it like a document, and
"Trimite pacientului" sends the text in the body and the file as an attachment.

## Schema: no migration

Confirmed against `apps/api/prisma/schema.prisma`:

- `PatientEntry.fileUrl String?` and `fileName String?` (lines 1019–1020) exist and
  are not tied to a type; the comment already says "document/prescription PDF".
- `PatientEntryType` has `prescription` and `document`.
- `PatientEntrySend.fileName String?` already holds "what was attached".

The one schema edit is the `///` comment on `PatientEntrySend.fileName` ("for a
document; null for a prescription" becomes "the attachment, if the email had one").
Doc comments don't produce SQL; craft confirms with `prisma migrate diff` that the
diff is empty.

## Approach

**One rule for what an entry holds, checked on every write.** A new pure function,
`entryContentRefusal({ type, body, fileUrl })`:

1. a file on `anamnesis` or `note` → `422 entry_file_not_allowed`
2. a `prescription` with no text (after trim) and no file, or a `document` with no
   file → `422 entry_empty`

It runs in `addEntry`, in `updateEntry` on the **merged** row (the stored row with the
PATCH applied, so clearing the text of a file-only prescription is fine and clearing
it on a text-only one is refused), and in `addDocument`. Today the API accepts an
empty prescription and a `document` with no file through `POST /entries`, and a
PATCH can turn a document into a note; all three are closed by the same check.
`sendRefusal` uses the same "empty" definition, so a prescription can't be savable
but unsendable.

**Upload: the existing route, with a type.** `POST /patients/:id/documents` gets an
optional `type` field in `AddDocumentDto`, `@IsIn(['prescription', 'document'])`,
default `document`. Same interceptor, same `DOCUMENT_MAX_BYTES` (20 MB), same
`DOCUMENT_MIME` (PDF, DOC, DOCX) and signature check in `savePrivateDocument`. Title
defaults to the file name, as it does for a document. The text of a file prescription
is added afterwards through the existing edit form, which already opens for
prescriptions. That keeps one place where prescription text is written.

**Everything that only looked at `type === document` now looks at `fileUrl`:**

- `getDocument` streams any `prescription` or `document` entry that has a file.
- `removeEntry` deletes the file of any entry that has one. Today a prescription's
  file would stay on disk until the orphan sweep.
- `remove` (erasure) collects files from every entry with `fileUrl`, not only
  documents. Same leak: without this, a GDPR erasure leaves the file until the sweep.
- `sendEntry` resolves `filePath` from `fileUrl` for both types, measures it and hands
  it to `sendRefusal` exactly as now.

The orphan sweep in `uploads.service.ts` already selects by `fileUrl` regardless of
type and needs no change.

**Sending.** Refusal order in `send-refusal.ts` is unchanged: type, empty, mail off,
over 10 MB, transport failure. `entry_empty` for a prescription means no text and no
file. A prescription with text and an 11 MB file is **refused whole**
(`attachment_too_large`). It doesn't go out as text only, because then the patient
gets half the prescription and nothing says so. `notifications.prescription()` takes
an optional attachment. `PrescriptionVars` becomes
`{ title, body: string | null, attached: boolean }`, with three shapes per locale:

- text only: as today, unchanged line for line;
- text and file: as today, plus one line saying the prescription file is attached;
- file only: an intro saying the prescription is attached, with no empty body block.

Subject stays "Rețeta dumneavoastră" / "Your prescription" / "Ваш рецепт" in all
three. The send row stores `fileName` whenever a file left, prescriptions included.

**Back office.**

- Upload sheet (`document-upload-sheet.tsx`): a "Tip" select with `Rețetă / Document`
  (the same `Select` the entry form uses; there is no radio or toggle component in
  `components/ui`, and adding one for two options isn't worth it). A `defaultType`
  prop: the "Rețete" tab gets a second button, "Încarcă rețetă", that opens it preset
  to prescription, and "Documente" opens it preset to document. The sheet title and
  toast follow the chosen type.
- Entry card (`timeline.tsx`): the file row and the download button show for any
  entry with `fileUrl`, not only documents. A prescription with a file keeps its edit
  button. The "Rețete" tab passes `onDownload` and `downloading`, which it doesn't
  today.
- Edit form (`entry-form-sheet.tsx`): when the entry has a file, the type select is
  disabled, with a hint line saying the file stays with the prescription. `entry_empty`
  and `entry_file_not_allowed` map to specific toasts, not `toast.error`.
- Send dialog (`send-entry-dialog.tsx`): the single description line becomes "Ce
  pleacă": "Textul rețetei, în corpul emailului" when there is text, and "Atașament:
  <fileName>" when there is a file. It is derived from the entry, so a document shows
  only the attachment and a text-only prescription only the text.

## Files

API

- `apps/api/src/app/patients/entry-content.ts` (+ `entry-content.spec.ts`), new: the
  write-time rule and the shared "empty" definition
- `apps/api/src/app/patients/send-refusal.ts` (+ spec): emptiness from
  `entry-content.ts`; `fileSizeBytes` doc comment covers any entry with a file
- `apps/api/src/app/patients/dto/add-document.dto.ts`: optional `type`
- `apps/api/src/app/patients/patients.controller.ts`: pass `dto.type`; comments on the
  upload and download routes name both types
- `apps/api/src/app/patients/patients.service.ts`: `addDocument(type)`, the check in
  `addEntry` / `updateEntry`, and `getDocument`, `removeEntry`, `remove`, `sendEntry`
  keyed on `fileUrl`
- `apps/api/src/app/mail/patient-templates.ts` (+ spec): `PrescriptionVars`, three
  shapes × three locales
- `apps/api/src/app/mail/patient-notifications.service.ts`: optional attachment on
  `prescription()`
- `apps/api/prisma/schema.prisma`: the `///` comment only

Back office

- `apps/back-office/src/features/patients/api.ts`: `uploadDocument` takes a `type`
- `apps/back-office/src/features/patients/document-upload-sheet.tsx`: type select,
  `defaultType`
- `apps/back-office/src/features/patients/timeline.tsx`: file row and download keyed on
  `fileUrl`
- `apps/back-office/src/features/patients/entry-form-sheet.tsx`: type locked with a
  file, two error codes
- `apps/back-office/src/features/patients/send-entry-dialog.tsx`: "Ce pleacă"
- `apps/back-office/src/pages/patient-detail.tsx`: "Încarcă rețetă" on the Rețete tab,
  upload sheet state with a type, `onDownload` on that tab
- `apps/back-office/src/i18n/ro.ts`: type labels, sheet titles, hint, toasts, dialog
  lines

Docs: `module_patients.md` (entry holds text and/or file, the upload `type` field),
`docs/test-inventory.md`. `PLAN.md` and `docs/plan-log.md` when the step closes.

## What it deliberately does not do

- **No attaching a file to an existing text prescription**, and no replacing or
  removing the file on an entry. A different file means deleting the entry and
  uploading again, which also drops its send history. Attaching needs its own
  semantics (the old file, sends that named it). Open question 1.
- **No files on anamnesis or notes.** Refused by the API, not only hidden in the UI.
- **No text field in the upload sheet.** Text goes through the edit form, the one
  editor for prescription text.
- **No image types.** A prescription accepts what a document accepts: PDF, DOC, DOCX.
  Open question 2.
- **No text-only fallback** when the file is over 10 MB, and no download link. Both
  were ruled out in step 19.
- **No file size in `PatientEntryDto`** and no size warning in the send dialog before
  sending. The API refusal already states both sizes.
- **No renamed route.** `/patients/:id/documents` now also serves prescriptions. The
  name is a little wide; renaming it is churn with no caller outside the back office.
- **No cleanup of existing empty prescriptions.** There is no production API, so
  there's no production data. Any such row on a dev database stays readable, is
  refused on send, and can't be saved without content.
- **No PDF preview** in the panel, no change on the public site.

## Test plan

Unit, pure, no database (`TESTING.md`):

- `entry-content.spec.ts`: a prescription with text only, file only, or both passes;
  with neither it is `entry_empty`, and whitespace-only text counts as none; a
  document without a file is `entry_empty`; a note or anamnesis with a file is
  `entry_file_not_allowed`; a note without text passes (today's behaviour kept).
- `send-refusal.spec.ts`, added: a file-only prescription passes; a prescription with
  neither is `entry_empty`; a prescription with text and an over-limit file is
  `attachment_too_large` (text doesn't bypass the limit); mail off comes before size
  for a prescription too; exactly 10 MB passes for a prescription as for a document.
- `patient-templates.spec.ts`, added: a file-only prescription mentions the attachment
  in all three locales and carries no empty body line; text plus file carries the
  body verbatim and the attachment line; text only has the same lines as before this
  step; the subject is the prescription's in every shape.

Not unit-tested: controller, DTO wiring, the sheets and the dialog. Covered by hand.

Manual, with Mailpit (`docker compose --profile mail up -d mailpit`, API started with
`SMTP_HOST=localhost SMTP_PORT=1025 SMTP_USER=dev SMTP_PASS=dev
SMTP_FROM=cabinet@test.local DOCTOR_REPLY_TO_EMAIL=doctor@test.local`, inbox at
`http://localhost:8025`):

1. **File-only prescription.** "Rețete" → "Încarcă rețetă", a PDF with no title: the
   entry appears under Rețete (not Documente) with the file row. Download gives a file
   whose `shasum` matches the stored one. Send in `ru`: Mailpit shows "Ваш рецепт",
   the attachment wording, no empty block, an attachment that opens with a matching
   `shasum`, and Reply-To set. The history row has the file name.
2. **Text plus file.** Edit that entry and add text with diacritics and Cyrillic. The
   type select is disabled. Send in `ro`: body text verbatim, the attachment line, the
   attachment.
3. **Empty prescription refused.** "Adaugă rețetă" with no text: specific toast, no
   entry. `curl` PATCH `body: null` on a text-only prescription: `422 entry_empty`.
   The same PATCH on the file-only one succeeds.
4. **Type rules.** `curl` PATCH `type: note` on a file prescription:
   `422 entry_file_not_allowed`. Upload with `type=note`: 400. `POST /entries` with
   `type: document`: `422 entry_empty`.
5. **Limits.** Upload a 21 MB file as a prescription: `file_too_large` toast. A JPEG:
   refused as for a document. A 15 MB PDF prescription with text: sending is refused
   with both sizes, nothing in Mailpit, no row. The same send without `SMTP_*`:
   `mail_not_configured` first.
6. **Deletion.** Delete a file prescription: its file is gone from
   `PRIVATE_UPLOADS_DIR` at once. Erase a patient with a file prescription: the file is
   gone and `PatientEntry` / `PatientEntrySend` are counted in the report.
7. **Unchanged.** Upload and send a document, send a text-only prescription: the
   messages are the same as in step 19.

## Alternatives rejected

- **A separate route to attach a file to a prescription**
  (`PUT /entries/:entryId/file`). It matches "wrote it, then scanned it" better, but
  it brings replace and remove semantics, deletion of the old file, and history rows
  that named a file that's gone. Uploading with a type and then editing reaches the
  same state for the cases asked. Kept as open question 1.
- **A text field in the upload sheet** for text plus file in one step. It would mean
  a second markdown editor for the same field and a multipart body carrying 20 000
  characters of text. Two steps through existing forms are enough.
- **A database `CHECK` constraint** for "not empty". It would repeat the trim rule in
  SQL, Prisma can't model it, and it needs a hand-written migration for a rule the
  service, the only writer, already enforces. It also gives Nest's filter a 500 where
  a coded 422 should be.
- **Keeping file prescriptions as `document` entries with a flag.** They would sit
  under Documente, get the document email ("un document medical"), and split
  "rețete" across two types.

## Open questions

1. **Attaching a scan to an existing text prescription.** Is "write, print, sign, scan,
   attach to the same entry" how she works? If so, that's its own step with
   replace/remove semantics.
2. **Photos.** Will she ever photograph a prescription with a phone (JPEG, HEIC)? You
   asked for the document types, so only PDF, DOC and DOCX are accepted; widening the
   list is one line plus a signature check.
3. **What a prescription file is worth to a pharmacy in Moldova.** Does an emailed PDF
   or scan stand in for the paper original, or is it only informative? The email
   wording makes no claim either way; if it should say "prezentați originalul", the
   client has to tell us.
4. **Over 10 MB with text.** Refusing the whole send is the chosen behaviour. Is an
   explicit "send the text only" button wanted, or is "send the file another way", as
   for documents, enough?
5. **Default title** of a file prescription is the file name, as for documents. Would
   "Rețetă" plus the date read better in the dossier?
6. **Closing `POST /entries` with `type: document`** (no file). Nothing in the panel
   uses it; confirming it's fine to refuse.
