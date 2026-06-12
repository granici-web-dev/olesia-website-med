import { IsEnum, IsOptional } from 'class-validator';

import {
  PaymentStatus,
  SubscriptionStatus,
} from '../../../generated/prisma/enums';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
