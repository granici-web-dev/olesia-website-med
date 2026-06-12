import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/** A headline figure (e.g. "12+" → "ani de practică"). */
export class AboutStatDto {
  @IsString()
  value!: string;

  @IsString()
  labelRo!: string;

  @IsString()
  labelEn!: string;
}

/** A single qualification / credential line. */
export class AboutCredentialDto {
  @IsString()
  ro!: string;

  @IsString()
  en!: string;
}

/** A parent testimonial. */
export class AboutTestimonialDto {
  @IsString()
  quoteRo!: string;

  @IsString()
  quoteEn!: string;

  @IsString()
  author!: string;

  @IsString()
  roleRo!: string;

  @IsString()
  roleEn!: string;
}

/** One FAQ entry. */
export class AboutFaqItemDto {
  @IsString()
  qRo!: string;

  @IsString()
  qEn!: string;

  @IsString()
  aRo!: string;

  @IsString()
  aEn!: string;
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
  contentRo?: string;

  @IsOptional()
  @IsString()
  contentEn?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutFaqItemDto)
  faq?: AboutFaqItemDto[];
}
