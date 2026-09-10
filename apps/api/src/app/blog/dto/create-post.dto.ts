import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SLUG_PATTERN } from '@olesia/shared';

import { IsUploadedFileUrl } from '../../common/uploaded-file-url';
import { PostStatus } from '../../../generated/prisma/enums';

export class CreatePostDto {
  /**
   * URL slug, lowercase words joined by single hyphens. Unconstrained until
   * 2026-09-10 (audit A4, F12), which accepted `../../etc/passwd` into the
   * segment the public article route is addressed by.
   */
  @Matches(SLUG_PATTERN, { message: 'slug_invalid' })
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleRo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleEn!: string;

  /** RU is optional: an article may be published before it is translated. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRu?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  excerptRo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  excerptEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  excerptRu?: string | null;

  @IsString()
  @MaxLength(50000)
  contentRo!: string;

  @IsString()
  @MaxLength(50000)
  contentEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  contentRu?: string | null;

  @IsOptional()
  @IsUploadedFileUrl()
  coverImageUrl?: string | null;

  /**
   * Child-age taxonomy keys, shared with the digital library. Optional and
   * free-form on purpose: the taxonomy lives in the frontends, and an article
   * tagged with a key this build does not know about is simply not matched by
   * the filter — better than a 400 the editor cannot act on.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ageKeys?: string[];

  @IsEnum(PostStatus)
  status!: PostStatus;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;

  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds!: string[];
}
