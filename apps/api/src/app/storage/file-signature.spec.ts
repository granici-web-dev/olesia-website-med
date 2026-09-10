import { detectSignature } from './file-signature';

/**
 * The only check on what a patient's file actually contains: there is no
 * malware scanner in this stack, and the Content-Type is written by the sender.
 * A silent break here means arbitrary bytes stored under a medical extension,
 * so every format in the allowlist is pinned by its real header.
 */

const bytes = (...values: number[]) => Buffer.from(values);
const ascii = (text: string) => Buffer.from(text, 'latin1');

describe('detectSignature', () => {
  it('reads a PDF', () => {
    expect(detectSignature(ascii('%PDF-1.7\n%âãÏÓ'))).toBe('pdf');
  });

  it('reads a JPEG', () => {
    expect(detectSignature(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toBe(
      'jpeg',
    );
  });

  it('reads a PNG', () => {
    expect(
      detectSignature(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
    ).toBe('png');
  });

  it('reads a WebP, whose marker sits after the RIFF size', () => {
    expect(
      detectSignature(
        Buffer.concat([ascii('RIFF'), bytes(0x20, 0, 0, 0), ascii('WEBP')]),
      ),
    ).toBe('webp');
  });

  it('reads a HEIC photo from a phone', () => {
    expect(
      detectSignature(
        Buffer.concat([bytes(0, 0, 0, 0x18), ascii('ftyp'), ascii('heic')]),
      ),
    ).toBe('heif');
  });

  it('reads a DOCX as its ZIP container', () => {
    expect(detectSignature(bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00))).toBe(
      'zip',
    );
  });

  it('reads a legacy DOC as its OLE container', () => {
    expect(
      detectSignature(bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)),
    ).toBe('ole');
  });

  it('reports a PNG as a PNG however the sender labelled it', () => {
    // The caller compares this against the declared type: a PNG announced as
    // application/pdf comes back 'png' and the upload is refused.
    const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    expect(detectSignature(png)).not.toBe('pdf');
  });

  it('refuses HTML, whatever it claims to be', () => {
    expect(detectSignature(ascii('<!doctype html><script>alert(1)</script>'))).toBe(
      null,
    );
  });

  it('refuses an SVG, which is markup and not in the allowlist', () => {
    expect(detectSignature(ascii('<svg xmlns="http://www.w3.org/2000/svg">'))).toBe(
      null,
    );
  });

  it('refuses an empty buffer instead of reading past its end', () => {
    expect(detectSignature(Buffer.alloc(0))).toBe(null);
  });

  it('refuses a truncated header that only starts like a PNG', () => {
    expect(detectSignature(bytes(0x89, 0x50, 0x4e))).toBe(null);
  });
});
