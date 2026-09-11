import type { Paginated } from '@olesia/shared';

/**
 * List answers, read for everything they say.
 *
 * Nine modules had their own `asList`, each returning `r.items` and throwing
 * `total` away, and every one of them asked for `pageSize=200` — which is the
 * API's ceiling (`PaginationQueryDto`, `@Max(200)`), not a spare. The panel
 * stopped at row 200 and nothing on the screen said so: the 201st patient
 * simply did not exist for the doctor.
 */

/** The envelope, whether the endpoint sent one or a bare array. */
export function asList<T>(r: T[] | Paginated<T>): Paginated<T> {
  return Array.isArray(r)
    ? { items: r, total: r.length, page: 1, pageSize: r.length }
    : r;
}

/** The largest page the API will serve (`PaginationQueryDto`). */
export const MAX_PAGE_SIZE = 200;

/**
 * Rows per page in the back office's tables. Fifty is about two screens: far
 * enough that the doctor is not clicking through a day's appointments, short
 * enough that the browser is not laying out a thousand rows nobody scrolls to.
 */
export const TABLE_PAGE_SIZE = 50;

/**
 * A guard on an API that misreports `total`, not on any list this practice
 * will have: ten thousand rows is past anything here.
 */
const MAX_PAGES = 50;

/**
 * Every row, across as many requests as it takes.
 *
 * The lists that group into tabs count their own buckets, and a count over one
 * page of a longer list is a wrong number rather than a partial one. They are
 * small lists for a single practice, so the honest answer is to read them
 * whole rather than to show arithmetic that is only true on page one. Patients
 * are the exception and page on the server: that list grows, and it is the one
 * made of medical records.
 */
export async function fetchEveryPage<T>(
  page: (page: number) => Promise<T[] | Paginated<T>>,
): Promise<T[]> {
  const first = asList(await page(1));
  const items = [...first.items];
  if (first.pageSize < 1) return items;

  const pages = Math.min(Math.ceil(first.total / first.pageSize), MAX_PAGES);
  for (let n = 2; n <= pages; n += 1) {
    items.push(...asList(await page(n)).items);
  }
  return items;
}
