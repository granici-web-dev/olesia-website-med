'use client';

import { useEffect, useId, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  CURRENCY_NOTICE,
  TERMS_ACCEPT_TEXT,
  type TermsLocale,
} from '@olesia/shared';

import { Link } from '@/i18n/navigation';
import { LeadError, leadLocale } from '@/lib/leads';
import {
  checkoutIntentKey,
  startDeliverableCheckout,
  startMaterialCheckout,
  startQuickQuestionCheckout,
} from '@/lib/checkout';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import { track } from '@/lib/analytics';
import { CaptchaNotice } from '@/components/ui/CaptchaNotice';
import styles from '@/components/ui/LeadFormModal.module.css';

/* ──────────────────────────────────────────────────────────────────────────
   One checkout form, three purchases.

   The payer block, the terms checkbox and the currency notice are the same for
   all three, because they are the same promise; what differs is one field and
   one closing sentence. Two of the three write their purchase down *before* the
   redirect, which is decision 1 in `docs/shape-express-checkout.md`: pay-first
   has no way back into a tab somebody closed, and form-first makes the worst
   case "something we keep for seven days and delete". A material writes nothing
   down at all — there is nothing to write until the money lands.

   It borrows `LeadFormModal.module.css` rather than growing a second copy of
   the same eight rules — same fields, same states, same visual language, one
   page instead of a dialog.
   ────────────────────────────────────────────────────────────────────────── */

/** Which purchase this form is opening, and what it needs to name it. */
export type CheckoutTarget =
  | { kind: 'express' }
  | { kind: 'deliverable'; product: string }
  | { kind: 'material'; slug: string };

type Status = 'idle' | 'submitting' | 'redirecting' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  text?: string;
  consent?: string;
  terms?: string;
}

type Tri = { ro: string; en: string; ru: string };

const COPY = {
  name: { ro: 'Nume și prenume', en: 'Full name', ru: 'Имя и фамилия' },
  email: { ro: 'Email', en: 'Email', ru: 'Email' },
  phone: {
    ro: 'Telefon (opțional)',
    en: 'Phone (optional)',
    ru: 'Телефон (необязательно)',
  },
  question: { ro: 'Întrebarea ta', en: 'Your question', ru: 'Ваш вопрос' },
  questionPlaceholder: {
    ro: 'Descrie situația cât mai concret: vârsta copilului, de când durează, ce ai încercat deja.',
    en: 'Describe the situation as concretely as you can: your child’s age, how long it has lasted, what you have already tried.',
    ru: 'Опишите ситуацию как можно конкретнее: возраст ребёнка, сколько длится, что уже пробовали.',
  },
  details: {
    ro: 'Detalii (opțional)',
    en: 'Details (optional)',
    ru: 'Детали (необязательно)',
  },
  detailsPlaceholder: {
    ro: 'Vârsta copilului, alergii sau alimente excluse, obiceiuri de masă, orice ar trebui să știu înainte de a începe.',
    en: 'Your child’s age, allergies or foods to avoid, mealtime habits, anything I should know before I start.',
    ru: 'Возраст ребёнка, аллергии или исключённые продукты, привычки в еде — всё, что важно знать до начала.',
  },
  consentExpress: {
    ro: 'Sunt de acord ca datele trimise aici să fie folosite pentru a-mi răspunde la întrebare.',
    en: 'I agree that the details I send here are used to answer my question.',
    ru: 'Я согласен(на), что присланные данные будут использованы, чтобы ответить на мой вопрос.',
  },
  consentDeliverable: {
    ro: 'Sunt de acord ca datele trimise aici să fie folosite pentru a pregăti comanda mea.',
    en: 'I agree that the details I send here are used to prepare my order.',
    ru: 'Я согласен(на), что присланные данные будут использованы для подготовки моего заказа.',
  },
  required: {
    ro: 'Acest câmp este obligatoriu.',
    en: 'This field is required.',
    ru: 'Это поле обязательно.',
  },
  invalidEmail: {
    ro: 'Verifică adresa de email.',
    en: 'Check the email address.',
    ru: 'Проверьте адрес email.',
  },
  termsRequired: {
    ro: 'Confirmă termenii înainte de a plăti.',
    en: 'Accept the terms before paying.',
    ru: 'Примите условия перед оплатой.',
  },
  submit: {
    ro: 'Continuă spre plată',
    en: 'Continue to payment',
    ru: 'Перейти к оплате',
  },
  submitting: { ro: 'Se pregătește…', en: 'Preparing…', ru: 'Готовим…' },
  redirecting: {
    ro: 'Te trimitem la bancă…',
    en: 'Taking you to the bank…',
    ru: 'Переходим на страницу банка…',
  },
  termsLink: {
    ro: 'Termenii și condițiile',
    en: 'Terms and conditions',
    ru: 'Условия использования',
  },
  afterExpress: {
    ro: 'Întrebarea ajunge la medic numai după confirmarea plății. Plata se face pe pagina securizată a băncii — noi nu vedem datele cardului.',
    en: 'Your question reaches the doctor only once the payment is confirmed. You pay on the bank’s secure page; we never see your card details.',
    ru: 'Вопрос попадёт к врачу только после подтверждения оплаты. Оплата проходит на защищённой странице банка — данные карты мы не видим.',
  },
  afterDeliverable: {
    ro: 'Comanda ajunge la medic numai după confirmarea plății. Imediat după plată primești un link personal prin care trimiți analizele și documentele necesare. Plata se face pe pagina securizată a băncii — noi nu vedem datele cardului.',
    en: 'Your order reaches the doctor only once the payment is confirmed. Right after paying you get a personal link for sending the test results and documents needed. You pay on the bank’s secure page; we never see your card details.',
    ru: 'Заказ попадёт к врачу только после подтверждения оплаты. Сразу после оплаты вы получите личную ссылку, по которой пришлёте анализы и нужные документы. Оплата проходит на защищённой странице банка — данные карты мы не видим.',
  },
  afterMaterial: {
    ro: 'Imediat după confirmarea plății primești linkul de descărcare, chiar pe pagina de întoarcere. Plata se face pe pagina securizată a băncii — noi nu vedem datele cardului.',
    en: 'As soon as the payment is confirmed you get the download link, on the page you come back to. You pay on the bank’s secure page; we never see your card details.',
    ru: 'Сразу после подтверждения оплаты вы получите ссылку на скачивание — прямо на странице возврата. Оплата проходит на защищённой странице банка — данные карты мы не видим.',
  },
} satisfies Record<string, Tri>;

