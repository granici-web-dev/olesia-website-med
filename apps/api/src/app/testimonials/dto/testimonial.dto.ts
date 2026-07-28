import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * A parent review. Only the quote is required, and only in RO/EN — everything
 * else reflects what a real review may or may not come with: many arrive
 * unsigned, most arrive with no role, and RU (like everywhere else) falls back
 * to Romanian rather than blocking the save.
 */
export class CreateTestimonialDto {
  @IsString()
  quoteRo!: string;

  @IsString()
  quoteEn!: string;

  @IsOptional()
  @IsString()
  quoteRu?: string | null;

  @IsOptional()
  @IsString()
  author?: string | null;

  @IsOptional()
  @IsString()
  roleRo?: string | null;

  @IsOptional()
  @IsString()
  roleEn?: string | null;

  @IsOptional()
  @IsString()
  roleRu?: string | null;

  @IsOptional()
  @IsString()
  source?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}
