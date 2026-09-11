import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Locale } from '../../../generated/prisma/enums';

/**
 * Fields every public lead form carries.
 *
 * `company` is a honeypot: a hidden field real people leave empty and bots
 * fill. It was on the contact form only, which is the one route of the four
 * that carries no medical text — the three that do had nothing but the
 * captcha, and the captcha is off until the client's keys exist
 * (audit A3, F16).
 *
 * It deliberately validates like any other optional string. It used to carry
 * `@MaxLength(0)`, which meant the global `ValidationPipe` answered 400 before
 * the handler ran — so the "drop it silently and report success so the bot
 * learns nothing" the service comment described never happened, and a 400 on
 * exactly one field is the clearest possible signal of what to stop sending.
 * The controller drops it and answers success instead.
 *
 * `locale` is which language the person is reading the site in, so an answer
 * can be written back in it rather than in Romanian by default.
 */
export abstract class PublicLeadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;

  /** Honeypot — a person leaves it empty; see the class doc. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;
}

/** Non-medical contact subjects (Contact page triage dropdown). */
export const CONTACT_SUBJECTS = [
  'appointment',
  'payment',
  'how_it_works',
  'other',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/** Public "Monitorizare 3 luni" lead — contact details + optional message. */
export class MonitoringLeadDto extends PublicLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

/**
 * Public "Întrebare rapidă" lead — contact details + the question text.
 *
 * No `attachments`. The field used to accept an unbounded array of arbitrary
 * strings from the open internet; the site never sent it, the back office
 * only rendered a filename from it, and the only code that read it was the
 * one that deleted files by that name during erasure (audit A3, F15). Real
 * file sending belongs to the upload-link flow, which is authenticated,
 * size-capped and content-sniffed.
 */
export class QuickQuestionLeadDto extends PublicLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  question!: string;
}

/**
 * Public Contact-page message — non-medical questions only (appointments,
 * payment, how it works, other). Medical questions are routed to "Întrebare
 * rapidă" by design, so this carries no medical fields.
 */
export class ContactMessageDto extends PublicLeadDto {
  @IsIn(CONTACT_SUBJECTS)
  subject!: ContactSubject;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
