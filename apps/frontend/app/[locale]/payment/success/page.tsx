import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { PaymentResult } from '@/components/sections/PaymentResult';

/* ──────────────────────────────────────────────────────────────────────────
   Where the bank sends somebody whose payment it believes succeeded.

   "Believes" is the whole reason this page holds no logic of its own: the
   redirect carries user-controllable parameters, so the outcome is asked of
   our API, which asks the bank. `/payment/failed` is the same page with a
   different address, because the bank needs two URLs and the answer comes from
   the same place either way.
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
      path: '/payment/success',
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

export default async function PaymentSuccessPage({
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
