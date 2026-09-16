/**
 * What a dossier entry may hold (docs/shape-prescription-file.md).
 *
 * A prescription is text, a file, or both; a document is a file; anamnesis and
 * notes are text only. Checked on every write, on the row as it will be stored,
 * and reused by `sendRefusal`, so a prescription can never be savable but
 * unsendable for being empty.
 */
import { PatientEntryType } from '../../generated/prisma/enums';

export interface EntryContent {
  type: PatientEntryType;
  body: string | null;
  fileUrl: string | null;
}

export type EntryContentRefusal = 'entry_file_not_allowed' | 'entry_empty';

/** Whitespace is not a prescription. */
export function hasEntryText(body: string | null): boolean {
  return !!body?.trim();
}

export function isEntryEmpty(entry: EntryContent): boolean {
  if (entry.type === PatientEntryType.prescription) {
    return !hasEntryText(entry.body) && !entry.fileUrl;
  }
  if (entry.type === PatientEntryType.document) return !entry.fileUrl;
  return false;
}

export function entryContentRefusal(
  entry: EntryContent,
): EntryContentRefusal | null {
  if (
    entry.fileUrl &&
    entry.type !== PatientEntryType.prescription &&
    entry.type !== PatientEntryType.document
  ) {
    return 'entry_file_not_allowed';
  }
  return isEntryEmpty(entry) ? 'entry_empty' : null;
}
