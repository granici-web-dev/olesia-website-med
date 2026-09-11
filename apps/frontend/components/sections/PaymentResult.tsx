'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import type {
  PublicPaymentStatusDto,
  PurchaseNextStepDto,
} from '@olesia/shared';

import { Link } from '@/i18n/navigation';
import { normalizeApiBase } from '@/lib/api-base';
import {
  checkoutIntentKey,
  claimNextStep,
  clearCheckoutIntent,
} from '@/lib/checkout';

/* ──────────────────────────────────────────────────────────────────────────
   What happened to a payment, asked of our API rather than believed from the
   URL. The bank appends its own `checkoutId` and `checkoutStatus` to the
   redirect and both are user-controllable, so this page reads only the order
   reference and asks `/payment-status/:orderId`, which asks the bank.

   It polls because the return usually beats the callback — and, until the API
   has a public HTTPS host, the callback never arrives at all and the poll is
   the only thing that resolves the payment. It stops at a terminal state, and
   it stops at `MAX_ATTEMPTS` so an abandoned tab is not asking the bank about
   the same session forever.
   ────────────────────────────────────────────────────────────────────────── */

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL',
);

const POLL_MS = 3000;
/** Three minutes of asking. The reconcile sweep finishes the job after that. */
const MAX_ATTEMPTS = 60;

/**
 * The purchases whose return page has a link to claim. An EXPRESS question
 * does not: what it bought is an answer, which arrives later and by email.
 */
const HANDS_SOMETHING_OVER: PublicPaymentStatusDto['targetType'][] = [
  'deliverable_order',
  'material',
];

const TERMINAL: PublicPaymentStatusDto['state'][] = [
  'paid',
  'failed',
  'expired',
  'abandoned',
  'cancelled',
  'refunded',
  'partially_refunded',
];

const INTL_LOCALE: Record<'ro' | 'en' | 'ru', string> = {
  ro: 'ro-RO',
  en: 'en-GB',
  ru: 'ru-RU',
};

/**
 * The amount, in whatever the bank actually charged.
 *
 * Formatted here rather than through `lib/service-price`'s `formatEur`: that
 * module imports `loc` from `lib/api`, which resolves `API_URL` at module scope
 * and throws in a browser — so importing it from a client component took down
 * the return page at the one moment it matters most. It also only knows EUR,
 * and this page has to render whatever currency the payment was opened in.
 */
function formatMoney(
  locale: 'ro' | 'en' | 'ru',
  amount: number,
  currency: string,
) {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
  }).format(amount);
}

type Tri = { ro: string; en: string; ru: string };

