import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { DeliverableProduct, Locale } from '../../../generated/prisma/enums';

/**
 * An order the doctor takes down herself, over the phone or in a message.
 *
 * The same fields the public checkout collects, minus everything that only
 * makes sense in a browser: no captcha, no terms version, no intent key. What
 * it keeps is the rule that matters — only the product *code* is accepted, and
 * the label and the price are stamped from `DELIVERABLE_CATALOG`, so an order
 * typed by hand records the same price as one bought on the site.
 */
export class CreateDeliverableOrderDto {
  @IsEnum(DeliverableProduct)
  product!: DeliverableProduct;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  clientName!: string;

  @IsEmail()
  @MaxLength(254)
  clientEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Which language to write back in; the client is not always Romanian. */
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
