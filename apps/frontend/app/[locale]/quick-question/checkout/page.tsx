import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ExpressCheckoutForm } from '@/components/sections/ExpressCheckoutForm';
import { api, loc } from '@/lib/api';
import { formatServicePrice } from '@/lib/service-price';
import { formatSlaInHours } from '@/lib/working-hours';

/**
 * Never prerendered, never cached. Two reasons, and both are about money.
 *
 * A price on a checkout has to be the price being charged: the API prices the
 * purchase again when the form is submitted, and a summary served from a
 * minute-old cache could show a different number from the one that reaches the
 * card. And this page 404s when the catalog does not offer the service — which,
 * under the build-time fallback in `lib/api.ts`, an unreachable API at build
 * time looks exactly like. Prerendering it meant a deployment built while the
 * API was down shipped a permanent 404 on the page that takes the money.
 */
export const dynamic = 'force-dynamic';

/* ──────────────────────────────────────────────────────────────────────────
   Checkout for the EXPRESS question (`/<locale>/quick-question/checkout`).

   The order summary on the left is read from the catalog, never written here:
   the title, the price and the promised turnaround are all fields the client
   edits in the back office, and the API prices the purchase again server-side
   when the form is submitted. Nothing on this page can name its own price.

   Trilingual (RO default · EN · RU), like every page (`AGENTS.md` R3).
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
      path: '/quick-question/checkout',
      title: ru
        ? 'Оплата экспресс-вопроса | Dr. Olesea Jalba'
        : en
          ? 'Express question checkout | Dr. Olesea Jalba'
          : 'Plata întrebării EXPRESS | Dr. Olesea Jalba',
      description: ru
        ? 'Задайте вопрос и оплатите ответ врача.'
        : en
          ? 'Send your question and pay for the doctor’s answer.'
          : 'Trimite întrebarea și achită răspunsul medicului.',
    }),
    // A checkout is a step in somebody's purchase, not a page to arrive at
    // from a search result. `robots.txt` already disallows the path; this says
    // the same thing in the one place a crawler that ignored it would look.
    robots: { index: false, follow: false },
  };
}

export default async function ExpressCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';

  const [services, workingHours] = await Promise.all([
    api.services(),
    api.workingHours(),
  ]);
  const service = services.find((s) => s.code === 'quick_question');
  // The catalog is what decides this is on sale. A service the client has
  // switched off, or one the API has never heard of, is a 404 rather than a
  // checkout page for something with no price.
  if (!service) notFound();

  const title = loc(locale, service.titleRo, service.titleEn, service.titleRu);
  const price = formatServicePrice(locale, service);
  const turnaround = formatSlaInHours(locale, workingHours.expressSlaMinutes);

  return (
    <>
      <Breadcrumbs
        className="shell pt-8"
        items={[
          {
            label: ru
              ? 'Экспресс-вопрос'
              : en
                ? 'Express question'
                : 'Întrebare EXPRESS',
            href: '/quick-question',
          },
          { label: ru ? 'Оплата' : en ? 'Checkout' : 'Plată' },
        ]}
      />

      <section className="shell py-12 md:py-16">
        <h1 className="max-w-[18ch] font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-ink text-balance">
          {ru
            ? 'Задайте вопрос врачу'
            : en
              ? 'Ask the doctor your question'
              : 'Trimite întrebarea medicului'}
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-14 lg:gap-20">
          <aside className="md:sticky md:top-24 md:self-start">
            <h2 className="mono text-[11px] uppercase tracking-[0.12em] text-sage-text">
              {ru ? 'Ваш заказ' : en ? 'Your order' : 'Comanda ta'}
            </h2>

            <div className="mt-5 rounded-xl border border-[var(--rule)] bg-[var(--cream-2)] p-6">
              <p className="font-serif text-[1.35rem] leading-tight text-ink">
                {title}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
                {ru
                  ? `Письменный ответ врача в течение ${turnaround}.`
                  : en
                    ? `A written answer from the doctor within ${turnaround}.`
                    : `Un răspuns scris de la medic în ${turnaround}.`}
              </p>

              <dl className="mt-6 flex items-baseline justify-between border-t border-[var(--rule)] pt-5">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {ru ? 'К оплате' : en ? 'Total' : 'Total'}
                </dt>
                <dd className="font-serif text-[1.6rem] leading-none text-ink">
                  {price}
                </dd>
              </dl>
            </div>

            <p className="mt-5 max-w-[38ch] text-[0.82rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Экспресс-вопрос — не замена очной консультации и не для неотложных ситуаций. При острых симптомах обращайтесь в скорую помощь.'
                : en
                  ? 'An express question is not a substitute for a consultation and not for emergencies. With acute symptoms, call emergency services.'
                  : 'Întrebarea EXPRESS nu înlocuiește o consultație și nu este pentru urgențe. La simptome acute, sună la urgențe.'}
            </p>
          </aside>

          <div className="rounded-xl border border-[var(--rule)] bg-[#fffdf9]">
            <ExpressCheckoutForm />
          </div>
        </div>
      </section>
    </>
  );
}
