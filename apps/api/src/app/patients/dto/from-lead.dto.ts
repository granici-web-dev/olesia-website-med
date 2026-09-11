import { IsIn, IsString } from 'class-validator';

/**
 * The four kinds of row that carry a client's name and address before a
 * dossier exists. `deliverable_order` joined them in audit A5 (F12): it was
 * the one lead kind with no patient relation at all, so a group-C order could
 * not be linked, never showed up in the dossier, and erasure reached it only
 * by matching the email.
 */
export type LeadSource =
  'appointment' | 'subscription' | 'quick_question' | 'deliverable_order';

const LEAD_SOURCES: LeadSource[] = [
  'appointment',
  'subscription',
  'quick_question',
  'deliverable_order',
];

/** Create-or-link a patient from a paid lead and attach the lead to them. */
export class FromLeadDto {
  @IsIn(LEAD_SOURCES)
  source!: LeadSource;

  @IsString()
  sourceId!: string;
}
