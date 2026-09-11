import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { TERMS_VERSION } from '@olesia/shared';

import { QuickQuestionLeadDto } from './create-lead.dto';

/**
 * "Întrebare EXPRESS", bought rather than requested.
 *
 * Everything `QuickQuestionLeadDto` carries, plus the two fields a purchase
 * needs. **There is deliberately no `amount`**: the price is read from the
 * `quick_question` row in the services catalog, server-side. A public form that
 * could name its own price would sell an 8 € consultation for 1.01, which is
 * the single most expensive mistake available in this flow.
 */
export class QuickQuestionCheckoutDto extends QuickQuestionLeadDto {
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
   * opened instead of a second ticket and a second charge.
   */
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  intentKey!: string;
}
