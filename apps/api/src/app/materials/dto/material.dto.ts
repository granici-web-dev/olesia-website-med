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
  MaxLength,
  Min,
} from 'class-validator';
import { SLUG_PATTERN } from '@olesia/shared';

import { IsUploadedFileUrl } from '../../common/uploaded-file-url';
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
  @Matches(SLUG_PATTERN, { message: 'slug_invalid' })
  @MaxLength(120)
  slug!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(AGE_KEYS, { each: true, message: 'age_key_invalid' })
  ageKeys?: string[];

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

  @IsString()
  @MaxLength(2000)
  descriptionRo!: string;

  @IsString()
  @MaxLength(2000)
  descriptionEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
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

  /** A free material's PDF, as a public URL. Ignored for a paid one. */
  @IsOptional()
  @IsUploadedFileUrl()
  fileUrl?: string | null;

  /**
   * A paid material's PDF, as the private storage key `POST
   * /materials/file/private` answered with. Ignored for a free one. The
   * pattern is what `savePrivateDocument` writes — a UUID plus the extension
   * the file's own first bytes earned — so a key naming a path is refused here
   * rather than reaching the filesystem.
   */
  @IsOptional()
  @Matches(/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/)
  fileKey?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
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
  @MaxLength(200)
  nameRo!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMaterialCategoryDto extends PartialType(
  CreateMaterialCategoryDto,
) {}
