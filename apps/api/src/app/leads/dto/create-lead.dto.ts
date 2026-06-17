import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Non-medical contact subjects (Contact page triage dropdown). */
export const CONTACT_SUBJECTS = [
  'appointment',
  'payment',
  'how_it_works',
  'other',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/** Public "Monitorizare 3 luni" lead — contact details + optional message. */
export class MonitoringLeadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

/** Public "Întrebare rapidă" lead — contact details + the question text. */
export class QuickQuestionLeadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  question!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

/**
 * Public Contact-page message — non-medical questions only (appointments,
 * payment, how it works, other). Medical questions are routed to "Întrebare
 * rapidă" by design, so this carries no medical fields. `company` is a honeypot:
 * a hidden field real users leave empty; bots fill it and are silently dropped.
 */
export class ContactMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(CONTACT_SUBJECTS)
  subject!: ContactSubject;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;

  /** Honeypot — must be empty. */
  @IsOptional()
  @IsString()
  @MaxLength(0)
  company?: string;
}
