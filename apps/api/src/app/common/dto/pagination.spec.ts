/**
 * The pagination envelope and its bounds.
 *
 * `page` becomes an SQL OFFSET, which Postgres pays for by walking and
 * discarding every skipped row — so the ceiling is the interesting part, not
 * the arithmetic (audit A5, F17).
 */
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PaginationQueryDto, paginate } from './pagination.dto';

function errorsFor(query: Record<string, unknown>): string[] {
  return validateSync(plainToInstance(PaginationQueryDto, query)).map(
    (e) => e.property,
  );
}

describe('PaginationQueryDto', () => {
  it('defaults to the first page of twenty', () => {
    const query = plainToInstance(PaginationQueryDto, {});
    expect(query).toMatchObject({ page: 1, pageSize: 20 });
    expect(errorsFor({})).toEqual([]);
  });

  it('parses the numbers out of a query string', () => {
    expect(
      plainToInstance(PaginationQueryDto, { page: '3', pageSize: '50' }),
    ).toMatchObject({
      page: 3,
      pageSize: 50,
    });
  });

  it('refuses a page number past the ceiling', () => {
    expect(errorsFor({ page: 10_000 })).toEqual([]);
    expect(errorsFor({ page: 10_001 })).toEqual(['page']);
    expect(errorsFor({ page: 1_000_000_000 })).toEqual(['page']);
  });

  it('refuses a page that is not a whole number at least 1', () => {
    for (const page of [0, -1, 1.5, 'first']) {
      expect(errorsFor({ page })).toEqual(['page']);
    }
  });

  it('refuses a page size past 200', () => {
    expect(errorsFor({ pageSize: 200 })).toEqual([]);
    expect(errorsFor({ pageSize: 201 })).toEqual(['pageSize']);
  });
});

describe('paginate', () => {
  it('echoes the page the caller asked for, not the one it got', () => {
    const query = plainToInstance(PaginationQueryDto, {
      page: '7',
      pageSize: '5',
    });
    // Page 7 of a 3-item table is empty; the envelope still has to say which
    // page was asked for, or the client cannot page back.
    expect(paginate([], 3, query)).toEqual({
      items: [],
      total: 3,
      page: 7,
      pageSize: 5,
    });
  });

  it('carries the items through untouched', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    const query = plainToInstance(PaginationQueryDto, {});
    expect(paginate(items, 2, query).items).toBe(items);
  });
});
