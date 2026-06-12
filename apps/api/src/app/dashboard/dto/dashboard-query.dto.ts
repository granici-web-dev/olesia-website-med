import { IsISO8601, IsOptional } from 'class-validator';

/** `GET /dashboard/stats` period. Defaults to the last 30 days when omitted. */
export class DashboardQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
