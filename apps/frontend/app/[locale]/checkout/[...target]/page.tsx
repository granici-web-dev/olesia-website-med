import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  CheckoutForm,
  type CheckoutTarget,
} from '@/components/sections/CheckoutForm';
import { api, loc } from '@/lib/api';
import { formatEur, formatServicePrice } from '@/lib/service-price';
import { formatSlaInHours } from '@/lib/working-hours';
import { DELIVERABLE_COPY } from '@/lib/deliverable-content';
import { biFor, type Bi } from '@/lib/i18n-types';

/**
 * Never prerendered, never cached. Two reasons, and both are about money.
 *
 * A price on a checkout has to be the price being charged: the API prices the
 * purchase again when the form is submitted, and a summary served from a
 * minute-old cache could show a different number from the one that reaches the
 * card. And this page 404s when the thing is not on sale — which, under the
 * build-time fallback in `lib/api.ts`, an unreachable API at build time looks
 * exactly like. Prerendering it meant a deployment built while the API was
 * down shipped a permanent 404 on the page that takes the money.
 */
export const dynamic = 'force-dynamic';

/* ──────────────────────────────────────────────────────────────────────────
   One checkout page, three purchases:

     /checkout/express
     /checkout/deliverable/<product>
     /checkout/material/<slug>

   The summary on the left is read from whichever catalog prices that target,
   never written here, and the API prices the purchase again server-side when
   the form is submitted. Nothing on this page can name its own price.

   Trilingual (RO default · EN · RU), like every page (`AGENTS.md` R3).
   ────────────────────────────────────────────────────────────────────────── */

/** What the page renders once it knows what is being bought. */
interface Summary {
  target: CheckoutTarget;
  /** Breadcrumb back to where the purchase started. */
  from: { label: string; href: string };
  heading: string;
  title: string;
  detail: string;
  price: string;
  /** The line under the summary card, if this purchase needs one. */
  caveat?: string;
}

const T = {
  checkout: { ro: 'Plată', en: 'Checkout', ru: 'Оплата' },
  yourOrder: { ro: 'Comanda ta', en: 'Your order', ru: 'Ваш заказ' },
  total: { ro: 'Total', en: 'Total', ru: 'К оплате' },
  express: {
    ro: 'Întrebare EXPRESS',
    en: 'Express question',
    ru: 'Экспресс-вопрос',
  },
  pricing: { ro: 'Prețuri', en: 'Pricing', ru: 'Цены' },
  library: {
    ro: 'Biblioteca digitală',
    en: 'Digital library',
    ru: 'Цифровая библиотека',
  },
  expressHeading: {
    ro: 'Trimite întrebarea medicului',
    en: 'Ask the doctor your question',
    ru: 'Задайте вопрос врачу',
  },
  deliverableHeading: {
    ro: 'Comandă-ți planul',
    en: 'Order your plan',
    ru: 'Закажите свой план',
  },
  materialHeading: {
    ro: 'Cumpără materialul',
    en: 'Buy the material',
    ru: 'Купите материал',
  },
  expressCaveat: {
    ro: 'Întrebarea EXPRESS nu înlocuiește o consultație și nu este pentru urgențe. La simptome acute, sună la urgențe.',
    en: 'An express question is not a substitute for a consultation and not for emergencies. With acute symptoms, call emergency services.',
    ru: 'Экспресс-вопрос не заменяет консультацию и не предназначен для неотложных ситуаций. При острых симптомах обращайтесь в скорую помощь.',
  },
  deliverableCaveat: {
    ro: 'Planul este scris personal, pe baza a ceea ce trimiți. Imediat după plată primești linkul prin care trimiți analizele și documentele.',
    en: 'The plan is written personally, from what you send. Right after paying you get the link for sending your test results and documents.',
    ru: 'План составляется лично, на основе того, что вы пришлёте. Сразу после оплаты вы получите ссылку для отправки анализов и документов.',
  },
  materialCaveat: {
    ro: 'Linkul de descărcare este personal: este valabil 30 de zile și permite 10 descărcări.',
    en: 'The download link is personal: it works for 30 days and allows 10 downloads.',
    ru: 'Ссылка на скачивание персональная: действует 30 дней и допускает 10 скачиваний.',
  },
} satisfies Record<string, Bi>;

/**
 * Resolve the URL segments into what is being bought, or `null` when there is
 * nothing to sell.
 *
 * Every "not on sale" case answers the same null and the page then 404s: a
 * product code that is not in the catalog, a material that is free, hidden,
 * priced on request or has no file yet. A checkout page for something that
 * cannot be delivered is worse than no page at all.
 */
