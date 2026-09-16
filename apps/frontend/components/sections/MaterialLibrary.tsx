'use client';

import { useId, useMemo, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Modal } from '@/components/ui/Modal';
import { cardCta } from '@/components/ui/cta';
import { track } from '@/lib/analytics';
import { subscribe } from '@/lib/newsletter';
import { LeadError } from '@/lib/leads';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import type { AgeGroup } from '@/lib/age-taxonomy';
import type { MaterialCategoryDto, PublicMaterialDto } from '@/lib/api';
import { biFor, type Bi } from '@/lib/i18n-types';

/* ──────────────────────────────────────────────────────────────────────────
   Digital Library storefront (brief §6a). Owns the client-side interactions:
   search, category + child-age filters, free/paid badges, merchandising flags,
   and the email-gate that collects an address before a free download. Content
   arrives from the back-office `materials` module; this component localizes by
   `locale`. The email-gate stores the address through `POST /newsletter/
   subscribe` and only then hands over the file: it used to unlock optimistically
   and throw the address away, under copy promising the material would arrive by
   email (audit A6, F3). Nothing is mailed — the download happens here, and the
   wording says so.

   A paid card links to `/checkout/material/<slug>`; a paid material's file is
   in private storage and is released by the grant the payment mints, so there
   is no URL here to hand over and nothing to withhold. `hasFile` is what says
   whether a card sells or says "în curând", for free and paid alike.
   ────────────────────────────────────────────────────────────────────────── */

type Locale = 'ro' | 'en' | 'ru';
const T: Record<string, Bi> = {
  searchPlaceholder: {
    ro: 'Caută în bibliotecă…',
    en: 'Search the library…',
    ru: 'Поиск по библиотеке…',
  },
  all: { ro: 'Toate', en: 'All', ru: 'Все' },
  allAges: { ro: 'Toate vârstele', en: 'All ages', ru: 'Все возрасты' },
  category: { ro: 'Categorie', en: 'Category', ru: 'Категория' },
  age: { ro: 'Vârstă', en: 'Age', ru: 'Возраст' },
  free: { ro: 'Gratuit', en: 'Free', ru: 'Бесплатно' },
  download: { ro: 'Descarcă', en: 'Download', ru: 'Скачать' },
  buy: { ro: 'Cumpără', en: 'Buy', ru: 'Купить' },
  soon: { ro: 'În curând', en: 'Coming soon', ru: 'Скоро' },
  count: { ro: 'materiale', en: 'materials', ru: 'материалов' },
  emptyTitle: {
    ro: 'Niciun material găsit',
    en: 'No materials found',
    ru: 'Ничего не найдено',
  },
  emptyBody: {
    ro: 'Încearcă altă categorie, vârstă sau termen de căutare.',
    en: 'Try another category, age, or search term.',
    ru: 'Попробуйте другую категорию, возраст или запрос.',
  },
  reset: {
    ro: 'Resetează filtrele',
    en: 'Reset filters',
    ru: 'Сбросить фильтры',
  },
  gateTitle: {
    ro: 'Descarcă gratuit',
    en: 'Free download',
    ru: 'Бесплатное скачивание',
  },
  gateBody: {
    ro: 'Lasă-ți adresa și descarcă materialul. Te poți abona și la noutăți.',
    en: 'Leave your address and download the material. You can also subscribe to updates.',
    ru: 'Оставьте адрес и скачайте материал. Можно также подписаться на новости.',
  },
  email: { ro: 'Email', en: 'Email', ru: 'Email' },
  emailPlaceholder: {
    ro: 'email@exemplu.md',
    en: 'email@example.com',
    ru: 'email@example.com',
  },
  consent: {
    ro: 'Sunt de acord să primesc noutăți pe email și ca adresa mea să fie păstrată în acest scop.',
    en: 'I agree to receive updates by email and to my address being kept for that purpose.',
    ru: 'Согласен(на) получать новости по email и на хранение моего адреса для этой цели.',
  },
  getIt: {
    ro: 'Descarcă materialul',
    en: 'Download the material',
    ru: 'Скачать материал',
  },
  sending: { ro: 'Se salvează…', en: 'Saving…', ru: 'Сохранение…' },
  cancel: { ro: 'Anulează', en: 'Cancel', ru: 'Отмена' },
  ready: {
    ro: 'Gata! Descărcarea ta este pregătită.',
    en: 'Done! Your download is ready.',
    ru: 'Готово! Файл готов к скачиванию.',
  },
  flagRecommended: { ro: 'Recomandat', en: 'Recommended', ru: 'Рекомендуем' },
  flagPopular: { ro: 'Popular', en: 'Popular', ru: 'Популярное' },
  flagNew: { ro: 'Nou', en: 'New', ru: 'Новое' },
};

