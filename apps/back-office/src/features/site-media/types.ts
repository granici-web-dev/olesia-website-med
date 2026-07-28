/**
 * Site media — the hero video, its poster and the page portraits.
 *
 * The catalogue of slots comes from `@olesia/shared`; a row here is an override
 * of one of them. No row means the site still serves the committed asset.
 */

export interface SiteMediaOverride {
  key: string;
  url: string;
  width: number | null;
  height: number | null;
  fileName: string | null;
  updatedAt: string;
}

export interface SiteMediaSet {
  url: string;
  width?: number;
  height?: number;
  fileName?: string | null;
}

/** What an upload returns: the stored URL, its size when known, the filename. */
export interface UploadedMedia {
  url: string;
  name: string;
  width?: number;
  height?: number;
}
