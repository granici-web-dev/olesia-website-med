import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PatientEntryType } from '../../../generated/prisma/enums';

/**
 * Lengths match what the lead DTOs already enforce on free text: a title is a
 * line, a body is a consultation note and not a book (audit A3, F13).
 */
const TITLE_MAX = 200;
const BODY_MAX = 20_000;

export class CreateEntryDto {
  @IsEnum(PatientEntryType)
  type!: PatientEntryType;

  @IsOptional()
  @IsString()
  @MaxLength(TITLE_MAX)
  title?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(BODY_MAX)
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
  @MaxLength(TITLE_MAX)
  title?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(BODY_MAX)
  body?: string | null;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