const COPY = {
  checking: {
    ro: 'Verificăm plata la bancă…',
    en: 'Checking the payment with the bank…',
    ru: 'Проверяем платёж в банке…',
  },
  paidTitle: {
    ro: 'Plata a fost confirmată',
    en: 'Your payment is confirmed',
    ru: 'Оплата подтверждена',
  },
  paidBody: {
    ro: 'Întrebarea ta a ajuns la medic. Răspunsul vine pe email, în programul de lucru.',
    en: 'Your question has reached the doctor. The answer comes by email, during working hours.',
    ru: 'Ваш вопрос передан врачу. Ответ придёт на email в рабочее время.',
  },
  paidOrderBody: {
    ro: 'Comanda ta a ajuns la medic. Următorul pas este al tău: trimite analizele și documentele prin linkul personal de mai jos.',
    en: 'Your order has reached the doctor. The next step is yours: send your test results and documents through the personal link below.',
    ru: 'Ваш заказ передан врачу. Следующий шаг за вами: пришлите анализы и документы по личной ссылке ниже.',
  },
  paidMaterialBody: {
    ro: 'Mulțumim. Materialul tău este gata de descărcat.',
    en: 'Thank you. Your material is ready to download.',
    ru: 'Спасибо. Ваш материал готов к скачиванию.',
  },
  uploadLink: {
    ro: 'Trimite documentele →',
    en: 'Send your documents →',
    ru: 'Отправить документы →',
  },
  downloadLink: {
    ro: 'Descarcă materialul →',
    en: 'Download the material →',
    ru: 'Скачать материал →',
  },
  linkGoodUntil: {
    ro: 'Linkul este personal și este valabil până la',
    en: 'The link is personal and works until',
    ru: 'Ссылка персональная и действует до',
  },
  downloadsLeft: {
    ro: 'descărcări rămase',
    en: 'downloads left',
    ru: 'скачиваний осталось',
  },
  linkMissing: {
    ro: 'Nu putem afișa linkul în această fereastră — se pierde dacă navigarea este privată sau dacă ai închis fila între timp. Scrie-ne numărul comenzii de mai sus și ți-l trimitem.',
    en: 'We cannot show the link in this window: it is lost in private browsing, or if you closed the tab in between. Send us the order number above and we will send it to you.',
    ru: 'Мы не можем показать ссылку в этом окне: она теряется в приватном режиме или если вкладка была закрыта. Пришлите нам номер заказа выше, и мы отправим ссылку.',
  },
  pendingTitle: {
    ro: 'Plata este în curs de procesare',
    en: 'The payment is still processing',
    ru: 'Платёж обрабатывается',
  },
  pendingBody: {
    ro: 'Banca nu ne-a dat încă un răspuns final. Poți închide pagina — dacă plata trece, întrebarea ajunge la medic și primești un email de confirmare.',
    en: 'The bank has not given us a final answer yet. You can close this page: if the payment goes through, your question reaches the doctor and you get a confirmation email.',
    ru: 'Банк ещё не дал окончательного ответа. Страницу можно закрыть: если платёж пройдёт, вопрос попадёт к врачу, а вам придёт письмо с подтверждением.',
  },
  failedTitle: {
    ro: 'Plata nu a trecut',
    en: 'The payment did not go through',
    ru: 'Платёж не прошёл',
  },
  failedBody: {
    ro: 'Nu ți s-a reținut nimic de pe card. Poți încerca din nou sau ne poți scrie direct.',
    en: 'Nothing was charged to your card. You can try again, or write to us directly.',
    ru: 'С карты ничего не списано. Можно попробовать ещё раз или написать нам напрямую.',
  },
  refundedTitle: {
    ro: 'Plata a fost returnată',
    en: 'This payment was refunded',
    ru: 'Платёж возвращён',
  },
  refundedBody: {
    ro: 'Banii au fost trimiși înapoi pe cardul folosit la plată. Ajung în cont în câteva zile lucrătoare.',
    en: 'The money has been sent back to the card you paid with. It lands in a few working days.',
    ru: 'Деньги отправлены обратно на карту, которой вы оплачивали. Поступят в течение нескольких рабочих дней.',
  },
  notFoundTitle: {
    ro: 'Nu găsim această comandă',
    en: 'We cannot find this order',
    ru: 'Такой заказ не найден',
  },
  notFoundBody: {
    ro: 'Linkul este incomplet sau comanda nu există. Dacă ai plătit și ai primit un email de confirmare, scrie-ne numărul comenzii din el.',
    en: 'The link is incomplete, or the order does not exist. If you paid and received a confirmation email, send us the order number from it.',
    ru: 'Ссылка неполная или заказа не существует. Если вы оплатили и получили письмо-подтверждение, пришлите нам номер заказа из него.',
  },
  unreachableTitle: {
    ro: 'Nu putem verifica plata acum',
    en: 'We cannot check the payment right now',
    ru: 'Сейчас не удаётся проверить платёж',
  },
  unreachableBody: {
    ro: 'Reîncarcă pagina peste câteva minute. Dacă plata a trecut, primești un email de confirmare oricum.',
    en: 'Reload the page in a few minutes. If the payment went through, you get a confirmation email regardless.',
    ru: 'Перезагрузите страницу через несколько минут. Если платёж прошёл, письмо-подтверждение придёт в любом случае.',
  },
  order: { ro: 'Comanda', en: 'Order', ru: 'Заказ' },
  service: { ro: 'Serviciu', en: 'Service', ru: 'Услуга' },
  amount: { ro: 'Sumă', en: 'Amount', ru: 'Сумма' },
  paidAt: { ro: 'Data plății', en: 'Paid on', ru: 'Дата оплаты' },
  tryAgain: {
    ro: 'Încearcă din nou',
    en: 'Try again',
    ru: 'Попробовать ещё раз',
  },
  writeToUs: { ro: 'Scrie-ne', en: 'Write to us', ru: 'Написать нам' },
  home: {
    ro: 'Înapoi la pagina principală',
    en: 'Back to the home page',
    ru: 'На главную',
  },
} satisfies Record<string, Tri>;

