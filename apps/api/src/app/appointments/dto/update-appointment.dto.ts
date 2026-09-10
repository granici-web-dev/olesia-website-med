import { IsEnum, IsOptional } from 'class-validator';

import { AppointmentStatus } from '../../../generated/prisma/enums';

/**
 * Manual back-office edits on an appointment: mark no-show or completed.
 * Calendly owns the rest (times, video link, cancellation).
 *
 * `paymentStatus` is deliberately absent (audit A5, F3). It is documented as a
 * mirror of the `Payment` ledger, and this endpoint was one of three writing it
 * by hand — so "confirmed" meant either "the bank told us" or "somebody
 * clicked", with nothing recording which, how much, or who. Money that arrived
 * outside the bank is `POST /payments/manual`, which writes a real row.
 */
export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
