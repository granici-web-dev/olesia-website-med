/**
 * The browser's side of the three checkouts.
 *
 * Each posts to its own route and gets back the bank's hosted page to redirect
 * to. Note what none of them sends: an amount. The price is read server-side —
 * from the services catalog, from the deliverables catalog, or off the
 * material's own row — and a form that could name its own price would sell an
 * 8 € consultation for 1.01.
 *
 * They reuse `postLead`, so the captcha header, the honeypot and the error
 * shape are the same ones the public forms have — one place where "the API
 * refused and here is why" is decided (audit A6, F14).
 */
import { TERMS_VERSION, type PurchaseNextStepDto } from '@olesia/shared';

import { normalizeApiBase } from './api-base';
import { postLead, type PublicLeadInput } from './leads';

/** What every checkout carries on top of its own fields. */
interface CheckoutInput extends PublicLeadInput {
  phone?: string;
  /**
   * The buyer's own idea of "this purchase". Kept in `sessionStorage` for the
   * length of the tab: a double click, a back button or a reload sends the same
   * key, and the API hands back the session it already opened instead of
   * opening a second one and charging twice.
   *
   * For the two purchases that hand something over on payment it is also the
   * capability that claims it on the return page — it never leaves this tab,
   * which the order reference cannot say for itself.
   */
  intentKey: string;
}

export interface QuickQuestionCheckoutInput extends CheckoutInput {
  question: string;
}

export interface DeliverableCheckoutInput extends CheckoutInput {
  /** The stable product code, e.g. `menu_7`. Nothing else about the product. */
  product: string;
  message?: string;
}

export interface MaterialCheckoutInput extends CheckoutInput {
  slug: string;
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

export function startDeliverableCheckout(
  input: DeliverableCheckoutInput,
): Promise<CheckoutSession> {
  return postLead<CheckoutSession>(
    '/leads/deliverable/checkout',
    { ...input, termsAcceptedVersion: TERMS_VERSION },
    'deliverable_checkout',
  );
}

export function startMaterialCheckout(
  input: MaterialCheckoutInput,
): Promise<CheckoutSession> {
  return postLead<CheckoutSession>(
    '/leads/material/checkout',
    { ...input, termsAcceptedVersion: TERMS_VERSION },
    'material_checkout',
  );
}

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL',
);

/**
 * What the buyer can do now, asked by the return page once the poll says the
 * money arrived: the upload link for an order, the download for a material.
 *
 * Not through `postLead`: there is no captcha on it and no honeypot, and it is
 * not a lead. `null` for anything the API will not hand over — a claim it does
 * not recognise, a payment that is not paid, a purchase with nothing to give —
 * because the page has one sentence for all of those and the difference is
 * deliberately not knowable from outside.
 */
export async function claimNextStep(
  orderId: string,
  intentKey: string,
): Promise<PurchaseNextStepDto | null> {
  try {
    const res = await fetch(`${API_BASE}/payment-status/next-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, intentKey }),
    });
    if (!res.ok) return null;
    return (await res.json()) as PurchaseNextStepDto;
  } catch {
    // Offline, or the API restarting. The page keeps its other content.
    return null;
  }
}

const INTENT_STORAGE_KEY = 'checkout-intent';

/**
 * One key per tab, minted once and kept.
 *
 * `sessionStorage` rather than `localStorage` on purpose: the key is supposed
 * to survive a reload and die with the tab. A key that outlived the tab would
 * make a person's *next* purchase resume their previous one.
 *
 * Storage can throw — a private window, a browser told to block site data — and
 * a checkout that refuses to open because of that would be a sale lost over a
 * convenience. A fresh key is the fallback, and it costs that buyer the
 * return page's link: the claim will not match, and they have to write in and
 * be sent it from the back office. Accepted rather than solved, because the
 * alternative is making `orderId` the capability, which is the thing this
 * arrangement exists to avoid (shape open question 3, decided).
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
