import { IsEnum, IsOptional } from 'class-validator';

import {
  DeliverableOrderStatus,
  PaymentStatus,
} from '../../../generated/prisma/enums';

/**
 * What the back office can change on an order: how far along it is, and whether
 * the client has paid. The product, its price and the client's own words are
 * the record of what was ordered — they are never editable.
 */
export class UpdateDeliverableOrderDto {
  @IsOptional()
  @IsEnum(DeliverableOrderStatus)
  status?: DeliverableOrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
