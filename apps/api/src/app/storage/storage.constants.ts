import { isAbsolute, join, resolve } from 'node:path';

/** Where uploaded files live on disk. Override with UPLOADS_DIR in Docker. */
export const STORAGE_DIR = (() => {
  const dir = process.env.UPLOADS_DIR;
  if (!dir) return join(process.cwd(), 'uploads');
  return isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
})();

/** Public route prefix the static files are served under (see main.ts). */
export const STORAGE_URL_PREFIX = '/uploads';

/**
 * Absolute origin used to build returned URLs, e.g. http://localhost:3333.
 * Defaults to the local API origin; set PUBLIC_API_URL in production.
 */
export const PUBLIC_API_URL = (
  process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3333}`
).replace(/\/$/, '');
