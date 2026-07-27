import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { PostStatus } from '../../../generated/prisma/enums';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  titleRo!: string;

  @IsString()
  @MinLength(1)
  titleEn!: string;

  /** RU is optional: an article may be published before it is translated. */
  @IsOptional()
  @IsString()
  titleRu?: string | null;

  @IsOptional()
  @IsString()
  excerptRo?: string;

  @IsOptional()
  @IsString()
  excerptEn?: string;

  @IsOptional()
  @IsString()
  excerptRu?: string | null;

  @IsString()
  contentRo!: string;

  @IsString()
  contentEn!: string;

  @IsOptional()
  @IsString()
  contentRu?: string | null;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @IsEnum(PostStatus)
  status!: PostStatus;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;

  @IsArray()
  @IsString({ each: true })
  categoryIds!: string[];
}
