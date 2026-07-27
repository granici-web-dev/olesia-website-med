import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { ServiceCode, ServiceGroup } from '../../../generated/prisma/enums';

export class CreateServiceDto {
  @IsEnum(ServiceCode)
  code!: ServiceCode;

  @IsEnum(ServiceGroup)
  group!: ServiceGroup;

  @IsString()
  @MinLength(1)
  titleRo!: string;

  @IsString()
  @MinLength(1)
  titleEn!: string;

  /** RU is optional everywhere: the catalog must stay saveable half-translated. */
  @IsOptional()
  @IsString()
  titleRu?: string | null;

  @IsString()
  descriptionRo!: string;

  @IsString()
  descriptionEn!: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number | null;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  priceLabelRo?: string | null;

  @IsOptional()
  @IsString()
  priceLabelEn?: string | null;

  @IsOptional()
  @IsString()
  priceLabelRu?: string | null;

  @IsOptional()
  @IsString()
  calendlyEventTypeUri?: string | null;

  @IsOptional()
  @IsString()
  calendlySchedulingUrl?: string | null;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  active!: boolean;
}
