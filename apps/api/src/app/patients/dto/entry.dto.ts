import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

import { PatientEntryType } from '../../../generated/prisma/enums';

export class CreateEntryDto {
  @IsEnum(PatientEntryType)
  type!: PatientEntryType;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  body?: string | null;

  /** Clinical date; defaults to now when omitted. */
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}

export class UpdateEntryDto {
  @IsOptional()
  @IsEnum(PatientEntryType)
  type?: PatientEntryType;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  body?: string | null;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
