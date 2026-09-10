import { applyDecorators } from '@nestjs/common';
import { IsUrl, Matches, MaxLength } from 'class-validator';

import {
  PUBLIC_API_URL,
  STORAGE_URL_PREFIX,
} from '../storage/storage.constants';

/**
 * A URL field that may only name a file this API stored.
 *
 * `fileUrl` and `coverImageUrl` were free-text (audit A4, F14): the back office
 * fills them from the upload endpoint's response, but nothing stopped a request
 * from putting `javascript:` or somebody else's domain in a field the public
 * site renders as an anchor and an `<img>`. The upload endpoints build their
 * URLs from `PUBLIC_API_URL` + `/uploads/`, so that prefix is the whole
 * allowlist, and the single trailing segment is the stored `<uuid>.<ext>`.
 */

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STORED_FILE_URL = new RegExp(
  `^${escapeForRegExp(`${PUBLIC_API_URL}${STORAGE_URL_PREFIX}/`)}[^/]+$`,
);

export function IsUploadedFileUrl() {
  return applyDecorators(
    // `require_tld: false` because PUBLIC_API_URL is `http://localhost:3333`
    // in development, and validator.js otherwise refuses a hostless host.
    IsUrl({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    }),
    MaxLength(1000),
    Matches(STORED_FILE_URL, { message: 'file_url_not_ours' }),
  );
}
