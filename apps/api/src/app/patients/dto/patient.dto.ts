import {
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreatePatientDto {
  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsISO8601()
  birthDate?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  /** ISO timestamp marking GDPR consent (omit to leave unset). */
  @IsOptional()
  @IsISO8601()
  consentAt?: string | null;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsISO8601()
  birthDate?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsISO8601()
  consentAt?: string | null;
}

/** `GET /patients` — search by name/email on top of pagination. */
export class ListPatientsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
