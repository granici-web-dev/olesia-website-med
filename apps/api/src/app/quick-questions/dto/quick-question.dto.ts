import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { PaymentStatus } from '../../../generated/prisma/enums';

export class AnswerTicketDto {
  @IsString()
  @MinLength(1)
  answer!: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
