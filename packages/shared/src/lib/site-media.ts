/**
 * The site's media slots — the catalogue of pictures and videos the client can
 * replace from the back office.
 *
 * These are SLOTS, not a gallery: each one is wired into a specific place in a
 * specific page, so the list lives in code and travels with the layouts that
 * use it. Only the file behind a key is data.
 *
 * `fallback` is the asset committed under `apps/frontend/public/assets/`. It is
 * what the site serves until she uploads something, and what it falls back to
 * if the API is unreachable — a homepage with no hero would be a much worse
 * failure than a slightly out-of-date one.
 */

export type SiteMediaKind = 'image' | 'video';

export interface SiteMediaSlot {
  key: string;
  kind: SiteMediaKind;
  /** Where it appears, for the back-office list. */
  page: string;
  fallback: string;
  /** Intrinsic size of the fallback image; videos do not need one. */
  width?: number;
  height?: number;
}

export const SITE_MEDIA_SLOTS: SiteMediaSlot[] = [
  // The hero video is encoded once per locale because the subtitles are burned
  // into the picture (client's call — Romanian audio, subtitled translations).
  // Replacing one locale therefore does not replace the others.
  {
    key: 'hero_video_ro',
    kind: 'video',
    page: 'home',
    fallback: '/assets/olesea-hero-ro.mp4',
  },
  {
    key: 'hero_video_en',
    kind: 'video',
    page: 'home',
    fallback: '/assets/olesea-hero-en.mp4',
  },
  {
    key: 'hero_video_ru',
    kind: 'video',
    page: 'home',
    fallback: '/assets/olesea-hero-ru.mp4',
  },
  {
    key: 'hero_poster',
    kind: 'image',
    page: 'home',
    fallback: '/assets/olesea-hero-poster.jpg',
    width: 1080,
    height: 1350,
  },
  {
    key: 'portrait_about',
    kind: 'image',
    page: 'about',
    fallback: '/assets/olesea-about.webp',
    width: 1000,
    height: 1250,
  },
  {
    key: 'portrait_services',
    kind: 'image',
    page: 'services',
    fallback: '/assets/olesea-services.webp',
    width: 1000,
    height: 1250,
  },
  {
    key: 'portrait_pediatrics',
    kind: 'image',
    page: 'pediatrics',
    fallback: '/assets/olesea-pediatrics.webp',
    width: 1000,
    height: 1250,
  },
  {
    key: 'portrait_nutrition',
    kind: 'image',
    page: 'nutrition',
    fallback: '/assets/olesea-nutrition.webp',
    width: 1000,
    height: 1250,
  },
  {
    key: 'portrait_monitoring',
    kind: 'image',
    page: 'monitoring',
    fallback: '/assets/olesea-monitoring.webp',
    width: 1000,
    height: 1250,
  },
  {
    key: 'portrait_integrative',
    kind: 'image',
    page: 'integrative',
    fallback: '/assets/olesea-portrait-2026.webp',
    width: 1000,
    height: 1250,
  },
];

/** One replaced file. Absent from the map means "still the committed asset". */
export interface SiteMediaDto {
  key: string;
  url: string;
  width: number | null;
  height: number | null;
  fileName: string | null;
  updatedAt: string;
}
