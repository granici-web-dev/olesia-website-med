import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PaymentTargetType } from '../../../generated/prisma/enums';

/**
 * The purchases a payment can be recorded against by hand. `material` is
 * absent: a paid material has no order row, so there is no payer to read and
 * nothing for the mirror to land on.
 */
const MANUALLY_PAYABLE = [
  PaymentTargetType.appointment,
  PaymentTargetType.subscription,
  PaymentTargetType.quick_question,
  PaymentTargetType.deliverable_order,
] as const;

/**
 * Money that arrived outside the bank: cash at the practice, a transfer, a
 * card machine that is not ours.
 *
 * The payer is deliberately not a field. It is read off the purchase, which is
 * the record of who bought the thing; a second version of that in the ledger
 * would be a second version of the truth.
 */
export class RecordManualPaymentDto {
  @IsEnum(PaymentTargetType)
  @IsIn(MANUALLY_PAYABLE)
  targetType!: PaymentTargetType;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  targetId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  /** ISO 4217, as the catalog quotes it. */
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency!: string;

  /** "Numerar la cabinet", "transfer 12.09" — the only evidence there is. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
