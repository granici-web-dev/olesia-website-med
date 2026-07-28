import { api } from '@/lib/api';

/**
 * Site media — the hero video, its poster and the page portraits, each of
 * which the client can replace from the back office.
 *
 * The keys mirror `SITE_MEDIA_SLOTS` in `packages/shared` (which the API uses
 * to validate them); what lives here is the half that is a frontend concern:
 * which committed file each slot falls back to, and its intrinsic size for
 * `next/image`. Keep the key strings in step with the shared list.
 *
 * The fallback is not a nicety. With no upload yet — the normal state — it *is*
 * the site, and if the API is unreachable a homepage without its hero would be
 * a far worse failure than a slightly out-of-date one.
 */

export interface SiteMediaAsset {
  url: string;
  width: number;
  height: number;
}

const PORTRAIT = { width: 1000, height: 1250 };

const FALLBACKS: Record<string, SiteMediaAsset> = {
  hero_video_ro: { url: '/assets/olesea-hero-ro.mp4', width: 0, height: 0 },
  hero_video_en: { url: '/assets/olesea-hero-en.mp4', width: 0, height: 0 },
  hero_video_ru: { url: '/assets/olesea-hero-ru.mp4', width: 0, height: 0 },
  hero_poster: {
    url: '/assets/olesea-hero-poster.jpg',
    width: 1080,
    height: 1350,
  },
  portrait_about: { url: '/assets/olesea-about.webp', ...PORTRAIT },
  portrait_services: { url: '/assets/olesea-services.webp', ...PORTRAIT },
  portrait_pediatrics: { url: '/assets/olesea-pediatrics.webp', ...PORTRAIT },
  portrait_nutrition: { url: '/assets/olesea-nutrition.webp', ...PORTRAIT },
  portrait_monitoring: { url: '/assets/olesea-monitoring.webp', ...PORTRAIT },
  portrait_integrative: {
    url: '/assets/olesea-portrait-2026.webp',
    ...PORTRAIT,
  },
};

export type SiteMediaMap = Record<string, SiteMediaAsset>;

/** Every slot resolved: the uploaded file if there is one, else the committed asset. */
export async function siteMedia(): Promise<SiteMediaMap> {
  const overrides = await api.siteMedia();
  const resolved: SiteMediaMap = { ...FALLBACKS };
  for (const o of overrides) {
    const fallback = FALLBACKS[o.key];
    if (!fallback) continue; // a slot this build does not know about
    resolved[o.key] = {
      url: o.url,
      width: o.width ?? fallback.width,
      height: o.height ?? fallback.height,
    };
  }
  return resolved;
}

/** One slot, for a page that needs a single picture. */
export async function siteMediaAsset(key: string): Promise<SiteMediaAsset> {
  const all = await siteMedia();
  return all[key] ?? FALLBACKS[key];
}
