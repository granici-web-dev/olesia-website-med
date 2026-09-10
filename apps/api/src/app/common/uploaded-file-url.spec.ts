/**
 * `fileUrl` and `coverImageUrl` are rendered by the public site as an anchor
 * and an `<img>` (audit A4, F14), so what goes in them is a boundary. The rule
 * is the path — `/uploads/<one segment>` — and deliberately not the host: the
 * API's origin is a cloudflared tunnel today and a domain tomorrow, and a row
 * written under the old one must not become unsaveable when it changes.
 */
import { validate } from 'class-validator';

import { IsUploadedFileUrl } from './uploaded-file-url';

class Subject {
  @IsUploadedFileUrl()
  fileUrl!: string;
}

async function errorsFor(fileUrl: string): Promise<string[]> {
  const subject = new Subject();
  subject.fileUrl = fileUrl;
  const [failure] = await validate(subject);
  return failure ? Object.values(failure.constraints ?? {}) : [];
}

describe('an uploaded file URL', () => {
  it.each([
    'http://localhost:3333/uploads/8f2b.pdf',
    'https://api.example.md/uploads/8f2b.webp',
    'https://neither-inserted-grove-cafe.trycloudflare.com/uploads/8f2b.mp4',
  ])('accepts %s, whatever host minted it', async (url) => {
    expect(await errorsFor(url)).toEqual([]);
  });

  it('refuses a path that is not /uploads', async () => {
    expect(
      await errorsFor('https://api.example.md/private-uploads/8f2b.pdf'),
    ).toContain('file_url_not_ours');
  });

  it('refuses a second segment under /uploads', async () => {
    expect(
      await errorsFor('https://api.example.md/uploads/nested/8f2b.pdf'),
    ).toContain('file_url_not_ours');
  });

  it('refuses traversal out of /uploads', async () => {
    expect(
      await errorsFor('https://api.example.md/uploads/../../etc/passwd'),
    ).toContain('file_url_not_ours');
  });

  it('refuses a scheme a browser would execute', async () => {
    expect(await errorsFor('javascript:alert(1)')).toContain(
      'file_url_not_ours',
    );
  });

  it('refuses a relative path, which names no origin at all', async () => {
    expect(await errorsFor('/uploads/8f2b.pdf')).toContain('file_url_not_ours');
  });

  it('refuses a query or fragment glued to the segment', async () => {
    expect(
      await errorsFor('https://api.example.md/uploads/8f2b.pdf?x=1'),
    ).toContain('file_url_not_ours');
    expect(
      await errorsFor('https://api.example.md/uploads/8f2b.pdf#x'),
    ).toContain('file_url_not_ours');
  });

  it('refuses a URL past the length cap', async () => {
    const long = `https://api.example.md/uploads/${'a'.repeat(1000)}.pdf`;
    expect(await errorsFor(long)).not.toEqual([]);
  });
});
