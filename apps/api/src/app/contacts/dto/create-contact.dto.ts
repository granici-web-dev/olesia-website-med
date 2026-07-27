import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { ContactType } from '../../../generated/prisma/enums';

export class CreateContactDto {
  @IsEnum(ContactType)
  type!: ContactType;

  @IsString()
  @MinLength(1)
  labelRo!: string;

  @IsString()
  @MinLength(1)
  labelEn!: string;

  @IsOptional()
  @IsString()
  labelRu?: string | null;

  @IsString()
  @MinLength(1)
  value!: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  active!: boolean;
}
