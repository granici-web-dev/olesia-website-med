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
import { checkoutIntentKey, startQuickQuestionCheckout } from '@/lib/checkout';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import { track } from '@/lib/analytics';
import { CaptchaNotice } from '@/components/ui/CaptchaNotice';
import styles from '@/components/ui/LeadFormModal.module.css';

/* ──────────────────────────────────────────────────────────────────────────
   The EXPRESS checkout form. The question is written down and the ticket is
   created *before* the redirect to the bank, which is the whole of decision 1
   in `docs/shape-express-checkout.md`: pay-first has no way back into a tab
   somebody closed, and form-first makes the worst case "a question we keep for
   seven days and delete". The doctor sees nothing until the money lands.

   It borrows `LeadFormModal.module.css` rather than growing a second copy of
   the same eight rules — same fields, same states, same visual language, one
   page instead of a dialog.
   ────────────────────────────────────────────────────────────────────────── */

type Status = 'idle' | 'submitting' | 'redirecting' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  question?: string;
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
  consent: {
    ro: 'Sunt de acord ca datele trimise aici să fie folosite pentru a-mi răspunde la întrebare.',
    en: 'I agree that the details I send here are used to answer my question.',
    ru: 'Я согласен(на), что присланные данные будут использованы, чтобы ответить на мой вопрос.',
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
  afterPayment: {
    ro: 'Întrebarea ajunge la medic numai după confirmarea plății. Plata se face pe pagina securizată a băncii — noi nu vedem datele cardului.',
    en: 'Your question reaches the doctor only once the payment is confirmed. You pay on the bank’s secure page; we never see your card details.',
    ru: 'Вопрос попадёт к врачу только после подтверждения оплаты. Оплата проходит на защищённой странице банка — данные карты мы не видим.',
  },
} satisfies Record<string, Tri>;

export function ExpressCheckoutForm() {
  const locale = leadLocale(useLocale());
  const t = (key: keyof typeof COPY) => COPY[key][locale];
  const fieldId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [question, setQuestion] = useState('');
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
  // would turn into two tickets.
  const [intentKey, setIntentKey] = useState('');
  useEffect(() => setIntentKey(checkoutIntentKey()), []);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = t('required');
    if (!email.trim()) e.email = t('required');
    else if (!isEmailLike(email)) e.email = t('invalidEmail');
    if (!question.trim()) e.question = t('required');
    if (!consent) e.consent = t('required');
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
    try {
      const session = await startQuickQuestionCheckout({
        name: name.trim(),
        email: email.trim(),
        locale,
        phone: phone.trim() || undefined,
        question: question.trim(),
        company: company || undefined,
        intentKey,
      });
      track('checkout_start', { service: 'quick_question' });
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

      <div className={styles.field}>
        <label htmlFor={`${fieldId}-question`} className={styles.label}>
          {t('question')}
        </label>
        <textarea
          id={`${fieldId}-question`}
          className={styles.textarea}
          rows={5}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          maxLength={FIELD_LIMITS.question}
          aria-invalid={!!errors.question}
        />
        {question.length > FIELD_LIMITS.question * 0.8 && (
          <span aria-live="polite" className={styles.counter}>
            {question.length} / {FIELD_LIMITS.question}
          </span>
        )}
        {errors.question && (
          <span className={styles.error}>{errors.question}</span>
        )}
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={!!errors.consent}
        />
        <span>{t('consent')}</span>
      </label>
      {errors.consent && <span className={styles.error}>{errors.consent}</span>}

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
        {t('afterPayment')}
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