export function CheckoutForm({ target }: { target: CheckoutTarget }) {
  const locale = leadLocale(useLocale());
  const t = (key: keyof typeof COPY) => COPY[key][locale];
  const fieldId = useId();

  const isExpress = target.kind === 'express';
  const isDeliverable = target.kind === 'deliverable';
  // A material needs a payer and nothing else: there is no brief to write and
  // no question to ask, only a file to hand over.
  const hasText = isExpress || isDeliverable;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  // Honeypot — a hidden field a person never sees and a bot fills.
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');

  // `crypto.randomUUID` and `sessionStorage` are both browser-only, so the key
  // is minted after mount rather than during render. Until it exists the submit
  // button is disabled: a checkout with no intent key is one a double click
  // would turn into two purchases.
  const [intentKey, setIntentKey] = useState('');
  useEffect(() => setIntentKey(checkoutIntentKey()), []);

  const textLimit = isExpress ? FIELD_LIMITS.question : FIELD_LIMITS.message;

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = t('required');
    if (!email.trim()) e.email = t('required');
    else if (!isEmailLike(email)) e.email = t('invalidEmail');
    // Only the EXPRESS question is required text. A menu's brief is welcome
    // and optional: the doctor asks for what she still needs through the
    // upload link the payment issues.
    if (isExpress && !text.trim()) e.text = t('required');
    if (hasText && !consent) e.consent = t('required');
    if (!terms) e.terms = t('termsRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    // One submit. A second click while the first is in flight would open a
    // second bank session; the intent key catches that server-side too, but
    // the button should not invite it in the first place.
    if (status === 'submitting' || status === 'redirecting') return;
    if (!validate()) return;

    setStatus('submitting');
    const shared = {
      name: name.trim(),
      email: email.trim(),
      locale,
      phone: phone.trim() || undefined,
      company: company || undefined,
      intentKey,
    };

    try {
      const session =
        target.kind === 'express'
          ? await startQuickQuestionCheckout({
              ...shared,
              question: text.trim(),
            })
          : target.kind === 'deliverable'
            ? await startDeliverableCheckout({
                ...shared,
                product: target.product,
                message: text.trim() || undefined,
              })
            : await startMaterialCheckout({ ...shared, slug: target.slug });

      track('checkout_start', { service: trackingName(target) });
      // Stay disabled: the navigation is not instant and the form must not
      // look ready to be sent again while the browser is leaving.
      setStatus('redirecting');
      window.location.assign(session.checkoutUrl);
    } catch (err) {
      const { status: code, code: machine } =
        err instanceof LeadError
          ? { status: err.status, code: err.code }
          : { status: 0, code: '' };
      setFailure(describeLeadError(code, machine, locale));
      setStatus('error');
    }
  };

  const busy = status === 'submitting' || status === 'redirecting';

  return (
    <form className={styles.body} onSubmit={onSubmit} noValidate>
      {/* Honeypot — visually hidden, off the tab order, ignored by humans. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${fieldId}-company`}>Company</label>
        <input
          id={`${fieldId}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(ev) => setCompany(ev.target.value)}
        />
      </div>

      <Field
        id={`${fieldId}-name`}
        label={t('name')}
        error={errors.name}
        value={name}
        onChange={setName}
        maxLength={FIELD_LIMITS.name}
        autoComplete="name"
      />
      <Field
        id={`${fieldId}-email`}
        label={t('email')}
        error={errors.email}
        value={email}
        onChange={setEmail}
        maxLength={FIELD_LIMITS.email}
        type="email"
        autoComplete="email"
      />
      <Field
        id={`${fieldId}-phone`}
        label={t('phone')}
        value={phone}
        onChange={setPhone}
        maxLength={FIELD_LIMITS.phone}
        type="tel"
        autoComplete="tel"
      />

      {hasText && (
        <div className={styles.field}>
          <label htmlFor={`${fieldId}-text`} className={styles.label}>
            {isExpress ? t('question') : t('details')}
          </label>
          <textarea
            id={`${fieldId}-text`}
            className={styles.textarea}
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isExpress ? t('questionPlaceholder') : t('detailsPlaceholder')
            }
            maxLength={textLimit}
            aria-invalid={!!errors.text}
          />
          {/* Only once it matters: a counter above an empty box is noise, and
              a box that silently stops accepting characters is worse. */}
          {text.length > textLimit * 0.8 && (
            <span aria-live="polite" className={styles.counter}>
              {text.length} / {textLimit}
            </span>
          )}
          {errors.text && <span className={styles.error}>{errors.text}</span>}
        </div>
      )}

      {hasText && (
        <>
          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={!!errors.consent}
            />
            <span>
              {isExpress ? t('consentExpress') : t('consentDeliverable')}
            </span>
          </label>
          {errors.consent && (
            <span className={styles.error}>{errors.consent}</span>
          )}
        </>
      )}

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          aria-invalid={!!errors.terms}
        />
        <span>
          {TERMS_ACCEPT_TEXT[locale as TermsLocale]}{' '}
          <Link href="/terms" className="underline underline-offset-2">
            {t('termsLink')}
          </Link>
        </span>
      </label>
      {errors.terms && <span className={styles.error}>{errors.terms}</span>}

      <p className="text-[0.82rem] leading-relaxed text-ink-soft">
        {CURRENCY_NOTICE[locale as TermsLocale]}
      </p>
      <p className="text-[0.82rem] leading-relaxed text-ink-soft">
        {isExpress
          ? t('afterExpress')
          : isDeliverable
            ? t('afterDeliverable')
            : t('afterMaterial')}
      </p>

      {status === 'error' && (
        <p className={styles.formError} role="alert">
          {failure}
        </p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={busy || !intentKey}
      >
        {status === 'redirecting'
          ? t('redirecting')
          : status === 'submitting'
            ? t('submitting')
            : t('submit')}
      </button>

      <CaptchaNotice className="mt-4" />
    </form>
  );
}

/** What the analytics event calls this purchase. No PII, ever. */
function trackingName(target: CheckoutTarget): string {
  return target.kind === 'express'
    ? 'quick_question'
    : target.kind === 'deliverable'
      ? target.product
      : `material:${target.slug}`;
}

function Field({
  id,
  label,
  error,
  value,
  onChange,
  maxLength,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
