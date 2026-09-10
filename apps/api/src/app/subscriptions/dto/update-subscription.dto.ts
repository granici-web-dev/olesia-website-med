import { IsEnum, IsOptional } from 'class-validator';

import { SubscriptionStatus } from '../../../generated/prisma/enums';

/**
 * `paymentStatus` is deliberately absent — it mirrors the `Payment` ledger.
 * See `UpdateAppointmentDto` (audit A5, F3).
 */
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
