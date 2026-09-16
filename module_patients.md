# module_patients.md — Patients / medical records (back office)

Binding spec for the **Pacienți** module: register paid leads as patients and
keep their full medical history so the doctor can search by name and review
quickly. Mirrors the conventions of `module_calendly.md`.

## Decisions (locked 2026-06-12)

- **History shape:** a single chronological **timeline of entries** (types:
  `anamnesis` / `note` / `prescription` / `document`), surfaced via tabs.
- **Access:** medical data visible to **admin + editor** (same as other
  sections). Guard every endpoint with `@Roles(admin, editor)`.
- **Linking:** **manual** — a paid lead (payment_status=`confirmed`) shows an
  "Adaugă ca pacient" action; if a patient with that email exists, offer to
  link instead of creating a duplicate.

## Domain

Today `Appointment` / `Subscription` / `QuickQuestion` store `clientName` /
`clientEmail` as denormalized strings (from Calendly). A `Patient` becomes the
first-class person that ties these together plus the medical record.

### Prisma models

```
model Patient {
  id            String          @id @default(uuid())
  fullName      String
  email         String          @unique        // dedup / link key
  phone         String?
  birthDate     DateTime?
  gender        String?                          // 'male'|'female'|'other'|null
  notes         String?                          // non-medical admin notes
  consentAt     DateTime?                        // GDPR consent timestamp
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  entries       PatientEntry[]
  appointments  Appointment[]
  subscriptions Subscription[]
  quickQuestions QuickQuestion[]
}

enum PatientEntryType { anamnesis  note  prescription  document }

model PatientEntry {
  id         String           @id @default(uuid())
  patient    Patient          @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId  String
  type       PatientEntryType
  title      String?
  body       String?          // markdown (anamnesis/note/prescription text)
  fileUrl    String?          // for `document` / prescription file — AUTHENTICATED url
  fileName   String?
  occurredAt DateTime         @default(now()) // clinical date (editable)
  authorId   String?          // User who wrote it
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@index([patientId, occurredAt])
}
```

Add nullable `patientId String?` + relation to `Appointment`, `Subscription`,
`QuickQuestion` (so a patient's interaction history is queryable).

## API — module `patients`

All endpoints `@Roles(admin, editor)` (no public access).

- `GET /patients?search=&page=&pageSize=` — search by name/email, paginated.
- `GET /patients/:id` — profile + linked interactions summary.
- `POST /patients` — create.
- `PATCH /patients/:id` — edit profile / consent.
- `DELETE /patients/:id` — GDPR erasure (cascades entries).
- `GET /patients/:id/timeline` — merged, date-sorted entries + interactions.
- `POST /patients/:id/entries` / `PATCH|DELETE /patients/:id/entries/:entryId`.
- `POST /patients/from-lead` — body `{ source: 'appointment'|'subscription'|'quick_question', sourceId }`: create-or-link by email, set the source's `patientId`. (Called by the "Adaugă ca pacient" button.)
- `POST /patients/:id/documents` — multipart upload of a medical document, or of a
  prescription with `type=prescription` (optional, default `document`; added
  2026-09-16, plan step 20). PDF, DOC, DOCX, at most 20 MB. An untitled
  prescription is "Rețetă"; an untitled document takes the file's name.
- `GET /patients/:id/documents/:docId` — **authenticated** download (streamed) of
  the file on a document or a prescription,
  NOT served from the public `/uploads` static path.
- `POST /patients/:id/entries/:entryId/send` — body `{ locale }`, admin only.
  Emails a prescription (text in the body, file attached, or both) or a document
  (attachment) to the dossier's address; attachments at most 10 MB. Added
  2026-09-16, plan steps 19 and 20; see below.

### Sending to the patient (added 2026-09-16)

Design and rejected alternatives: `docs/shape-send-prescription.md`. The
recipient is always `Patient.email`, never typed. The language is chosen in the
dialog, preselected from `PatientDto.lastKnownLocale` (the newest of the four
lead tables). Refusals, in order: `entry_not_sendable`, `entry_empty` (422),
`mail_not_configured` (503), `attachment_too_large` (422, with sizes),
`mail_send_failed` (502). `PatientEntrySend` records who, when, the address and
the language, written only after the transport accepted the message, so a
database failure at that instant leaves an email without a row; accepted.
Send rows cascade with the entry on erasure. Reply-To is `DOCTOR_REPLY_TO_EMAIL`
when set.

### What an entry holds (added 2026-09-16, plan step 20)

Design: `docs/shape-prescription-file.md`. A `prescription` holds text, a file,
or both, never neither; a `document` holds a file; `anamnesis` and `note` hold
text and never a file. Checked on every write (`patients/entry-content.ts`), on
the row as it will be stored after a PATCH: `422 entry_file_not_allowed`,
`422 entry_empty`. A file prescription's text is added afterwards through the
edit form, where the type is locked while the entry has a file. There is no
attaching a file to an existing text prescription and no replacing a file.
Download, entry deletion, erasure and sending key on `fileUrl`, not on the type.
A prescription with text and a file over 10 MB is refused whole; it never goes
out as text only.

## Back office — page "Pacienți"

Sidebar item under **Administrare** (or its own group). Two screens:

- **List:** search box (name/email) + paginated table → row = name, email,
  last interaction, #entries.
- **Detail:** header (name, contact, consent badge) + tabs:
  `Profil` · `Istoric` (timeline, all types) · `Anamneză` · `Rețete` ·
  `Documente` · `Programări/Interacțiuni` (linked appts/subs/tickets).
  `Rețete` has "Adaugă rețetă" (text) and "Încarcă rețetă" (file, the upload
  sheet preset to Rețetă); `Documente` has "Încarcă document" (step 20).
- **"Adaugă ca pacient"** button on paid Appointment/Subscription/QuickQuestion
  detail sheets → calls `POST /patients/from-lead` → links + opens the patient.

## GDPR / security (REQUIRED)

- Medical attachments must use the **authenticated download endpoint**, never
  the public `/uploads/<uuid>` static route (storage abstraction must support a
  private bucket/path served only behind auth + role check).
- `consentAt` recorded; `DELETE /patients/:id` performs full erasure (right to
  be forgotten), cascading entries and detaching/anonymizing linked records.
- PII-safe logging (no names/emails/medical text in logs).
- Bilingual UI strings stay RO-only (back office convention).

## Build order

1. Prisma models + migration; nullable `patientId` on the 3 lead models.
2. `packages/shared` DTOs/enums (PatientDto, PatientEntryDto, types).
3. NestJS `patients` module (CRUD, search, timeline, from-lead, documents).
4. Private document storage path + authenticated download.
5. Back office: `patients` feature + list/detail pages; "Adaugă ca pacient"
   on paid lead sheets.
6. GDPR pass: consent UI, erasure, log audit.
