import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { SLUG_PATTERN } from '@olesia/shared';

export class CreateCategoryDto {
  /** The public filter value in the URL; same rule as a post's slug. */
  @Matches(SLUG_PATTERN, { message: 'slug_invalid' })
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nameRo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameRu?: string | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
