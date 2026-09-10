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
  | 'ole'
  | 'mp4'
  | 'webm';

/** The extension each detected format is stored under. */
export const SIGNATURE_EXT: Record<FileSignature, string> = {
  pdf: 'pdf',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  heif: 'heic',
  zip: 'docx',
  ole: 'doc',
  mp4: 'mp4',
  webm: 'webm',
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

/** The same `ftyp` box, with the brands an MP4 muxer writes instead. */
const MP4_BRANDS = new Set([
  'isom',
  'iso2',
  'iso4',
  'iso5',
  'iso6',
  'mp41',
  'mp42',
  'avc1',
  'mmp4',
  'dash',
]);

/**
 * How far into an EBML header the DocType is looked for. Matroska and WebM
 * share the magic number and differ only in that string, and this is a route
 * that stores what it detects under `.webm`.
 */
const EBML_DOCTYPE_WINDOW = 64;

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
  if (buffer.length >= 12 && buffer.toString('latin1', 4, 8) === 'ftyp') {
    const brand = buffer.toString('latin1', 8, 12);
    if (HEIF_BRANDS.has(brand)) return 'heif';
    if (MP4_BRANDS.has(brand)) return 'mp4';
  }
  // EBML (Matroska family). `webm` in the DocType is what separates a WebM
  // from an MKV, which this route does not take.
  if (
    startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3]) &&
    buffer.toString('latin1', 0, EBML_DOCTYPE_WINDOW).includes('webm')
  ) {
    return 'webm';
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
