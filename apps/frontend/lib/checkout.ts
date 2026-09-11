/**
 * The browser's side of the EXPRESS checkout.
 *
 * It posts to `POST /leads/quick-question/checkout` and gets back the bank's
 * hosted page to redirect to. Note what it does **not** send: an amount. The
 * price is read from the services catalog server-side, and a form that could
 * name its own price would sell an 8 € consultation for 1.01.
 *
 * It reuses `postLead`, so the captcha header, the honeypot and the error
 * shape are the same ones the other four public forms have — one place where
 * "the API refused and here is why" is decided (audit A6, F14).
 */
import { TERMS_VERSION } from '@olesia/shared';

import { postLead, type PublicLeadInput } from './leads';

export interface QuickQuestionCheckoutInput extends PublicLeadInput {
  phone?: string;
  question: string;
  /**
   * The buyer's own idea of "this purchase". Kept in `sessionStorage` for the
   * length of the tab: a double click, a back button or a reload sends the same
   * key, and the API hands back the session it already opened instead of
   * opening a second one and writing a second ticket.
   */
  intentKey: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  orderId: string;
}

export function startQuickQuestionCheckout(
  input: QuickQuestionCheckoutInput,
): Promise<CheckoutSession> {
  return postLead<CheckoutSession>(
    '/leads/quick-question/checkout',
    { ...input, termsAcceptedVersion: TERMS_VERSION },
    'quick_question_checkout',
  );
}

const INTENT_STORAGE_KEY = 'express-checkout-intent';

/**
 * One key per tab, minted once and kept.
 *
 * `sessionStorage` rather than `localStorage` on purpose: the key is supposed
 * to survive a reload and die with the tab. A key that outlived the tab would
 * make a person's *next* purchase resume their previous one.
 *
 * Storage can throw — a private window, a browser told to block site data — and
 * a checkout that refuses to open because of that would be a sale lost over a
 * convenience. A fresh key is the fallback: the worst case is two sessions for
 * somebody who double-clicks with storage disabled, and only one of them is
 * ever paid.
 */
export function checkoutIntentKey(): string {
  const mint = () => crypto.randomUUID();
  try {
    const stored = sessionStorage.getItem(INTENT_STORAGE_KEY);
    if (stored) return stored;
    const fresh = mint();
    sessionStorage.setItem(INTENT_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return mint();
  }
}

/** Forget the key once its purchase is finished, so the next one is its own. */
export function clearCheckoutIntent(): void {
  try {
    sessionStorage.removeItem(INTENT_STORAGE_KEY);
  } catch {
    // Nothing was stored, so there is nothing to clear.
  }
}
