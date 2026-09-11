import { Logger } from '@nestjs/common';

/**
 * What the catalog's prices are quoted in, and what the bank is asked to charge.
 *
 * EUR everywhere that matters. `PAYMENT_CURRENCY` exists for one reason: the
 * sandbox merchant profile does not have EUR enabled, so the end-to-end run
 * against the bank (PLAN.md 12b) has to go through in MDL. It is a testing
 * affordance with a fence around it — in production the variable is ignored and
 * the attempt is logged, because a currency somebody can switch by editing an
 * environment file is a way to charge the wrong money
 * (docs/shape-express-checkout.md, decision 5).
 */
const CATALOG_CURRENCY = 'EUR';

export function paymentCurrency(): string {
  const override = process.env.PAYMENT_CURRENCY;
  if (!override || override === CATALOG_CURRENCY) return CATALOG_CURRENCY;

  if (process.env.NODE_ENV === 'production') {
    Logger.warn(
      `PAYMENT_CURRENCY=${override} ignored: production charges in ${CATALOG_CURRENCY}, which is what the catalog quotes. Remove the variable.`,
      'PaymentCurrency',
    );
    return CATALOG_CURRENCY;
  }
  return override;
}
