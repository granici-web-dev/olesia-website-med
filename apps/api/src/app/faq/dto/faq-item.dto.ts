import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/** One question/answer pair. RU optional, same fallback rule as everywhere. */
export class CreateFaqItemDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  questionRo!: string;

  @IsString()
  questionEn!: string;

  @IsOptional()
  @IsString()
  questionRu?: string | null;

  @IsString()
  answerRo!: string;

  @IsString()
  answerEn!: string;

  @IsOptional()
  @IsString()
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
