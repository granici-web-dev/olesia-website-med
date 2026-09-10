import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * The title field of a medical-document upload.
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
}
