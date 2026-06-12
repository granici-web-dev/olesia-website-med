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

  @IsOptional()
  @IsString()
  excerptRo?: string;

  @IsOptional()
  @IsString()
  excerptEn?: string;

  @IsString()
  contentRo!: string;

  @IsString()
  contentEn!: string;

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
