/**
 * What a file actually is, read from its first bytes.
 *
 * The Content-Type on a multipart part is written by whoever sent it, so on its
 * own it says nothing: any bytes can arrive claiming to be a PDF and be stored
 * under `.pdf`. There is no malware scanner in this stack (see
 * `savePatientUpload`), which makes this the only check on what a patient's
 * file contains, so it is done by hand rather than pulled in as a dependency —
 * the whole allowlist is eight magic numbers.
 */

export type FileSignature =
  | 'pdf'
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'heif'
  | 'zip'
  | 'ole';

/** The extension each detected format is stored under. */
export const SIGNATURE_EXT: Record<FileSignature, string> = {
  pdf: 'pdf',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  heif: 'heic',
  zip: 'docx',
  ole: 'doc',
};

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

/**
 * ISO base-media files (HEIC/HEIF) carry a box length, then `ftyp`, then the
 * brand. The brands below are the still-image ones a phone produces; `avif`
 * is deliberately absent, it is not in the upload allowlist.
 */
const HEIF_BRANDS = new Set([
  'heic',
  'heix',
  'heim',
  'heis',
  'hevc',
  'hevx',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);

export function detectSignature(buffer: Buffer): FileSignature | null {
  // %PDF-
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf';
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }
  // RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('latin1', 0, 4) === 'RIFF' &&
    buffer.toString('latin1', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('latin1', 4, 8) === 'ftyp' &&
    HEIF_BRANDS.has(buffer.toString('latin1', 8, 12))
  ) {
    return 'heif';
  }
  // ZIP container — docx. The empty and spanned headers are accepted too: an
  // office file never uses them, but rejecting on them would be a lie about
  // what the check knows.
  if (
    startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(buffer, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return 'zip';
  }
  // OLE compound document — the pre-2007 .doc container.
  if (
    startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  ) {
    return 'ole';
  }
  return null;
}
