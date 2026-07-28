import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

import { MediaEmbedProvider, MediaKind } from '../../../generated/prisma/enums';

export class CreateMediaAppearanceDto {
  @IsEnum(MediaKind)
  kind!: MediaKind;

  @IsString()
  outlet!: string;

  @IsOptional()
  @IsString()
  show?: string | null;

  /** Null when the broadcaster never published a date — we do not guess one. */
  @IsOptional()
  @IsISO8601()
  date?: string | null;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsString()
  titleRo!: string;

  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
  titleRu?: string | null;

  @IsString()
  summaryRo!: string;

  @IsString()
  summaryEn!: string;

  @IsOptional()
  @IsString()
  summaryRu?: string | null;

  @IsUrl()
  url!: string;

  @IsEnum(MediaEmbedProvider)
  embedProvider!: MediaEmbedProvider;

  @IsString()
  embedRef!: string;

  @IsString()
  thumbUrl!: string;

  @IsInt()
  @Min(1)
  thumbWidth!: number;

  @IsInt()
  @Min(1)
  thumbHeight!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMediaAppearanceDto extends PartialType(
  CreateMediaAppearanceDto,
) {}

/** Body of `POST /media-appearances/thumbnail` — a publication URL to grab from. */
export class ThumbnailFromUrlDto {
  @IsUrl()
  url!: string;
}
