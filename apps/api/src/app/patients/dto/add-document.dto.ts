import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PatientEntryType } from '../../../generated/prisma/enums';

/**
 * The fields of a medical-document or prescription-file upload.
 *
 * Audit A3 (F13): this used to arrive as `@Body('title')`. A parameter whose
 * metatype is `String` is skipped by the global `ValidationPipe`, so nothing
 * checked the type or the length — an object in that field reached Prisma and
 * came back as a 500 instead of a 400.
 */
export class AddDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  /** A file is a document unless she uploads it as a prescription
   * (docs/shape-prescription-file.md). Notes and anamnesis carry no file. */
  @IsOptional()
  @IsIn([PatientEntryType.prescription, PatientEntryType.document])
  type?: 'prescription' | 'document';
}
