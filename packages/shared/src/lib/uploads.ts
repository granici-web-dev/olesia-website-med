/**
 * What an upload may weigh.
 *
 * Each limit used to be written out three times: on multer's `limits`, in the
 * storage service's own check, and again in whichever back-office field shows
 * the hint. The third copy is the one that drifts, because it is the only one
 * a patient or the doctor ever reads, and a form that promises 20 MB in front
 * of a parser that stops at 5 sends the file and then reports a failure.
 */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;
export const PATIENT_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;

/**
 * The largest file that goes to a patient as an email attachment. Base64 adds
 * a third, so 10 MB is about 13.4 MB on the wire: inside Gmail's 25 MB and
 * Outlook.com's 20 MB with room for the body. Smaller than
 * `DOCUMENT_MAX_BYTES` on purpose, so a document can be stored and still be
 * too large to email (docs/shape-send-prescription.md).
 */
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

/** The same number as a person reads it, for a hint or an error message. */
export function megabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}