type Outcome = 'checking' | 'not-found' | 'unreachable' | 'known';

export function PaymentResult({ orderId }: { orderId: string | null }) {
  const raw = useLocale();
  const locale: keyof Tri = raw === 'ru' ? 'ru' : raw === 'en' ? 'en' : 'ro';
  const t = (key: keyof typeof COPY) => COPY[key][locale];

  const [outcome, setOutcome] = useState<Outcome>(
    orderId ? 'checking' : 'not-found',
  );
  const [payment, setPayment] = useState<PublicPaymentStatusDto | null>(null);
  /**
   * What the buyer can do now, for the two purchases that hand something over.
   * `undefined` while we have not asked; `null` once we have and the API would
   * not give it — which is the private-window case, and the one the wording
   * below has to be honest about.
   */
  const [nextStep, setNextStep] = useState<PurchaseNextStepDto | null>();

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const ask = async () => {
      attempts += 1;
      let res: Response;
      try {
        res = await fetch(
          `${API_BASE}/payment-status/${encodeURIComponent(orderId)}`,
        );
      } catch {
        // The API is unreachable. Keep asking: the usual cause is a restart,
        // and the alternative is telling somebody who just paid that we have
        // no idea what happened.
        if (!cancelled && attempts < MAX_ATTEMPTS)
          timer = setTimeout(ask, POLL_MS);
        else if (!cancelled) setOutcome('unreachable');
        return;
      }
      if (cancelled) return;

      // A reference that is not ours answers exactly like one that never
      // existed. Anything else would say whether a guessed order number is
      // real, which is the whole of what this endpoint has to protect.
      if (res.status === 404) {
        setOutcome('not-found');
        return;
      }
      if (!res.ok) {
        if (attempts < MAX_ATTEMPTS) timer = setTimeout(ask, POLL_MS);
        else setOutcome('unreachable');
        return;
      }

      const body = (await res.json()) as PublicPaymentStatusDto;
      if (cancelled) return;
      setPayment(body);
      setOutcome('known');

      if (TERMINAL.includes(body.state)) {
        // Claim before the key is released, and only for the two purchases
        // that hand something over: the key is the capability, and the whole
        // point of using it rather than the order reference is that it never
        // left this tab.
        if (
          body.state === 'paid' &&
          HANDS_SOMETHING_OVER.includes(body.targetType)
        ) {
          setNextStep(await claimNextStep(orderId, checkoutIntentKey()));
        }
        // The purchase is finished either way. Releasing the intent key means
        // the next thing this person buys opens its own session instead of
        // resuming a session that is over.
        clearCheckoutIntent();
        return;
      }
      if (attempts < MAX_ATTEMPTS) timer = setTimeout(ask, POLL_MS);
    };

    void ask();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  if (outcome === 'checking') {
    return (
      <p
        className="text-[1.0625rem] leading-relaxed text-ink-soft"
        aria-live="polite"
      >
        {t('checking')}
      </p>
    );
  }

  if (outcome === 'not-found') {
    return (
      <Outcome
        title={t('notFoundTitle')}
        body={t('notFoundBody')}
        locale={locale}
      />
    );
  }

  if (outcome === 'unreachable' || !payment) {
    return (
      <Outcome
        title={t('unreachableTitle')}
        body={t('unreachableBody')}
        locale={locale}
      />
    );
  }

  const paid = payment.state === 'paid';
  const refunded =
    payment.state === 'refunded' || payment.state === 'partially_refunded';
  const settled = TERMINAL.includes(payment.state);

  const handsOver = HANDS_SOMETHING_OVER.includes(payment.targetType);

  const title = paid
    ? t('paidTitle')
    : refunded
      ? t('refundedTitle')
      : settled
        ? t('failedTitle')
        : t('pendingTitle');
  const body = paid
    ? payment.targetType === 'deliverable_order'
      ? t('paidOrderBody')
      : payment.targetType === 'material'
        ? t('paidMaterialBody')
        : t('paidBody')
    : refunded
      ? t('refundedBody')
      : settled
        ? t('failedBody')
        : t('pendingBody');

  return (
    <Outcome
      title={title}
      body={body}
      locale={locale}
      retry={settled && !paid && !refunded}
      details={
        <>
          {/* Only once the claim has actually been attempted: the block
              flickering in as "we cannot show the link" while the request is
              still open would tell somebody who just paid the wrong thing. */}
          {paid && handsOver && nextStep !== undefined && (
            <NextStep step={nextStep} locale={locale} />
          )}
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.9375rem]">
            <Row label={t('order')}>
              <span className="mono text-[0.875rem]">{payment.orderId}</span>
            </Row>
            <Row label={t('service')}>{payment.description}</Row>
            <Row label={t('amount')}>
              {formatMoney(locale, payment.amount, payment.currency)}
            </Row>
            {payment.paidAt && (
              <Row label={t('paidAt')}>
                {new Date(payment.paidAt).toLocaleString(INTL_LOCALE[locale], {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </Row>
            )}
          </dl>
        </>
      }
    />
  );
}

/**
 * The link the payment just bought, or an honest sentence about why it is not
 * here.
 *
 * The link is claimed with the intent key, which lives in this tab's
 * `sessionStorage` — so a buyer in a private window, or one who came back in a
 * different browser, has no key to present and gets no link. That is the
 * accepted cost of not making the order reference the capability (shape open
 * question 3), and the wording says what to do instead rather than pretending
 * something went wrong.
 *
 * The anchor is a plain link, not a fetch: the token is in the URL and the
 * browser is better at downloading a file than we are.
 */
function NextStep({
  step,
  locale,
}: {
  step: PurchaseNextStepDto | null;
  locale: keyof Tri;
}) {
  const t = (key: keyof typeof COPY) => COPY[key][locale];

  if (!step) {
    return (
      <p className="mt-8 max-w-[52ch] rounded-xl border border-[var(--rule)] bg-[var(--cream-2)] p-5 text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
        {t('linkMissing')}
      </p>
    );
  }

  const until = new Date(step.expiresAt).toLocaleDateString(
    INTL_LOCALE[locale],
    { dateStyle: 'long' },
  );

  return (
    <div className="mt-8 max-w-[52ch] rounded-xl border border-[var(--rule)] bg-[var(--cream-2)] p-6">
      <a
        href={step.url}
        className="inline-flex items-center bg-ink px-[22px] py-[13px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage"
      >
        {step.kind === 'material_download'
          ? t('downloadLink')
          : t('uploadLink')}
      </a>
      <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft text-pretty">
        {t('linkGoodUntil')} {until}
        {step.downloadsLeft !== null &&
          ` · ${step.downloadsLeft} ${t('downloadsLeft')}`}
        .
      </p>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </dt>
      <dd className="text-ink">{children}</dd>
    </>
  );
}

function Outcome({
  title,
  body,
  locale,
  details,
  retry = false,
}: {
  title: string;
  body: string;
  locale: keyof Tri;
  details?: React.ReactNode;
  retry?: boolean;
}) {
  const t = (key: keyof typeof COPY) => COPY[key][locale];
  return (
    <div aria-live="polite">
      <h1 className="max-w-[20ch] font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-ink text-balance">
        {title}
      </h1>
      <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
        {body}
      </p>
      {details}
      <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
        {retry && (
          <Link
            href="/checkout/express"
            className="underline underline-offset-4"
          >
            {t('tryAgain')} →
          </Link>
        )}
        <Link href="/contact" className="underline underline-offset-4">
          {t('writeToUs')} →
        </Link>
        <Link
          href="/"
          className="text-[0.9375rem] text-ink-soft underline underline-offset-4"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
