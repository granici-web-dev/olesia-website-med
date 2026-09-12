import { youtubeVideoId } from './media-appearances.service';

/**
 * `youtubeVideoId` is the SSRF guard on `thumbnailFromUrl`: whatever it
 * returns is interpolated into an `https://i.ytimg.com/vi/...` URL the API
 * then fetches on behalf of an authenticated editor. The five accepted URL
 * shapes are what the doctor actually pastes; the host check is what keeps a
 * pasted link from deciding which host the server talks to.
 *
 * `apps/back-office/src/features/media/parse-url.ts` mirrors this for the
 * embed, and `parse-url.spec.ts` covers that copy.
 */
describe('youtubeVideoId', () => {
  it('reads the five URL shapes the client pastes', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
    expect(youtubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeVideoId('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
    expect(youtubeVideoId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
    expect(youtubeVideoId('https://youtube.com/live/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('keeps reading the id when the link carries the usual extra parts', () => {
    // A share link from the mobile app, a timestamp, a playlist, a trailing
    // slash on a youtu.be path.
    expect(youtubeVideoId('https://m.youtube.com/watch?v=abc12345678')).toBe(
      'abc12345678',
    );
    expect(
      youtubeVideoId('https://www.youtube.com/watch?v=abc12345678&t=42s'),
    ).toBe('abc12345678');
    expect(youtubeVideoId('https://youtu.be/abc12345678?si=XyZ&t=42')).toBe(
      'abc12345678',
    );
    expect(youtubeVideoId('https://youtu.be/abc12345678/')).toBe('abc12345678');
    expect(
      youtubeVideoId('https://youtube.com/shorts/abc12345678?feature=s'),
    ).toBe('abc12345678');
  });

  it('refuses every host but YouTube, so the fetch target stays ours to choose', () => {
    for (const url of [
      'https://i.ytimg.com/vi/x/hqdefault.jpg',
      'https://youtube.com.evil.example/watch?v=abc',
      'https://evil.example/watch?v=abc',
      'https://notyoutube.com/watch?v=abc',
      'https://youtu.be.evil.example/abc',
      'http://localhost:3000/watch?v=abc',
      'http://169.254.169.254/latest/meta-data/',
      'https://127.0.0.1/watch?v=abc',
      'file:///etc/passwd',
    ]) {
      expect(youtubeVideoId(url)).toBeNull();
    }
  });

  it('answers null rather than throwing on anything that is not a URL', () => {
    expect(youtubeVideoId('')).toBeNull();
    expect(youtubeVideoId('dQw4w9WgXcQ')).toBeNull();
    expect(youtubeVideoId('not a url at all')).toBeNull();
  });

  it('answers null for a YouTube URL that names no video', () => {
    expect(youtubeVideoId('https://www.youtube.com/')).toBeNull();
    expect(youtubeVideoId('https://www.youtube.com/watch')).toBeNull();
    expect(youtubeVideoId('https://www.youtube.com/@olesia')).toBeNull();
    expect(youtubeVideoId('https://youtube.com/embed/')).toBeNull();
    expect(youtubeVideoId('https://youtu.be/')).toBeNull();
  });
});
