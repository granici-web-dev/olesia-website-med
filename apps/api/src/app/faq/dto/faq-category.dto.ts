import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * A FAQ section. RO and EN titles are required, RU is optional — the public
 * page falls back to Romanian, so a half-translated section still saves.
 *
 * `slug` is deliberately absent: the server derives it from `titleRo` once, at
 * creation, so that renaming a section later cannot break `/faq#…` links that
 * are already published.
 *
 * The lengths are headings, not essays. `@IsString()` alone accepted a
 * megabyte in a heading field (audit A5, F6), which the public page would then
 * render — a body limit is not a field limit.
 */
export class CreateFaqCategoryDto {
  @IsString()
  @MaxLength(200)
  titleRo!: string;

  @IsString()
  @MaxLength(200)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFaqCategoryDto extends PartialType(CreateFaqCategoryDto) {}
