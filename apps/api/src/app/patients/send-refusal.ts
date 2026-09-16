/**
 * Whether a dossier entry can be emailed to the patient, and if not, why
 * (docs/shape-send-prescription.md).
 *
 * The order is the design. Mail being off comes before the file being too
 * large: shrinking a file is pointless while nothing can leave, and the doctor
 * should learn the one thing that blocks every send first. The last refusal,
 * the transport rejecting the message, can only be known by trying, so it
 * lives in the service.
 */
import { ATTACHMENT_MAX_BYTES } from '@olesia/shared';

import { PatientEntryType } from '../../generated/prisma/enums';
import { isEntryEmpty, type EntryContent } from './entry-content';

export type SendRefusal =
  | { status: 422; code: 'entry_not_sendable' }
  | { status: 422; code: 'entry_empty' }
  | { status: 503; code: 'mail_not_configured' }
  | {
      status: 422;
      code: 'attachment_too_large';
      sizeBytes: number;
      maxBytes: number;
    };

export function sendRefusal(
  entry: EntryContent,
  canSend: boolean,
  /** The stored file's size when the entry has one, whatever its type. */
  fileSizeBytes: number | null,
): SendRefusal | null {
  if (
    entry.type !== PatientEntryType.prescription &&
    entry.type !== PatientEntryType.document
  ) {
    return { status: 422, code: 'entry_not_sendable' };
  }
  if (isEntryEmpty(entry)) return { status: 422, code: 'entry_empty' };
  if (!canSend) return { status: 503, code: 'mail_not_configured' };
  if (fileSizeBytes !== null && fileSizeBytes > ATTACHMENT_MAX_BYTES) {
    return {
      status: 422,
      code: 'attachment_too_large',
      sizeBytes: fileSizeBytes,
      maxBytes: ATTACHMENT_MAX_BYTES,
    };
  }
  return null;
}
