import { describe, expect, it } from 'vitest';

import { parsePublicationUrl } from '@/features/media/parse-url';

/**
 * Every shape of link the doctor might paste into "Apariții media". Getting
 * this wrong shows a blank player on the public site, and the form is the only
 * place anyone would notice before a visitor does.
 */
describe('parsePublicationUrl', () => {
  it('reads a youtu.be share link', () => {
    expect(parsePublicationUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      provider: 'youtube',
      ref: 'dQw4w9WgXcQ',
    });
  });

  it('reads the ?v= form, with or without www and extra parameters', () => {
    expect(
      parsePublicationUrl('https://www.youtube.com/watch?v=abc123&t=42s'),
    ).toEqual({ provider: 'youtube', ref: 'abc123' });
    expect(parsePublicationUrl('https://m.youtube.com/watch?v=abc123')).toEqual(
      {
        provider: 'youtube',
        ref: 'abc123',
      },
    );
  });

  it('reads the embed, shorts and live paths', () => {
    for (const path of ['embed', 'shorts', 'live']) {
      expect(parsePublicationUrl(`https://youtube.com/${path}/xyz789`)).toEqual(
        {
          provider: 'youtube',
          ref: 'xyz789',
        },
      );
    }
  });

  it('keeps a canonical Facebook video link whole', () => {
    const url = 'https://www.facebook.com/drolesea/videos/1234567890/';
    expect(parsePublicationUrl(url)).toEqual({
      provider: 'facebook',
      ref: url,
    });
  });

  /**
   * The video plugin only accepts `/…/videos/<id>/`, and a `/watch/?v=` link
   * does not carry the page slug needed to build one. An empty ref leaves the
   * field for her to paste rather than guessing a URL that renders nothing.
   */
  it('recognises a non-canonical Facebook link but leaves its ref empty', () => {
    expect(
      parsePublicationUrl('https://www.facebook.com/watch/?v=1234567890'),
    ).toEqual({ provider: 'facebook', ref: '' });
  });

  it('answers null for a YouTube link with no video in it', () => {
    expect(parsePublicationUrl('https://youtube.com/@drolesea')).toBeNull();
    expect(parsePublicationUrl('https://youtu.be/')).toBeNull();
  });

  it('answers null for anything that is not a link we can play', () => {
    expect(parsePublicationUrl('https://vimeo.com/123')).toBeNull();
    expect(parsePublicationUrl('not a url')).toBeNull();
    expect(parsePublicationUrl('')).toBeNull();
  });
});
