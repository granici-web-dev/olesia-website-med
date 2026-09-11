'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acceptUploadConsent,
  deletePatientFile,
  fetchUploadSession,
  rejectedBeforeSending,
  uploadPatientFile,
  UploadError,
  UploadLinkGone,
  type UploadSession,
} from '@/lib/uploads';
import { describeUploadError } from '@/lib/form-errors';
import { btnDark, underline } from '@/components/ui/cta';
import { CONSENT_VERSION, PATIENT_CONSENT_TEXT } from '@olesia/shared';
import { biFor, type Bi } from '@/lib/i18n-types';

/**
 * The patient's side of §11.14 — send analyses and investigations before the
 * consultation, without an account.
 *
 * Three things this page is careful about:
 *
 * 1. **Nothing is sent before consent.** The file picker does not exist until
 *    the box is ticked, so a patient cannot upload medical data and only then
 *    discover what they agreed to.
 * 2. **A dead link says so plainly**, in one screen, with what to do next. It
 *    never asks for the file first and fails after the upload.
 * 3. **Failures name the actual problem** — too large, wrong type, too many —
 *    because "something went wrong" on a page whose whole job is one action is
 *    the same as no message at all.
 */

const T = {
  eyebrow: { ro: 'Documente', en: 'Documents', ru: 'Документы' },
  title: {
    ro: 'Trimite analizele înainte de consultație',
    en: 'Send your analyses before the consultation',
    ru: 'Отправьте анализы до консультации',
  },
  intro: {
    ro: 'Analizele, investigațiile și documentele medicale trimise în avans fac consultația mult mai eficientă — medicul le poate studia înainte de întâlnire.',
    en: 'Analyses, investigations and medical documents sent in advance make the consultation far more useful — the doctor can study them before you meet.',
    ru: 'Анализы, обследования и медицинские документы, присланные заранее, делают консультацию гораздо полезнее — врач изучит их до встречи.',
  },
  greeting: { ro: 'Bună ziua', en: 'Hello', ru: 'Здравствуйте' },
  expires: {
    ro: 'Linkul este personal și expiră la',
    en: 'This link is personal and expires on',
    ru: 'Ссылка персональная и действует до',
  },
  loading: { ro: 'Se încarcă…', en: 'Loading…', ru: 'Загрузка…' },
  loadFailedTitle: {
    ro: 'Nu am putut deschide pagina',
    en: 'We could not open this page',
    ru: 'Не удалось открыть страницу',
  },
  loadFailedBody: {
    ro: 'Verifică conexiunea la internet și încearcă din nou. Dacă problema persistă, scrie-ne.',
    en: 'Check your internet connection and try again. If it keeps happening, write to us.',
    ru: 'Проверьте подключение к интернету и попробуйте ещё раз. Если не помогает — напишите нам.',
  },
  retry: { ro: 'Încearcă din nou', en: 'Try again', ru: 'Попробовать снова' },

  goneTitle: {
    ro: 'Linkul nu mai este valabil',
    en: 'This link is no longer valid',
    ru: 'Ссылка больше не действует',
  },
  goneBody: {
    ro: 'Linkul a expirat sau a fost închis. Scrie-ne și îți trimitem unul nou.',
    en: 'The link has expired or was closed. Write to us and we will send a new one.',
    ru: 'Срок ссылки истёк или её закрыли. Напишите нам — пришлём новую.',
  },
  goneCta: { ro: 'Contact', en: 'Contact', ru: 'Связаться' },

  consentTitle: {
    ro: 'Acordul tău',
    en: 'Your consent',
    ru: 'Ваше согласие',
  },
  // The wording itself comes from `@olesia/shared`, alongside the version the
  // API records against the link: what somebody agreed to and the identifier
  // for it have to move together.
  consentText: PATIENT_CONSENT_TEXT,
  consentCta: {
    ro: 'Sunt de acord și continui',
    en: 'I agree, continue',
    ru: 'Согласен(на), продолжить',
  },

  addFile: { ro: 'Alege un fișier', en: 'Choose a file', ru: 'Выбрать файл' },
  uploading: { ro: 'Se trimite…', en: 'Sending…', ru: 'Отправка…' },
  // The consent button is not sending a file, and saying so while somebody
  // waits for their consent to register is its own small lie (audit A6, F17).
  confirming: { ro: 'Se confirmă…', en: 'Confirming…', ru: 'Подтверждение…' },
  notePlaceholder: {
    ro: 'Notă scurtă (opțional) — de ex. „analize din 12 mai”',
    en: 'Short note (optional) — e.g. "blood work, 12 May"',
    ru: 'Короткая заметка (необязательно) — например, «анализы от 12 мая»',
  },
  limits: {
    ro: 'PDF, DOC, DOCX sau fotografii (JPG, PNG). Maximum',
    en: 'PDF, DOC, DOCX or photos (JPG, PNG). Up to',
    ru: 'PDF, DOC, DOCX или фото (JPG, PNG). Максимум',
  },
  perFile: { ro: 'pe fișier', en: 'per file', ru: 'на файл' },
  filesLeft: { ro: 'fișiere rămase', en: 'files left', ru: 'файлов осталось' },

  sentTitle: {
    ro: 'Ce ai trimis',
    en: 'What you have sent',
    ru: 'Что вы отправили',
  },
  empty: {
    ro: 'Încă nu ai trimis niciun document.',
    en: 'You have not sent any documents yet.',
    ru: 'Вы пока не отправили ни одного документа.',
  },
  remove: { ro: 'Șterge', en: 'Remove', ru: 'Удалить' },
  removed: {
    ro: 'Documentul a fost șters.',
    en: 'Document removed.',
    ru: 'Документ удалён.',
  },

  privacy: {
    ro: 'Documentele sunt stocate securizat, nu sunt publice și nu sunt accesibile prin niciun link. Le poate vedea doar medicul.',
    en: 'Documents are stored securely, are not public and are not reachable by any URL. Only the doctor can see them.',
    ru: 'Документы хранятся защищённо, не публичны и недоступны ни по какой ссылке. Их видит только врач.',
  },
} satisfies Record<string, Bi>;

