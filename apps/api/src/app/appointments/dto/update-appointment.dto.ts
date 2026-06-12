import { IsEnum, IsOptional } from 'class-validator';

import {
  AppointmentStatus,
  PaymentStatus,
} from '../../../generated/prisma/enums';

/**
 * Manual back-office edits on an appointment: confirm payment, mark no-show
 * or completed. Calendly owns the rest (times, video link, cancellation).
 */
export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
