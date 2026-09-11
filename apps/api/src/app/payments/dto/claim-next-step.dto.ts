import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * What the return page presents to claim what it just bought.
 *
 * Two values, and only the second is a credential: `orderId` says which
 * purchase, `intentKey` proves the claimer is the tab that opened it. A wrong
 * or missing key answers 404, the same as a reference that is not ours.
 */
export class ClaimNextStepDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  orderId!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  intentKey!: string;
}
