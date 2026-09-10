import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import type { Paginated } from '@olesia/shared';

/**
 * Standard `?page=&pageSize=` query for list endpoints.
 *
 * `page` is bounded as well as `pageSize` (audit A5, F17): it becomes an SQL
 * OFFSET, and Postgres walks and discards every skipped row, so an unbounded
 * page number is a way to make the database do arbitrary work for a response
 * that is always empty. Ten thousand pages is far past the end of any list
 * here and well short of a problem.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize = 20;
}

/** Wrap a page of items in the shared `Paginated<T>` envelope. */
export function paginate<T>(
  items: T[],
  total: number,
  query: PaginationQueryDto,
): Paginated<T> {
  return { items, total, page: query.page, pageSize: query.pageSize };
}
