import * as React from 'react';

import { TABLE_PAGE_SIZE } from '@/api/list';

/**
 * One page of a list the panel already holds.
 *
 * These screens group their rows into tabs and count each bucket over the
 * whole list, so every row has to be here; what was missing was a table that
 * stops at fifty and says how many there are in total.
 */
export function usePagedRows<T>(rows: T[]) {
  const pageSize = TABLE_PAGE_SIZE;
  const [page, setPage] = React.useState(1);

  // Filtering to a shorter list must not leave the table on a page that no
  // longer exists. Clamping here rather than in an effect keeps it to one
  // render, and the arrows then step from the page actually on screen.
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, lastPage);
  const from = (current - 1) * pageSize;

  return {
    page: current,
    setPage,
    pageSize,
    total: rows.length,
    rows: rows.slice(from, from + pageSize),
  };
}