/** The wording for a refusal, from the pure mapping in `lib/form-errors`. */
function explain(e: unknown, locale: string): string {
  const { status, code } =
    e instanceof UploadError ? e : { status: 0, code: '' };
  return describeUploadError(status, code, locale);
}

function humanSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1
    ? `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function PatientUpload({
  locale,
  token,
}: {
  locale: string;
  token: string;
}) {
  const ru = locale === 'ru';
  const en = locale === 'en';
  const t = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const [session, setSession] = useState<UploadSession | null>(null);
  const [gone, setGone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setSession(await fetchUploadSession(token));
    } catch (e) {
      if (e instanceof UploadLinkGone) setGone(true);
      else setError(explain(e, locale));
    }
  }, [token, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (fn: () => Promise<UploadSession>) => {
    setBusy(true);
    setError(null);
    try {
      setSession(await fn());
    } catch (e) {
      if (e instanceof UploadLinkGone) setGone(true);
      else setError(explain(e, locale));
    } finally {
      setBusy(false);
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear immediately: picking the same file twice in a row must re-fire.
    e.target.value = '';
    if (!file || !session) return;
    // Answer before the upload rather than after it: a phone photo over a slow
    // connection used to transfer in full and only then be refused for its size
    // (audit A6, F15). The session already carries the limits.
    const refusal = rejectedBeforeSending(file, session);
    if (refusal) {
      setError(describeUploadError(400, refusal, locale));
      return;
    }
    await run(() => uploadPatientFile(token, file, note));
    setNote('');
  };

  if (gone) {
    return (
      <section className="shell py-24 md:py-32">
        <h1 className="serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-[-0.015em] text-balance">
          {t(T.goneTitle)}
        </h1>
        <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
          {t(T.goneBody)}
        </p>
        <a href={`/${locale}/contact`} className={`${btnDark} mt-8`}>
          {t(T.goneCta)}
        </a>
      </section>
    );
  }

  // An error before the first load has to replace the page, not sit under it:
  // otherwise a failed fetch leaves "Se încarcă…" on screen forever and the
  // message the user needs is rendered nowhere.
  if (!session) {
    return (
      <section className="shell py-24 md:py-32">
        {error ? (
          <>
            <h1 className="serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-[-0.015em] text-balance">
              {t(T.loadFailedTitle)}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
              {t(T.loadFailedBody)}
            </p>
            <button
              type="button"
              className={`${btnDark} mt-8`}
              onClick={() => {
                setError(null);
                void load();
              }}
            >
              {t(T.retry)}
            </button>
          </>
        ) : (
          <p className="text-ink-soft">{t(T.loading)}</p>
        )}
      </section>
    );
  }

  const remaining = session.maxFiles - session.documents.length;
  // Consent to an earlier wording does not carry over — the API refuses the
  // upload either way, so the page asks again rather than failing at the file.
  const consented =
    session.consentAt !== null && session.consentVersion === CONSENT_VERSION;
  // ru-RU long dates end in "г." — appending our own full stop would render
  // "2026 г..". Strip a trailing one and let the sentence supply it.
  const expires = new Intl.DateTimeFormat(
    ru ? 'ru-RU' : en ? 'en-US' : 'ro-RO',
    { day: '2-digit', month: 'long', year: 'numeric' },
  )
    .format(new Date(session.expiresAt))
    .replace(/\.$/, '');

  return (
    <section className="shell py-20 md:py-28">
      <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
        <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
        {t(T.eyebrow)}
      </p>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div>
          <h1 className="serif max-w-[18ch] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.015em] text-balance">
            {t(T.title)}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {t(T.intro)}
          </p>
          <p className="mt-6 text-[0.95rem] text-ink">
            {t(T.greeting)},{' '}
            <span className="font-semibold">{session.greetingName}</span>.{' '}
            <span className="text-ink-soft">
              {t(T.expires)} {expires}.
            </span>
          </p>

          {/* Consent gate — the file picker does not exist above this line. */}
          {!consented ? (
            <div className="mt-10 border-t border-[var(--rule)] pt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                {t(T.consentTitle)}
              </p>
              <p className="mt-4 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink text-pretty">
                {t(T.consentText)}
              </p>
              <button
                type="button"
                className={`${btnDark} mt-6`}
                disabled={busy}
                onClick={() => void run(() => acceptUploadConsent(token))}
              >
                {busy ? t(T.confirming) : t(T.consentCta)}
              </button>
            </div>
          ) : (
            <div className="mt-10 border-t border-[var(--rule)] pt-8">
              <label className="block">
                <span className="sr-only">{t(T.notePlaceholder)}</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t(T.notePlaceholder)}
                  maxLength={200}
                  className="w-full border border-[var(--rule)] bg-paper px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-soft focus-visible:border-sage focus-visible:ring-2 focus-visible:ring-sage-text"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className={btnDark}
                  disabled={busy || remaining <= 0}
                  onClick={() => fileRef.current?.click()}
                >
                  {busy ? t(T.uploading) : t(T.addFile)}
                </button>
                <span className="text-[0.85rem] text-ink-soft">
                  {remaining} {t(T.filesLeft)}
                </span>
              </div>

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={session.acceptedTypes.join(',')}
                onChange={onPick}
              />

              <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
                {t(T.limits)} {humanSize(session.maxFileBytes)} {t(T.perFile)}.
              </p>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 border-l-0 border-t border-[var(--rule)] pt-4 text-[0.95rem] text-ink"
            >
              {error}
            </p>
          )}
        </div>

        {/* Sent files */}
        <div className="lg:border-l lg:border-[var(--rule)] lg:pl-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
            {t(T.sentTitle)}
          </p>

          {session.documents.length === 0 ? (
            <p className="mt-5 text-[0.95rem] text-ink-soft">{t(T.empty)}</p>
          ) : (
            <ul className="mt-5 grid gap-4">
              {session.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start justify-between gap-4 border-b border-[var(--rule)] pb-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.95rem] text-ink">
                      {d.fileName}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-ink-soft">
                      {humanSize(d.sizeBytes)}
                      {d.note ? ` · ${d.note}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`${underline} shrink-0`}
                    disabled={busy}
                    onClick={() =>
                      void run(() => deletePatientFile(token, d.id))
                    }
                  >
                    {t(T.remove)}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 max-w-[38ch] text-[0.85rem] leading-relaxed text-ink-soft text-pretty">
            {t(T.privacy)}
          </p>
        </div>
      </div>
    </section>
  );
}
