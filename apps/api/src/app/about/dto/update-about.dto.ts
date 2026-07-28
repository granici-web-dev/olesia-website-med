import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * A headline figure (e.g. "12+" → "ani de practică").
 *
 * RU is optional across every block: these are JSON payloads that predate the
 * Russian locale, and the About page must stay saveable while a translation is
 * still missing — the site falls back to RO.
 */
export class AboutStatDto {
  @IsString()
  value!: string;

  @IsString()
  labelRo!: string;

  @IsString()
  labelEn!: string;

  @IsOptional()
  @IsString()
  labelRu?: string;
}

/** A single qualification / credential line. */
export class AboutCredentialDto {
  @IsString()
  ro!: string;

  @IsString()
  en!: string;

  @IsOptional()
  @IsString()
  ru?: string;
}

/** A parent testimonial. */
export class AboutTestimonialDto {
  @IsString()
  quoteRo!: string;

  @IsString()
  quoteEn!: string;

  @IsOptional()
  @IsString()
  quoteRu?: string;

  @IsString()
  author!: string;

  @IsString()
  roleRo!: string;

  @IsString()
  roleEn!: string;

  @IsOptional()
  @IsString()
  roleRu?: string;
}

/** Partial update of the singleton About page. */
export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  titleRo?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleRu?: string;

  @IsOptional()
  @IsString()
  contentRo?: string;

  @IsOptional()
  @IsString()
  contentEn?: string;

  @IsOptional()
  @IsString()
  contentRu?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutStatDto)
  stats?: AboutStatDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutCredentialDto)
  credentials?: AboutCredentialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutTestimonialDto)
  testimonials?: AboutTestimonialDto[];
}
