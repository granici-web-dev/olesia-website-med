import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * What the back office may change about a group-C product.
 *
 * There is no `code` on it and no create DTO beside it: the catalog is the
 * `DeliverableProduct` enum, and the five rows are put there by the seed. All
 * fields are optional so the list's `active` toggle can send `{ active }`
 * alone, the way the services list already does.
 *
 * All three titles are `MinLength(1)` when present, because unlike the
 * client's own service copy these are ours and the column is NOT NULL: an
 * empty Russian title would leave a Russian reader with a blank line rather
 * than a fallback.
 */
export class UpdateDeliverableDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  priceEur?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleRo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleRu?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
