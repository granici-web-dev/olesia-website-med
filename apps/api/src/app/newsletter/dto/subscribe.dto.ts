import { Equals, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { Locale, SubscriberSource } from '../../../generated/prisma/enums';

/**
 * What the public signup sends.
 *
 * `consent` must be literally `true`. The tick box is the lawful basis for
 * keeping the address, so a request without it is not a subscription we are
 * allowed to store — and a DTO that merely records the flag would leave that
 * decision to whoever reads the column next.
 *
 * The consent *version* is not here on purpose: it is stamped server-side from
 * `NEWSLETTER_CONSENT_VERSION`, the same way a deliverable's price is. A public
 * form must not be able to say which wording it agreed to.
 *
 * `company` is the honeypot, exactly as on the lead routes.
 */
export class SubscribeDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;

  @IsEnum(SubscriberSource)
  source!: SubscriberSource;

  @Equals(true)
  consent!: true;

  /** Honeypot — a person leaves it empty. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;
}
