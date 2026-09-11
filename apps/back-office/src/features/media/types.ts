/**
 * Media appearances behind the public /media page. Mirrors
 * `MediaAppearanceDto` in `packages/shared`.
 *
 * Recordings are never uploaded — every entry points at its original
 * publication and is embedded from there. Only the thumbnail is ours.
 */

export const MEDIA_KINDS = ['tv', 'radio', 'conference', 'press'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_PROVIDERS = ['youtube', 'facebook'] as const;
export type MediaEmbedProvider = (typeof MEDIA_PROVIDERS)[number];

export interface MediaAppearance {
  id: string;
  kind: MediaKind;
  outlet: string;
  show: string | null;
  /** ISO date, or null when the broadcaster never published one. */
  date: string | null;
  duration: string | null;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  summaryRo: string;
  summaryEn: string;
  summaryRu: string | null;
  url: string;
  embedProvider: MediaEmbedProvider;
  /** YouTube video id, or the canonical Facebook video permalink. */
  embedRef: string;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  sortOrder: number;
  active: boolean;
}

export type MediaAppearanceInput = Omit<MediaAppearance, 'id' | 'sortOrder'>;

/** What the storage/thumbnail endpoints return. */
export interface StoredImage {
  url: string;
  width: number;
  height: number;
}
