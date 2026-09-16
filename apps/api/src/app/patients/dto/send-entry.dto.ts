import { IsEnum } from 'class-validator';

import { Locale } from '../../../generated/prisma/enums';

/**
 * The language is always explicit. The back office preselects the patient's
 * last known one, but a dossier created by hand has none, and a default picked
 * here would be a guess the doctor never saw.
 */
export class SendEntryDto {
  @IsEnum(Locale)
  locale!: Locale;
}
