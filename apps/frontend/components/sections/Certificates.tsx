'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Modal } from '@/components/ui/Modal';
import { Reveal } from '@/components/ui/Reveal';
import styles from './Certificates.module.css';
import { biFor, type Bi } from '@/lib/i18n-types';

/* ──────────────────────────────────────────────────────────────────────────
   Credentials proof for /about — surfaces the doctor's recent training
   certificates as viewable documents (click → lightbox). Honest framing: each
   card shows the course title, issuer, duration and date only. The programs'
   partner-institution logos on the certificate carry an explicit "not an
   endorsement/accreditation" disclaimer, so they are NOT re-surfaced as trust
   badges — the document image speaks for itself in the lightbox.
   Trilingual (RO default · EN · RU); content is local.
   ────────────────────────────────────────────────────────────────────────── */

interface Certificate {
  id: string;
  src: string;
  w: number;
  h: number;
  title: Bi;
  issuer: string;
  hours: Bi;
  date: Bi;
}

const CERTIFICATES: Certificate[] = [
  {
    id: 'feeding-program',
    src: '/assets/cert-feeding-program.jpg',
    w: 930,
    h: 1280,
    title: {
      ro: 'Program pentru dificultățile de hrănire la copii',
      en: 'Pediatric Feeding Difficulties Program for Professionals',
      ru: 'Программа по трудностям кормления у детей (для специалистов)',
    },
    issuer: 'mama.hochu.kushat · Oksana Karabadzhak',
    hours: { ro: '39 de ore', en: '39 hours', ru: '39 часов' },
    date: { ro: 'Aprilie 2026', en: 'April 2026', ru: 'Апрель 2026' },
  },
  {
    id: 'bottle-aversion',
    src: '/assets/cert-bottle-aversion.jpg',
    w: 930,
    h: 1280,
    title: {
      ro: 'Refuzul biberonului la sugari — cauze și metode de corecție',
      en: 'Bottle Aversion in Infants — Causes and Correction Methods',
      ru: 'Отказ от бутылочки у младенцев — причины и методы коррекции',
    },
    issuer: 'mama.hochu.kushat · Oksana Karabadzhak',
    hours: { ro: '1 oră', en: '1 hour', ru: '1 час' },
    date: { ro: 'Ianuarie 2026', en: 'January 2026', ru: 'Январь 2026' },
  },
];

export function Certificates({ locale }: { locale: string }) {
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = biFor(locale);

  const [active, setActive] = useState<Certificate | null>(null);

  const t = {
    eyebrow: ru ? 'Обучение' : en ? 'Training' : 'Formare',
    issuedBy: ru ? 'Выдан' : en ? 'Issued by' : 'Eliberat de',
    view: ru
      ? 'Открыть сертификат'
      : en
        ? 'View certificate'
        : 'Vezi certificatul',
    close: ru ? 'Закрыть' : en ? 'Close' : 'Închide',
    intro: ru
      ? 'Недавние курсы по трудностям кормления и питанию грудничков — то, с чем я работаю каждый день.'
      : en
        ? 'Recent courses on feeding difficulties and infant feeding — areas I work with every day.'
        : 'Cursuri recente dedicate dificultăților de hrănire și alimentației sugarului — domenii pe care le întâlnesc zilnic în practică.',
  };

  return (
    <section className="border-t border-[var(--rule)]">
      <div className="shell py-20 md:py-28">
        <header className="max-w-[46rem]">
          <p className="eyebrow mb-3">{t.eyebrow}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Недавние <span className="serif-it text-sage">сертификаты</span>
              </>
            ) : en ? (
              <>
                Recent{' '}
                <span className="serif-it text-sage">certifications</span>
              </>
            ) : (
              <>
                Certificări <span className="serif-it text-sage">recente</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-[54ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {t.intro}
          </p>
        </header>

        <ul className="mt-12 grid gap-x-14 gap-y-14 sm:grid-cols-2 md:mt-16">
          {CERTIFICATES.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 90}>
              <figure className="grid gap-6 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-start">
                <button
                  type="button"
                  className={styles.doc}
                  onClick={() => setActive(c)}
                  aria-label={`${t.view} — ${lc(c.title)}`}
                >
                  <Image
                    src={c.src}
                    alt={lc(c.title)}
                    width={c.w}
                    height={c.h}
                    sizes="(max-width: 640px) 45vw, 150px"
                    className={styles.docImg}
                  />
                  <span className={styles.zoom} aria-hidden="true">
                    ⤢
                  </span>
                </button>

                <figcaption className="sm:pt-1">
                  <h3 className="serif text-[1.35rem] leading-snug tracking-[-0.01em] text-ink text-pretty">
                    {lc(c.title)}
                  </h3>
                  <dl className="mt-4 grid gap-1.5 text-[0.9375rem] leading-relaxed">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-sage-text">{t.issuedBy}</dt>
                      <dd className="text-ink">{c.issuer}</dd>
                    </div>
                    <div className="mono flex flex-wrap gap-x-2 text-[0.8125rem] uppercase tracking-[0.08em] text-ink-soft">
                      <span>{lc(c.hours)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{lc(c.date)}</span>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className={styles.viewLink}
                    onClick={() => setActive(c)}
                  >
                    {t.view} →
                  </button>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        labelledBy="cert-lightbox-title"
      >
        {active && (
          <div className={styles.lightbox}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActive(null)}
              aria-label={t.close}
            >
              ✕
            </button>
            <Image
              src={active.src}
              alt={lc(active.title)}
              width={active.w}
              height={active.h}
              sizes="(max-width: 768px) 92vw, 640px"
              className={styles.lightboxImg}
              priority
            />
            <p id="cert-lightbox-title" className={styles.lightboxCaption}>
              {lc(active.title)}
              <span aria-hidden="true"> · </span>
              <span className="text-ink-soft">
                {active.issuer} · {lc(active.hours)} · {lc(active.date)}
              </span>
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
