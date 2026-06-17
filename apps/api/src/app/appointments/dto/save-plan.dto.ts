import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Save the written treatment plan for an appointment. The text is required; an
 * optional attachment (prescription/doc) is uploaded as the multipart `file`
 * field and validated separately by the storage service.
 */
export class SavePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  planText!: string;
}
