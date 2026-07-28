import type { MediaEmbedProvider } from '@/features/media/types';

/**
 * Work out where a pasted publication link is played from, and what reference
 * the embed needs. Mirrors `youtubeVideoId` in the API service — the client
 * side does it too so the form can fill itself in as she types.
 */
export function parsePublicationUrl(
  raw: string,
): { provider: MediaEmbedProvider; ref: string } | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return id ? { provider: 'youtube', ref: id } : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = url.searchParams.get('v');
    if (v) return { provider: 'youtube', ref: v };
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
    return match ? { provider: 'youtube', ref: match[1] } : null;
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    // Only the canonical `/…/videos/<id>/` form works in the video plugin, and
    // a `/watch/?v=` link does not contain the page slug needed to build it —
    // so that reference is left for her to paste rather than guessed wrong.
    const canonical = /\/videos\/\d+/.test(url.pathname) ? url.href : '';
    return { provider: 'facebook', ref: canonical };
  }
  return null;
}
