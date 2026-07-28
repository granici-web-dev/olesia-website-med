import { PartialType } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

import {
  MaterialAccess,
  MaterialFlag,
} from '../../../generated/prisma/enums';

/** Age-taxonomy keys accepted on a material (mirrors `lib/age-taxonomy.ts`). */
export const AGE_KEYS = [
  '0-6m',
  '6-12m',
  '1-3y',
  '3-6y',
  '6-12y',
  'adolescent',
] as const;

export class CreateMaterialDto {
  /** URL slug. Lowercase words joined by single hyphens. */
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug_invalid' })
  slug!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(AGE_KEYS, { each: true, message: 'age_key_invalid' })
  ageKeys?: string[];

  @IsString()
  titleRo!: string;

  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
  titleRu?: string | null;

  @IsString()
  descriptionRo!: string;

  @IsString()
  descriptionEn!: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number | null;

  @IsOptional()
  @IsString()
  fileLang?: string | null;

  @IsOptional()
  @IsEnum(MaterialAccess)
  access?: MaterialAccess;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(MaterialFlag, { each: true })
  flags?: MaterialFlag[];

  @IsOptional()
  @IsString()
  fileUrl?: string | null;

  @IsOptional()
  @IsString()
  fileName?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

export class CreateMaterialCategoryDto {
  @IsString()
  nameRo!: string;

  @IsString()
  nameEn!: string;

  @IsOptional()
  @IsString()
  nameRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMaterialCategoryDto extends PartialType(
  CreateMaterialCategoryDto,
) {}
