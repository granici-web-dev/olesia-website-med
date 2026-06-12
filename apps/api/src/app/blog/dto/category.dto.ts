import { IsString, MinLength } from 'class-validator';
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
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