const FLAG_LABEL: Record<string, Bi> = {
  recommended: T.flagRecommended,
  popular: T.flagPopular,
  new: T.flagNew,
};

function DocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3.5h7L18 8v12.5H6V3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M13 3.5V8h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v5m0 0 2-2m-2 2-2-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Two filter axes that must never read as one long chip strip. Each gets its
   own active color: Category → solid dark (ink), Age → sage tint. Both states
   clear 4.5:1, so the coding is decorative-safe. */
const chip = (on: boolean, tone: 'ink' | 'sage' = 'ink') => {
  const base =
    'cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.07em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
  if (!on)
    return `${base} border-[var(--rule)] text-ink-soft hover:border-sage hover:text-sage`;
  return tone === 'sage'
    ? `${base} border-sage bg-sage/15 text-sage-deep`
    : `${base} border-ink bg-ink text-cream`;
};

/* Small anchors so each filter row is labelled inline (not by an identical
   floating eyebrow). Different glyph per axis reinforces topic vs. audience. */
function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h7l9 9-7 7-9-9V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8.4" cy="8.4" r="1.3" fill="currentColor" />
    </svg>
  );
}
function AgeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="7.2"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
const filterLabel =
  'flex shrink-0 items-center gap-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink sm:w-[112px]';

export function MaterialLibrary({
  locale,
  materials,
  categories,
  ages,
}: {
  locale: Locale;
  materials: PublicMaterialDto[];
  categories: MaterialCategoryDto[];
  ages: AgeGroup[];
}) {
  const lc = biFor(locale);
  /** RU falls back to RO, an empty string counting as missing — as everywhere. */
  const tri = (ro: string, en: string, ru: string | null) =>
    locale === 'ru' ? (ru?.trim() ? ru : ro) : locale === 'en' ? en : ro;
  const title = (m: PublicMaterialDto) => tri(m.titleRo, m.titleEn, m.titleRu);
  const summary = (m: PublicMaterialDto) =>
    tri(m.descriptionRo, m.descriptionEn, m.descriptionRu);
  const priceLabel = (m: PublicMaterialDto) =>
    m.price === null ? '' : `${m.price} €`;
  /** "PDF · 16 pag. · RO" — assembled per locale from the stored page count. */
  const formatLine = (m: PublicMaterialDto) => {
    const parts = ['PDF'];
    if (m.pageCount !== null) {
      parts.push(
        `${m.pageCount} ${locale === 'ru' ? 'стр.' : locale === 'en' ? 'pp.' : 'pag.'}`,
      );
    }
    if (m.fileLang) parts.push(m.fileLang);
    return parts.join(' · ');
  };

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [age, setAge] = useState('all');
  const [gate, setGate] = useState<PublicMaterialDto | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  const catLabel = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.slug, tri(c.nameRo, c.nameEn, c.nameRu)]),
      ),
    [categories, locale],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (cat !== 'all' && m.categorySlug !== cat) return false;
      if (age !== 'all' && m.ageKeys.length > 0 && !m.ageKeys.includes(age))
        return false;
      if (q) {
        const hay = `${title(m)} ${summary(m)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [materials, query, cat, age, locale]);

  const reset = () => {
    setQuery('');
    setCat('all');
    setAge('all');
  };

  const unlock = (slug: string) =>
    setUnlocked((prev) => new Set(prev).add(slug));

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-[440px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lc(T.searchPlaceholder)}
          aria-label={lc(T.searchPlaceholder)}
          className="w-full border-b border-[var(--rule)] bg-transparent py-2.5 pr-8 text-[1rem] text-ink placeholder:text-ink-soft focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-text"
        />
        <span
          aria-hidden="true"
          className="mono pointer-events-none absolute right-1 top-2.5 text-ink-soft"
        >
          ⌕
        </span>
      </div>

      {/* Filters — two distinct axes. Category (what a material is about) uses
          dark chips + a tag; Age (who it's for) uses sage chips + mono numeric
          ranges. Inline labels anchor each row so they never merge visually. */}
      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--rule)] pt-6">
        {/* Category — topic */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-baseline sm:gap-4">
          <span className={filterLabel}>
            <span className="text-sage">
              <TagIcon />
            </span>
            {lc(T.category)}
          </span>
          <div
            role="group"
            aria-label={lc(T.category)}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={cat === 'all'}
              onClick={() => setCat('all')}
              className={chip(cat === 'all', 'ink')}
            >
              {lc(T.all)}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={cat === c.slug}
                onClick={() => setCat(c.slug)}
                className={chip(cat === c.slug, 'ink')}
              >
                {tri(c.nameRo, c.nameEn, c.nameRu)}
              </button>
            ))}
          </div>
        </div>

        {/* Age — audience */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-baseline sm:gap-4">
          <span className={filterLabel}>
            <span className="text-sage">
              <AgeIcon />
            </span>
            {lc(T.age)}
          </span>
          <div
            role="group"
            aria-label={lc(T.age)}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={age === 'all'}
              onClick={() => setAge('all')}
              className={`${chip(age === 'all', 'sage')} mono`}
            >
              {lc(T.allAges)}
            </button>
            {ages.map((a) => (
              <button
                key={a.key}
                type="button"
                aria-pressed={age === a.key}
                onClick={() => setAge(a.key)}
                className={`${chip(age === a.key, 'sage')} mono tabular-nums`}
              >
                {lc(a.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p
        aria-live="polite"
        className="mono mt-8 text-[11px] uppercase tracking-[0.1em] text-ink-soft"
      >
        {filtered.length} {lc(T.count)}
      </p>

      {/* Grid / empty state */}
      {filtered.length === 0 ? (
        <div className="border-t border-[var(--rule)] py-20 text-center md:py-24">
          <h3 className="serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.02em] text-balance">
            {lc(T.emptyTitle)}
          </h3>
          <p className="mx-auto mt-3 max-w-[44ch] leading-relaxed text-ink-soft text-pretty">
            {lc(T.emptyBody)}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 inline-flex cursor-pointer items-center bg-ink px-[22px] py-[13px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage"
          >
            {lc(T.reset)}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const isUnlocked = unlocked.has(m.slug);
            // One question for both kinds: is there a file at all. For a paid
            // material the file is private and `hasFile` is the only thing the
            // storefront is told about it.
            const ready = m.hasFile;
            return (
              <Reveal key={m.slug} delay={(i % 3) * 70}>
                <article className="group flex h-full flex-col border border-[var(--rule)] bg-paper transition-colors hover:border-sage">
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-cream-2 text-sage">
                    <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-sage-text">
                      {catLabel[m.categorySlug]}
                    </span>
                    {/* A price is the loudest thing on the card and the one
                        thing a card with no file cannot honour — twelve of them
                        priced above a dead "ÎN CURÂND" is what audit A13
                        photographed. "Gratuit" goes with it: neither is on
                        offer yet, and the pill below says so once. */}
                    {ready && (
                      <span
                        className={`mono absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                          m.access === 'free'
                            ? 'bg-sage/15 text-sage-text'
                            : 'bg-ink text-cream'
                        }`}
                      >
                        {m.access === 'free' ? lc(T.free) : priceLabel(m)}
                      </span>
                    )}
                    <span className="transition-transform duration-500 group-hover:scale-110">
                      <DocIcon />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    {m.flags.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {m.flags.map((f) => (
                          <span
                            key={f}
                            className="mono rounded-full border border-sage/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-sage-text"
                          >
                            {lc(FLAG_LABEL[f])}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="serif text-[1.3rem] leading-snug tracking-[-0.01em] text-ink text-pretty">
                      {title(m)}
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                      {summary(m)}
                    </p>
                    {formatLine(m) && (
                      <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        {formatLine(m)}
                      </p>
                    )}

                    <div className="mt-6 pt-1">
                      {!ready ? (
                        // Say "coming soon" up front, for a paid material as
                        // much as a free one: offering to sell a download that
                        // does not exist is worse than admitting it is not
                        // ready.
                        <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                          {lc(T.soon)}
                        </span>
                      ) : m.access === 'paid' ? (
                        <a
                          href={`/${locale}/checkout/material/${m.slug}`}
                          className={cardCta}
                        >
                          {lc(T.buy)} · {priceLabel(m)}
                        </a>
                      ) : isUnlocked ? (
                        <a
                          href={m.fileUrl ?? '#'}
                          download
                          className="inline-flex cursor-pointer items-center gap-2 border-b border-sage pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-sage-text"
                        >
                          {lc(T.download)} <span aria-hidden="true">↓</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setGate(m)}
                          className={cardCta}
                        >
                          {lc(T.download)}{' '}
                          <span
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-y-0.5"
                          >
                            ↓
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Email gate */}
      {gate && (
        <EmailGate
          key={gate.slug}
          materialTitle={title(gate)}
          fileUrl={gate.fileUrl ?? ''}
          lc={lc}
          onClose={() => setGate(null)}
          onSubscribed={async (email) => {
            // The address is what the material is exchanged for, so the file is
            // released only once the API has it (audit A6, F3). A failure keeps
            // the gate open and says what happened, rather than unlocking on a
            // promise or answering every refusal with one sentence (A7).
            try {
              await subscribe(email, { source: 'library', locale });
            } catch (e) {
              const failure = e instanceof LeadError ? e : new LeadError(0, '');
              return describeLeadError(failure.status, failure.code, locale);
            }
            track('material_download', {
              slug: gate.slug,
              category: gate.categorySlug,
            });
            unlock(gate.slug);
            return null;
          }}
        />
      )}
    </div>
  );
}

function EmailGate({
  materialTitle,
  fileUrl,
  lc,
  onClose,
  onSubscribed,
}: {
  /** Localized by the parent, which owns the locale helpers. */
  materialTitle: string;
  fileUrl: string;
  lc: (b: Bi) => string;
  onClose: () => void;
  /**
   * Stores the address. Returns `null` on success, or the sentence to show —
   * anything other than `null` means nothing unlocks.
   */
  onSubscribed: (email: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ready'>('idle');
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const emailId = useId();
  const valid = isEmailLike(email) && consent;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === 'sending') return;
    setStatus('sending');
    setError(null);
    const failure = await onSubscribed(email);
    setError(failure);
    setStatus(failure ? 'idle' : 'ready');
  };

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <div className="p-7">
        <p className="mono text-[10px] uppercase tracking-[0.16em] text-sage-text">
          {lc(T.gateTitle)}
        </p>
        <h3
          id={titleId}
          className="serif mt-2 text-[1.5rem] leading-snug tracking-[-0.01em] text-pretty"
        >
          {materialTitle}
        </h3>

        {status === 'ready' ? (
          <div className="mt-4">
            <p className="text-[0.95rem] leading-relaxed text-ink text-pretty">
              {lc(T.ready)}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={fileUrl}
                download
                className="inline-flex cursor-pointer items-center gap-2 bg-ink px-[22px] py-[13px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage"
              >
                {lc(T.download)} <span aria-hidden="true">↓</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-[13px] uppercase tracking-[0.04em] text-ink-soft transition-colors hover:text-ink"
              >
                {lc(T.cancel)}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
              {lc(T.gateBody)}
            </p>

            <form className="mt-6" onSubmit={onSubmit}>
              <label
                htmlFor={emailId}
                className="mono mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-sage-text"
              >
                {lc(T.email)}
              </label>
              <input
                id={emailId}
                type="email"
                required
                value={email}
                maxLength={FIELD_LIMITS.email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lc(T.emailPlaceholder)}
                className="w-full border-b border-[var(--rule)] bg-transparent py-2.5 text-[1rem] text-ink placeholder:text-ink-soft focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-text"
              />
              <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[0.85rem] leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--sage,#7a8b6f)]"
                />
                <span>{lc(T.consent)}</span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="mt-4 text-[0.85rem] leading-relaxed text-[var(--walnut,#8a5a3a)]"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={!valid || status === 'sending'}
                  className="inline-flex cursor-pointer items-center bg-ink px-[22px] py-[13px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'sending' ? lc(T.sending) : lc(T.getIt)}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer text-[13px] uppercase tracking-[0.04em] text-ink-soft transition-colors hover:text-ink"
                >
                  {lc(T.cancel)}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
