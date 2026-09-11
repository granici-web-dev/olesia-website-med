import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { PaymentResult } from '@/components/sections/PaymentResult';

/* ──────────────────────────────────────────────────────────────────────────
   Where the bank sends somebody whose payment it believes did not succeed.

   "Believes" is why this page holds no logic of its own, and it is not
   pedantry: a payer who abandons a session lands here while the money is still
   in flight, and maib promises no callback for a failure. So the outcome is
   asked of our API, which asks the bank — the same component `/payment/success`
   renders, because the bank needs two URLs and the truth comes from one place.
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return {
    ...pageMetadata({
      locale,
      path: '/payment/failed',
      title: ru
        ? 'Статус платежа | Dr. Olesea Jalba'
        : en
          ? 'Payment status | Dr. Olesea Jalba'
          : 'Starea plății | Dr. Olesea Jalba',
      description: ru
        ? 'Результат вашего платежа.'
        : en
          ? 'The outcome of your payment.'
          : 'Rezultatul plății tale.',
    }),
    // One person's receipt. `robots.txt` disallows /payment/ already; this is
    // the same instruction where a crawler that ignored the file would read it.
    robots: { index: false, follow: false },
  };
}

export default async function PaymentFailedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const [{ locale }, { order }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  return (
    <section className="shell py-16 md:py-24">
      <PaymentResult orderId={order ?? null} />
    </section>
  );
}
