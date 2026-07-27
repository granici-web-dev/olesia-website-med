import { IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  nameRo!: string;

  @IsString()
  @MinLength(1)
  nameEn!: string;

  @IsOptional()
  @IsString()
  nameRu?: string | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
