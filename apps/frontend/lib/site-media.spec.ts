import { describe, expect, it, vi } from 'vitest';
import type { SiteMediaDto } from '@olesia/shared';

import { api } from './api';
import { optionalSiteMediaAsset, siteMediaAsset } from './site-media';

/**
 * Whether a page draws a picture, the committed one, or nothing at all.
 *
 * Audit A13 photographed a 590×600 beige rectangle on `/services` where the
 * portrait belongs. A slot can be saved empty — `SetSiteMediaDto.url` is a
 * plain `@IsString()` — and the two accessors answer that state differently on
 * purpose: a layout built around a picture keeps the committed one, a layout
 * that can do without renders nothing rather than an empty box. Getting this
 * backwards is invisible in a type and obvious to a visitor.
 */
const row = (key: string, url: string): SiteMediaDto =>
  ({
    key,
    url,
    width: null,
    height: null,
    fileName: null,
    updatedAt: '2026-09-16T00:00:00.000Z',
  }) as SiteMediaDto;

const withOverrides = (overrides: SiteMediaDto[]) =>
  vi.spyOn(api, 'siteMedia').mockResolvedValue(overrides);

describe('a slot the client has never touched', () => {
  it('serves the committed asset to both accessors', async () => {
    withOverrides([]);
    await expect(siteMediaAsset('portrait_services')).resolves.toMatchObject({
      url: '/assets/olesea-services.webp',
    });
    await expect(
      optionalSiteMediaAsset('portrait_services'),
    ).resolves.toMatchObject({ url: '/assets/olesea-services.webp' });
  });
});

describe('a slot pointing at an upload', () => {
  it('serves the upload, keeping the committed intrinsic size', async () => {
    withOverrides([row('portrait_services', 'https://api.example/u/abc.webp')]);
    await expect(siteMediaAsset('portrait_services')).resolves.toEqual({
      url: 'https://api.example/u/abc.webp',
      width: 1000,
      height: 1250,
    });
  });
});

describe('a slot saved empty', () => {
  it('renders as missing where the page can do without it', async () => {
    withOverrides([row('portrait_services', '')]);
    await expect(
      optionalSiteMediaAsset('portrait_services'),
    ).resolves.toBeNull();
  });

  it('falls back where the layout is built around a picture', async () => {
    withOverrides([row('hero_poster', '')]);
    await expect(siteMediaAsset('hero_poster')).resolves.toMatchObject({
      url: '/assets/olesea-hero-poster.jpg',
    });
  });
});

describe('a slot this build does not know about', () => {
  it('is nothing, rather than an asset with no url', async () => {
    withOverrides([row('portrait_2031', 'https://api.example/u/new.webp')]);
    await expect(optionalSiteMediaAsset('portrait_2031')).resolves.toBeNull();
  });
});
