'use client';

import { useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Modal } from './Modal';
import {
  LeadError,
  leadLocale,
  submitMonitoringLead,
  submitQuickQuestionLead,
  type LeadService,
} from '@/lib/leads';
import { track } from '@/lib/analytics';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import styles from './LeadFormModal.module.css';
import { CaptchaNotice } from './CaptchaNotice';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  question?: string;
  consent?: string;
}

/**
 * The two group-B requests that are not purchases: "Monitorizare" and the free
 * "Întrebare rapidă".
 *
 * It had a third mode, for group-C product orders, which wrote an order the
 * doctor saw and worked on before anybody paid for it. Ordering goes through
 * `/checkout/deliverable/<product>` now, and this keeps the two forms that are
 * genuinely requests rather than sales.
 */
export function LeadFormModal({
  service,
  open,
  onClose,
}: {
  service?: LeadService;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('leadForm');
  const locale = leadLocale(useLocale());
  const fieldId = useId();
  const isQuick = service === 'quick_question';
  const copy = isQuick ? 'quick' : 'monitoring';
  const headerTitle = t(`${copy}.title`);
  const trackId = service ?? 'lead';
  // The EXPRESS question is the API's longest field; a message is the shorter
  // one. Both caps mirror `create-lead.dto.ts` so the box cannot collect text
  // the server will refuse (audit A6, F9).
  const textLimit = isQuick ? FIELD_LIMITS.question : FIELD_LIMITS.message;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState(''); // message (monitoring) / question (quick)
  const [consent, setConsent] = useState(false);
  // Honeypot: a hidden field a person never sees and a bot fills. The three
  // forms behind this modal carry the medical text, and until the client's
  // reCAPTCHA keys exist they had nothing at all (audit A3, F16).
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setText('');
    setConsent(false);
    setCompany('');
    setErrors({});
    setStatus('idle');
    setFailure('');
  };

  const close = () => {
    onClose();
    // Clear after the close animation so the form doesn't flash empty.
    setTimeout(reset, 250);
  };

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = t('required');
    if (!email.trim()) e.email = t('required');
    else if (!isEmailLike(email)) e.email = t('invalidEmail');
    if (isQuick && !text.trim()) e.question = t('required');
    if (!consent) e.consent = t('consentRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === 'submitting') return;
    if (!validate()) return;
    setStatus('submitting');
    try {
      const shared = {
        name: name.trim(),
        email: email.trim(),
        locale,
        company: company || undefined,
        phone: phone.trim() || undefined,
      };
      if (isQuick) {
        await submitQuickQuestionLead({ ...shared, question: text.trim() });
      } else {
        await submitMonitoringLead({
          ...shared,
          message: text.trim() || undefined,
        });
      }
      track('lead_submit', { service: trackId });
      setStatus('success');
    } catch (err) {
      const { status, code } =
        err instanceof LeadError ? err : { status: 0, code: '' };
      setFailure(describeLeadError(status, code, locale));
      setStatus('error');
    }
  };

  return (
    <Modal open={open} onClose={close} labelledBy="lead-form-title">
      <button
        type="button"
        className={styles.close}
        onClick={close}
        aria-label={t('close')}
      >
        ✕
      </button>

      {status === 'success' ? (
        <div className={styles.success}>
          <div className={styles.successMark} aria-hidden="true">
            ✓
          </div>
          <h2 id="lead-form-title" className={styles.title}>
            {t('successTitle')}
          </h2>
          <p className={styles.subtitle}>{t('successBody')}</p>
          <button type="button" className={styles.submit} onClick={close}>
            {t('close')}
          </button>
        </div>
      ) : (
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

          <header className={styles.header}>
            <p className={styles.eyebrow}>{t(`${copy}.tag`)}</p>
            <h2 id="lead-form-title" className={styles.title}>
              {headerTitle}
            </h2>
            <p className={styles.subtitle}>{t(`${copy}.subtitle`)}</p>
          </header>

          <Field
            id="lead-name"
            label={t('name')}
            error={errors.name}
            value={name}
            onChange={setName}
            placeholder={t('namePlaceholder')}
            maxLength={FIELD_LIMITS.name}
            autoComplete="name"
          />
          <Field
            id="lead-email"
            label={t('email')}
            error={errors.email}
            value={email}
            onChange={setEmail}
            placeholder={t('emailPlaceholder')}
            maxLength={FIELD_LIMITS.email}
            type="email"
            autoComplete="email"
          />
          <Field
            id="lead-phone"
            label={t('phone')}
            value={phone}
            onChange={setPhone}
            placeholder={t('phonePlaceholder')}
            maxLength={FIELD_LIMITS.phone}
            type="tel"
            autoComplete="tel"
          />

          <div className={styles.field}>
            <label htmlFor="lead-text" className={styles.label}>
              {isQuick ? t('question') : t('message')}
            </label>
            <textarea
              id="lead-text"
              className={styles.textarea}
              rows={isQuick ? 4 : 3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isQuick ? t('questionPlaceholder') : t('messagePlaceholder')
              }
              maxLength={textLimit}
              aria-invalid={!!errors.question}
            />
            {/* Only once it matters: a counter above an empty box is noise,
                and a box that silently stops accepting characters is worse. */}
            {text.length > textLimit * 0.8 && (
              <span aria-live="polite" className={styles.counter}>
                {text.length} / {textLimit}
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
          {errors.consent && (
            <span className={styles.error}>{errors.consent}</span>
          )}

          {status === 'error' && (
            <p className={styles.formError} role="alert">
              {failure}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>

          <CaptchaNotice className="mt-4" />
        </form>
      )}
    </Modal>
  );
}

function Field({
  id,
  label,
  error,
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
