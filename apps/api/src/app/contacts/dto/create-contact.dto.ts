import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ContactType } from '../../../generated/prisma/enums';

export class CreateContactDto {
  @IsEnum(ContactType)
  type!: ContactType;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  labelRo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  labelEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  labelRu?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  value!: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  active!: boolean;
}
