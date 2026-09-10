import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * One question/answer pair. RU optional, same fallback rule as everywhere.
 *
 * A question is a sentence and an answer is a few paragraphs; both were
 * unbounded (audit A5, F6).
 */
export class CreateFaqItemDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @MaxLength(500)
  questionRo!: string;

  @IsString()
  @MaxLength(500)
  questionEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  questionRu?: string | null;

  @IsString()
  @MaxLength(5000)
  answerRo!: string;

  @IsString()
  @MaxLength(5000)
  answerEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  answerRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFaqItemDto extends PartialType(CreateFaqItemDto) {}
