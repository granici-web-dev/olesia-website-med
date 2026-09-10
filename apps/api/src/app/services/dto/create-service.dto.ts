import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
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
  @MaxLength(200)
  titleRo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titleEn!: string;

  /** RU is optional everywhere: the catalog must stay saveable half-translated. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleRu?: string | null;

  @IsString()
  @MaxLength(2000)
  descriptionRo!: string;

  @IsString()
  @MaxLength(2000)
  descriptionEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
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
  @MaxLength(200)
  priceLabelRo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  priceLabelEn?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  priceLabelRu?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  calendlyEventTypeUri?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  calendlySchedulingUrl?: string | null;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  active!: boolean;
}
