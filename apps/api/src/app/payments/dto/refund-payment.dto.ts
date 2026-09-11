import {
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Refund request from the back office. maib requires both fields. */
export class RefundPaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
