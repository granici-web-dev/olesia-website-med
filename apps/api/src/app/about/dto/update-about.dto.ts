import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { IsUploadedFileUrl } from '../../common/uploaded-file-url';

/**
 * A headline figure (e.g. "12+" → "ani de practică").
 *
 * RU is optional across every block: these are JSON payloads that predate the
 * Russian locale, and the About page must stay saveable while a translation is
 * still missing — the site falls back to RO.
 */
export class AboutStatDto {
  @IsString()
  @MaxLength(20)
  value!: string;

  @IsString()
  @MaxLength(200)
  labelRo!: string;

  @IsString()
  @MaxLength(200)
  labelEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  labelRu?: string;
}

/** A single qualification / credential line. */
export class AboutCredentialDto {
  @IsString()
  @MaxLength(300)
  ro!: string;

  @IsString()
  @MaxLength(300)
  en!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  ru?: string;
}

/**
 * Partial update of the singleton About page.
 *
 * The bounds are what the page is: a heading, a few pages of prose, a gallery,
 * a row of figures and a list of qualifications. Every field here was
 * unbounded (audit A5, F6) and `images` was free-text (F7) — a page the public
 * site renders as anchors and `<img>` tags.
 */
export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  contentRo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  contentEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  contentRu?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUploadedFileUrl({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => AboutStatDto)
  stats?: AboutStatDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AboutCredentialDto)
  credentials?: AboutCredentialDto[];
}
