import { applyDecorators } from '@nestjs/common';
import { IsUrl, Matches, MaxLength, type ValidationOptions } from 'class-validator';

import { STORAGE_URL_PREFIX } from '../storage/storage.constants';

/**
 * A URL field that may only name a file this API stored.
 *
 * `fileUrl` and `coverImageUrl` were free-text (audit A4, F14): the back office
 * fills them from the upload endpoint's response, but nothing stopped a request
 * from putting `javascript:` or somebody else's domain in a field the public
 * site renders as an anchor and an `<img>`.
 *
 * The rule is the **path**, not the host: `/uploads/` followed by exactly one
 * segment, which is the stored `<uuid>.<ext>`. Pinning the host to
 * `PUBLIC_API_URL` was the first attempt and it was wrong — that value is a
 * cloudflared tunnel today and a real domain tomorrow, so every row written
 * under the previous host became unsaveable the moment it changed. A stored URL
 * outlives the origin it was minted at; the shape of the path does not.
 */

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STORED_FILE_URL = new RegExp(
  `^https?://[^/]+${escapeForRegExp(STORAGE_URL_PREFIX)}/[^/?#]+$`,
);

/**
 * `options` exists for `{ each: true }`: `AboutPage.images` is an array of the
 * same kind of URL and was validated as plain strings (audit A5, F7), so the
 * page accepted `javascript:` in a field the site renders as an `<img>` src.
 */
export function IsUploadedFileUrl(options?: ValidationOptions) {
  return applyDecorators(
    // `require_tld: false` because the API answers on `http://localhost:3333`
    // in development, and validator.js otherwise refuses a hostless host.
    IsUrl(
      {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_tld: false,
      },
      options,
    ),
    MaxLength(1000, options),
    Matches(STORED_FILE_URL, { ...options, message: 'file_url_not_ours' }),
  );
}
