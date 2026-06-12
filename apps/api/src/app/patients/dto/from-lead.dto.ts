import { IsIn, IsString } from 'class-validator';

export type LeadSource = 'appointment' | 'subscription' | 'quick_question';

/** Create-or-link a patient from a paid lead and attach the lead to them. */
export class FromLeadDto {
  @IsIn(['appointment', 'subscription', 'quick_question'])
  source!: LeadSource;

  @IsString()
  sourceId!: string;
}
