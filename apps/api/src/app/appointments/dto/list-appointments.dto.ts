import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';

import { AppointmentStatus } from '../../../generated/prisma/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/** `GET /appointments` filters (module_calendly.md §3.2) on top of pagination. */
export class ListAppointmentsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  /** Lower bound on `startTime` (inclusive), ISO 8601. */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Upper bound on `startTime` (inclusive), ISO 8601. */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