async function resolveSummary(
  locale: string,
  segments: string[],
): Promise<Summary | null> {
  const lc = biFor(locale);
  const [kind, ...rest] = segments;

  if (kind === 'express' && rest.length === 0) {
    const [services, workingHours] = await Promise.all([
      api.services(),
      api.workingHours(),
    ]);
    const service = services.find((s) => s.code === 'quick_question');
    // The catalog is what decides this is on sale. A service the client has
    // switched off, or one the API has never heard of, is a 404 rather than a
    // checkout page for something with no price.
    if (!service) return null;

    const turnaround = formatSlaInHours(locale, workingHours.expressSlaMinutes);
    return {
      target: { kind: 'express' },
      from: { label: lc(T.express), href: '/quick-question' },
      heading: lc(T.expressHeading),
      title: loc(locale, service.titleRo, service.titleEn, service.titleRu),
      detail:
        locale === 'ru'
          ? `Письменный ответ врача в течение ${turnaround}.`
          : locale === 'en'
            ? `A written answer from the doctor within ${turnaround}.`
            : `Un răspuns scris de la medic în ${turnaround}.`,
      price: formatServicePrice(locale, service),
      caveat: lc(T.expressCaveat),
    };
  }

  if (kind === 'deliverable' && rest.length === 1) {
    const deliverables = await api.deliverables();
    // The catalog decides this is on sale, the same way it does for EXPRESS
    // above: a product the client has withdrawn is absent from this list, and
    // a code she never had is too. Either way there is no checkout page for it.
    const product = deliverables.find((d) => d.code === rest[0]);
    if (!product) return null;
    const copy = DELIVERABLE_COPY[product.code];
    return {
      target: { kind: 'deliverable', product: product.code },
      from: { label: lc(T.pricing), href: '/pricing' },
      heading: lc(T.deliverableHeading),
      title: loc(locale, product.titleRo, product.titleEn, product.titleRu),
      detail: lc(copy.desc),
      price: formatEur(locale, product.priceEur),
      caveat: lc(T.deliverableCaveat),
    };
  }

  if (kind === 'material' && rest.length === 1) {
    const materials = await api.materials();
    const material = materials.find((m) => m.slug === rest[0]);
    // `hasFile` is the storefront's own answer to "is there anything to
    // download": for a paid material it means the private file exists. A
    // material with no file is "în curând" on the shelf and must not have a
    // checkout page either.
    if (
      !material ||
      material.access !== 'paid' ||
      !material.price ||
      !material.hasFile
    ) {
      return null;
    }
    return {
      target: { kind: 'material', slug: material.slug },
      from: { label: lc(T.library), href: '/guides' },
      heading: lc(T.materialHeading),
      title: loc(locale, material.titleRo, material.titleEn, material.titleRu),
      detail: loc(
        locale,
        material.descriptionRo,
        material.descriptionEn,
        material.descriptionRu,
      ),
      price: formatEur(locale, material.price),
      caveat: lc(T.materialCaveat),
    };
  }

  return null;
}

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
      path: '/checkout',
      title: ru
        ? 'Оплата | Dr. Olesea Jalba'
        : en
          ? 'Checkout | Dr. Olesea Jalba'
          : 'Plată | Dr. Olesea Jalba',
      description: ru
        ? 'Завершите покупку.'
        : en
          ? 'Complete your purchase.'
          : 'Finalizează-ți comanda.',
    }),
    // A checkout is a step in somebody's purchase, not a page to arrive at
    // from a search result. `robots.txt` already disallows the path; this says
    // the same thing in the one place a crawler that ignored it would look.
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string; target: string[] }>;
}) {
  const { locale, target } = await params;
  setRequestLocale(locale);
  const lc = biFor(locale);

  const summary = await resolveSummary(locale, target);
  if (!summary) notFound();

  return (
    <>
      <Breadcrumbs
        className="shell pt-8"
        items={[
          { label: summary.from.label, href: summary.from.href },
          { label: lc(T.checkout) },
        ]}
      />

      <section className="shell py-12 md:py-16">
        <h1 className="max-w-[18ch] font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-ink text-balance">
          {summary.heading}
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-14 lg:gap-20">
          <aside className="md:sticky md:top-24 md:self-start">
            <h2 className="mono text-[11px] uppercase tracking-[0.12em] text-sage-text">
              {lc(T.yourOrder)}
            </h2>

            <div className="mt-5 rounded-xl border border-[var(--rule)] bg-[var(--cream-2)] p-6">
              <p className="font-serif text-[1.35rem] leading-tight text-ink">
                {summary.title}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
                {summary.detail}
              </p>

              <dl className="mt-6 flex items-baseline justify-between border-t border-[var(--rule)] pt-5">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {lc(T.total)}
                </dt>
                <dd className="font-serif text-[1.6rem] leading-none text-ink">
                  {summary.price}
                </dd>
              </dl>
            </div>

            {summary.caveat && (
              <p className="mt-5 max-w-[38ch] text-[0.82rem] leading-relaxed text-ink-soft text-pretty">
                {summary.caveat}
              </p>
            )}
          </aside>

          <div className="rounded-xl border border-[var(--rule)] bg-[#fffdf9]">
            <CheckoutForm target={summary.target} />
          </div>
        </div>
      </section>
    </>
  );
}
