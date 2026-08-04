'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Modal } from './Modal';
import {
  submitMonitoringLead,
  submitQuickQuestionLead,
  submitDeliverableLead,
  type LeadService,
  type DeliverableProduct,
} from '@/lib/leads';
import { track } from '@/lib/analytics';
import styles from './LeadFormModal.module.css';
import { CaptchaNotice } from './CaptchaNotice';

/** Group-C order context — the specific product being ordered. */
export interface DeliverableContext {
  code: DeliverableProduct;
  title: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  question?: string;
  consent?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadFormModal({
  service,
  deliverable,
  open,
  onClose,
}: {
  service?: LeadService;
  deliverable?: DeliverableContext;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('leadForm');
  const isDeliverable = !!deliverable;
  const isQuick = service === 'quick_question';
  const copy = isDeliverable ? 'deliverable' : isQuick ? 'quick' : 'monitoring';
  // Header title: for a product order, show the exact product name so the user
  // sees what they're ordering; otherwise the per-service i18n title.
  const headerTitle = deliverable ? deliverable.title : t(`${copy}.title`);
  const trackId = service ?? deliverable?.code ?? 'lead';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState(''); // message (monitoring) / question (quick)
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setText('');
    setConsent(false);
    setErrors({});
    setStatus('idle');
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
    else if (!EMAIL_RE.test(email.trim())) e.email = t('invalidEmail');
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
      if (isDeliverable) {
        await submitDeliverableLead({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: text.trim() || undefined,
          product: deliverable!.code,
        });
      } else if (isQuick) {
        await submitQuickQuestionLead({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          question: text.trim(),
        });
      } else {
        await submitMonitoringLead({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: text.trim() || undefined,
        });
      }
      track('lead_submit', { service: trackId });
      setStatus('success');
    } catch {
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
            autoComplete="name"
          />
          <Field
            id="lead-email"
            label={t('email')}
            error={errors.email}
            value={email}
            onChange={setEmail}
            placeholder={t('emailPlaceholder')}
            type="email"
            autoComplete="email"
          />
          <Field
            id="lead-phone"
            label={t('phone')}
            value={phone}
            onChange={setPhone}
            placeholder={t('phonePlaceholder')}
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
              aria-invalid={!!errors.question}
            />
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
              {t('error')}
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
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
