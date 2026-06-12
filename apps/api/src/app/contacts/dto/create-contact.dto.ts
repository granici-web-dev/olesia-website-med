import {
  IsBoolean,
  IsEnum,
  IsInt,
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

  @IsString()
  @MinLength(1)
  value!: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsBoolean()
  active!: boolean;
}
