import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * A FAQ section. RO and EN titles are required, RU is optional — the public
 * page falls back to Romanian, so a half-translated section still saves.
 *
 * `slug` is deliberately absent: the server derives it from `titleRo` once, at
 * creation, so that renaming a section later cannot break `/faq#…` links that
 * are already published.
 */
export class CreateFaqCategoryDto {
  @IsString()
  titleRo!: string;

  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
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
