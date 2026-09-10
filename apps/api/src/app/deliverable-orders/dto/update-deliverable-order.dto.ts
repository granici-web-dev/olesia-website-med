import { IsEnum, IsOptional } from 'class-validator';

import { DeliverableOrderStatus } from '../../../generated/prisma/enums';

/**
 * What the back office can change on an order: how far along it is. The
 * product, its price and the client's own words are the record of what was
 * ordered — they are never editable.
 *
 * `paymentStatus` is deliberately absent — it mirrors the `Payment` ledger.
 * See `UpdateAppointmentDto` (audit A5, F3).
 */
export class UpdateDeliverableOrderDto {
  @IsOptional()
  @IsEnum(DeliverableOrderStatus)
  status?: DeliverableOrderStatus;
}
