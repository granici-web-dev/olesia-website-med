'use client';

import { useId, useRef, useState } from 'react';

import { submitContactMessage, type ContactSubject } from '@/lib/leads';

/* ──────────────────────────────────────────────────────────────────────────
   Contact form — non-medical questions only (appointments, payment, how it
   works, other). Medical questions are routed to "Întrebare EXPRESS" by design,
   so this form collects no medical data and says so. Posts to /leads/contact.
   Bilingual (RO default · EN); copy lives here so it travels with the form.
   Accessibility: visible labels, errors tied to fields (aria-describedby),
   error summary focus, color-not-only states, honeypot + reduced-motion safe.
   ────────────────────────────────────────────────────────────────────────── */

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
  consent?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECTS: {
  value: ContactSubject;
  ro: string;
  en: string;
  ru: string;
}[] = [
  { value: 'appointment', ro: 'Programare', en: 'Appointment', ru: 'Запись на приём' },
  { value: 'payment', ro: 'Plată', en: 'Payment', ru: 'Оплата' },
  { value: 'how_it_works', ro: 'Cum funcționează', en: 'How it works', ru: 'Как это работает' },
  { value: 'other', ro: 'Altă întrebare', en: 'Other question', ru: 'Другой вопрос' },
];

const inputCls =
  'w-full border border-[var(--rule)] bg-paper px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-ink-soft/70 focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 aria-[invalid=true]:border-danger';
const labelCls =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text';
const errCls =
  'mt-2 flex items-center gap-1.5 text-[0.85rem] leading-snug text-danger';

export function ContactForm({ locale }: { locale: string }) {
  const en = locale === 'en';
  const ru = locale === 'ru';
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<ContactSubject>('appointment');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const t = (ro: string, enStr: string, ruStr: string) =>
    ru ? ruStr : en ? enStr : ro;

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    const required = t(
      'Acest câmp este obligatoriu.',
      'This field is required.',
      'Заполните это поле.',
    );
    if (!name.trim()) e.name = required;
    if (!email.trim()) e.email = required;
    else if (!EMAIL_RE.test(email.trim()))
      e.email = t(
        'Introdu o adresă de email validă.',
        'Enter a valid email address.',
        'Введите корректный адрес email.',
      );
    if (!message.trim()) e.message = required;
    if (!consent)
      e.consent = t(
        'Te rugăm să accepți prelucrarea datelor.',
        'Please accept the data processing terms.',
        'Подтвердите согласие на обработку данных.',
      );
    return e;
  };

  const focusFirst = (e: FieldErrors) => {
    if (e.name) nameRef.current?.focus();
    else if (e.email) emailRef.current?.focus();
    else if (e.message) msgRef.current?.focus();
    else if (e.consent) consentRef.current?.focus();
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === 'submitting') return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirst(e);
      return;
    }
    setStatus('submitting');
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        company: company || undefined,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="border border-sage/40 bg-paper p-8 md:p-10"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-sage text-cream"
        >
          ✓
        </span>
        <h3 className="serif mt-5 text-[clamp(1.5rem,2.4vw,2rem)] leading-snug">
          {t(
            'Mulțumim! Am primit mesajul tău.',
            'Thank you — we got your message.',
            'Спасибо! Мы получили ваше сообщение.',
          )}
        </h3>
        <p className="mt-3 max-w-[46ch] leading-relaxed text-ink-soft text-pretty">
          {t(
            'Îți răspundem în cel mult două zile lucrătoare. Pentru o întrebare medicală, folosește „Întreabă medicul".',
            'We’ll reply within two business days. For a medical question, use “Ask the doctor”.',
            'Ответим в течение двух рабочих дней. А с медицинским вопросом — через «Спросить врача».',
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {/* Honeypot — visually hidden, off the tab order, ignored by humans. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={fid('company')}>Company</label>
        <input
          id={fid('company')}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(ev) => setCompany(ev.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={fid('name')} className={labelCls}>
            {t('Nume', 'Name', 'Имя')}
          </label>
          <input
            ref={nameRef}
            id={fid('name')}
            type="text"
            className={inputCls}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder={t('Numele tău', 'Your name', 'Ваше имя')}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? fid('name-err') : undefined}
          />
          {errors.name && (
            <span id={fid('name-err')} className={errCls}>
              <span aria-hidden="true">✕</span>
              {errors.name}
            </span>
          )}
        </div>

        <div>
          <label htmlFor={fid('email')} className={labelCls}>
            {t('Email', 'Email', 'Email')}
          </label>
          <input
            ref={emailRef}
            id={fid('email')}
            type="email"
            className={inputCls}
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="adresa.ta@email.com"
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? fid('email-err') : undefined}
          />
          {errors.email && (
            <span id={fid('email-err')} className={errCls}>
              <span aria-hidden="true">✕</span>
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={fid('subject')} className={labelCls}>
          {t('Subiect', 'Subject', 'Тема')}
        </label>
        <div className="relative">
          <select
            id={fid('subject')}
            className={`${inputCls} appearance-none pr-12`}
            value={subject}
            onChange={(ev) => setSubject(ev.target.value as ContactSubject)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.ro, s.en, s.ru)}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1.5 6 6.5 11 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div>
        <label htmlFor={fid('message')} className={labelCls}>
          {t('Mesaj', 'Message', 'Сообщение')}
        </label>
        <textarea
          ref={msgRef}
          id={fid('message')}
          rows={5}
          className={`${inputCls} resize-y`}
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          placeholder={t('Cum te putem ajuta?', 'How can we help?', 'Чем мы можем помочь?')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? fid('message-err') : undefined}
        />
        {errors.message && (
          <span id={fid('message-err')} className={errCls}>
            <span aria-hidden="true">✕</span>
            {errors.message}
          </span>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed text-ink-soft">
          <input
            ref={consentRef}
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-sage"
            checked={consent}
            onChange={(ev) => setConsent(ev.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? fid('consent-err') : undefined}
          />
          <span className="text-pretty">
            {t(
              'Sunt de acord cu prelucrarea datelor conform Politicii de confidențialitate.',
              'I agree to the processing of my data per the Privacy Policy.',
              'Даю согласие на обработку данных согласно Политике конфиденциальности.',
            )}
          </span>
        </label>
        {errors.consent && (
          <span id={fid('consent-err')} className={errCls}>
            <span aria-hidden="true">✕</span>
            {errors.consent}
          </span>
        )}
      </div>

      {status === 'error' && (
        <p
          role="alert"
          className="border border-danger/40 bg-danger/5 px-4 py-3 text-[0.95rem] leading-relaxed text-ink text-pretty"
        >
          {t(
            'Ceva nu a funcționat. Încearcă din nou sau scrie-ne direct prin canalele de mai jos.',
            'Something went wrong. Try again, or reach us through the channels below.',
            'Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую по контактам ниже.',
          )}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex cursor-pointer items-center bg-ink px-[26px] py-[15px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting'
            ? t('Se trimite…', 'Sending…', 'Отправка…')
            : t('Trimite mesajul', 'Send message', 'Отправить сообщение')}
        </button>
      </div>
    </form>
  );
}
