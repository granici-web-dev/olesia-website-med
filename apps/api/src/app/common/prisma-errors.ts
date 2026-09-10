import {
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';

/**
 * Database errors the API is expected to answer, not to leak.
 *
 * A pre-flight lookup gives the friendlier answer in the common case, but it
 * cannot cover the request that races past it, and it was missing entirely on
 * four paths (audit A4, F9/F10/F11/F13): a taken slug, a taken Calendly event
 * type, a service still carrying appointments and a post pointing at a deleted
 * category all reached the client as 500. That is the one status code that
 * tells a caller nothing and tells an operator to go looking for a bug.
 *
 * `writeOrTranslate` wraps the write itself, so the race and the pre-flight
 * miss produce the same answer. The version this replaces lived privately in
 * `patients.service.ts` and knew only about `email`.
 */

/** Unique violation. `meta.target` names the columns the index covers. */
const UNIQUE_VIOLATION = 'P2002';
/** Foreign-key violation: a row somebody else still points at. */
const FOREIGN_KEY_VIOLATION = 'P2003';
/** The row the write addressed is not there. */
const RECORD_NOT_FOUND = 'P2025';

/**
 * Which machine code a taken value answers with, by the column that clashed.
 * Unlisted columns fall back to `unique_violation`: a made-up specific code
 * would be a worse lie than an honest generic one.
 */
const CONFLICT_CODE_BY_COLUMN: Record<string, string> = {
  slug: 'slug_taken',
  calendlyEventTypeUri: 'calendly_event_type_taken',
  email: 'email_taken',
  code: 'code_taken',
};

/**
 * The columns a clashing unique index covers.
 *
 * Two shapes, because Prisma 7 through the pg driver adapter does not fill
 * `meta.target` the way the query engine used to: it nests the real thing at
 * `meta.driverAdapterError.cause.constraint`, either as `fields: ['slug']` or
 * as the Postgres index name `Post_slug_key`. `meta.target` is still read
 * first, since that is what a P2002 raised anywhere else still carries.
 *
 * Two normalisations, both from watching real errors: an index name is split
 * on underscores so its column shows up as a part, and the surrounding double
 * quotes Postgres puts around a mixed-case identifier are stripped — `slug`
 * arrives bare, `"calendlyEventTypeUri"` does not.
 */
function clashingColumns(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const meta = error.meta ?? {};
  const constraint = (
    meta['driverAdapterError'] as
      | { cause?: { constraint?: { fields?: unknown; index?: unknown } } }
      | undefined
  )?.cause?.constraint;

  const named = [meta['target'], constraint?.fields, constraint?.index].flatMap(
    (value) =>
      Array.isArray(value)
        ? value.map(String)
        : typeof value === 'string'
          ? [value]
          : [],
  );
  return named
    .map((name) => name.replace(/"/g, ''))
    .flatMap((name) => [name, ...name.split('_')]);
}

/**
 * The HTTP answer for a Prisma error, or `null` when the error is not one this
 * knows how to state. Exported for the table-driven test; callers use
 * `writeOrTranslate`.
 */
export function translatePrismaError(error: unknown): HttpException | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

  if (error.code === UNIQUE_VIOLATION) {
    const clash = clashingColumns(error).find(
      (column) => column in CONFLICT_CODE_BY_COLUMN,
    );
    return new ConflictException(
      clash ? CONFLICT_CODE_BY_COLUMN[clash] : 'unique_violation',
    );
  }
  if (error.code === FOREIGN_KEY_VIOLATION) {
    return new ConflictException('in_use');
  }
  if (error.code === RECORD_NOT_FOUND) {
    return new NotFoundException('not_found');
  }
  return null;
}

/** Run a write, and answer a known database error instead of a 500. */
export async function writeOrTranslate<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    throw translatePrismaError(error) ?? error;
  }
}
