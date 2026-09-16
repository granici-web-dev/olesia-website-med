/**
 * Patients / medical records (module_patients.md).
 *
 * The shapes are sourced from `@olesia/shared` (single source of truth); this
 * module re-exports them so feature code imports from one place, and adds the
 * small view-only types the UI needs (form values, the merged timeline).
 */
import type {
  PatientDto,
  PatientEntryDto,
  PatientErasureReportDto,
  PatientInteractionDto,
  PatientLeadConflictDto,
} from '@olesia/shared';
import { PatientEntryType } from '@olesia/shared';

export type {
  PatientDto,
  PatientEntryDto,
  PatientErasureReportDto,
  PatientInteractionDto,
  PatientLeadConflictDto,
};
export { PatientEntryType };

/** The four medical-record entry types, in display order. */
export type EntryType = `${PatientEntryType}`; // 'anamnesis' | 'note' | 'prescription' | 'document'

/** The two types a file can be uploaded as (docs/shape-prescription-file.md). */
export type UploadEntryType = Extract<EntryType, 'prescription' | 'document'>;

/** `GET /patients/:id/timeline` — merged, date-sorted record. */
export interface PatientTimeline {
  entries: PatientEntryDto[];
  interactions: PatientInteractionDto[];
}

/** Editable patient profile fields (create + edit). */
export interface PatientFormValues {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string; // 'YYYY-MM-DD' or ''
  gender: '' | 'male' | 'female' | 'other';
  notes: string;
}

/** Editable timeline-entry fields (anamnesis / note / prescription). */
export interface EntryFormValues {
  type: Exclude<EntryType, 'document'>;
  title: string;
  body: string;
  occurredAt: string; // 'YYYY-MM-DD' or ''
}

/** The lead kinds that can be promoted to a patient. */
export type LeadSource = 'appointment' | 'subscription' | 'quick_question';
