import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TERMS_VERSION } from '@olesia/shared';

import { DeliverableProduct } from '../../../generated/prisma/enums';
import { PublicLeadDto } from './create-lead.dto';

/**
 * The two fields every purchase carries on top of its own form.
 *
 * **There is deliberately no `amount` on any checkout DTO.** The price is read
 * server-side — from the services catalog, from `DeliverableCatalog`, or from
 * `Material.price` — and a public form that could name its own price would
 * sell an 8 € consultation for 1.01, which is the single most expensive
 * mistake available in this flow.
 */
abstract class CheckoutFields extends PublicLeadDto {
  /**
   * Which version of /terms the checkbox was next to. Pinned to the current
   * one, so a page cached from before a wording change cannot sell under terms
   * nobody has read — the same rule the upload consent follows.
   */
  @IsIn([TERMS_VERSION])
  termsAcceptedVersion!: string;

  /**
   * The buyer's own idea of "this purchase", minted by the checkout page. A
   * repeat submit carrying the same key is handed back the session it already
   * opened instead of a second purchase and a second charge.
   *
   * For a material it is also the capability that claims the download on the
   * return page: it never leaves the buyer's tab, which `orderId` cannot say
   * for itself.
   */
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  intentKey!: string;
}

/**
 * "Întrebare EXPRESS", bought rather than requested.
 *
 * It repeats `phone` and `question` rather than extending
 * `QuickQuestionLeadDto`, because a class can only extend one thing and the
 * two checkout fields are the ones all three purchases share. The lead DTOs
 * next door already repeat `phone` three times; this is the same trade.
 */
export class QuickQuestionCheckoutDto extends CheckoutFields {
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
 * A group-C product, bought. Only the product *code* is accepted: the label
 * and the price are read from its `DeliverableCatalog` row, so the back office
 * never displays a product name that came from the internet.
 */
export class DeliverableCheckoutDto extends CheckoutFields {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  /** What the menu or protocol has to work around, in the buyer's own words. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsEnum(DeliverableProduct)
  product!: DeliverableProduct;
}

/**
 * A paid library material, bought. The slug identifies it, because that is
 * what the storefront's URL already carries; the price comes off the row.
 */
export class MaterialCheckoutDto extends CheckoutFields {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;
}
