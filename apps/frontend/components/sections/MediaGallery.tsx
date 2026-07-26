'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Reveal } from '@/components/ui/Reveal';
import { track } from '@/lib/analytics';
import type { Bi, MediaAppearance } from '@/lib/media-appearances';
import styles from './MediaGallery.module.css';

/* ──────────────────────────────────────────────────────────────────────────
   Grid of media appearances with CLICK-TO-LOAD embeds.

   Why click-to-load: a YouTube or Facebook iframe sets third-party cookies the
   moment it renders. The client asked for a GDPR banner with a real "Refuz"
   option (answers v2 §9), so no provider may be contacted before the visitor
   asks for it. Until play is pressed we show a locally-hosted poster — zero
   third-party requests — and each card always carries an outbound link to the
   original publication as a no-embed fallback.

   Facebook has no privacy-friendly embed domain (YouTube has youtube-nocookie),
   and its plugin can fail for logged-out visitors, which is exactly why the
   "watch on …" link is permanent rather than a fallback shown on error.
   ────────────────────────────────────────────────────────────────────────── */

type Locale = 'ro' | 'en' | 'ru';

function embedSrc(item: MediaAppearance): string {
  if (item.embed.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${item.embed.videoId}?autoplay=1&rel=0`;
  }
  const href = encodeURIComponent(item.embed.permalink);
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true`;
}

export function MediaGallery({
  locale,
  items,
}: {
  locale: Locale;
  items: MediaAppearance[];
}) {
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const [playing, setPlaying] = useState<string | null>(null);

  const t = {
    play: ru ? 'Смотреть' : en ? 'Play' : 'Vezi materialul',
    watchOn: ru ? 'Открыть на' : en ? 'Watch on' : 'Vezi pe',
  };

  const providerName = (item: MediaAppearance) =>
    item.embed.provider === 'youtube' ? 'YouTube' : 'Facebook';

  return (
    <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-14">
      {items.map((item, i) => {
        const isPlaying = playing === item.id;
        const title = lc(item.title);

        return (
          <Reveal as="li" key={item.id} delay={i * 90} className={styles.card}>
            <div className={styles.well}>
              {isPlaying ? (
                <iframe
                  className={styles.frame}
                  src={embedSrc(item)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className={styles.poster}
                  aria-label={`${t.play} — ${title}`}
                  onClick={() => {
                    setPlaying(item.id);
                    track('media_play', {
                      media_id: item.id,
                      media_outlet: item.outlet,
                      media_provider: item.embed.provider,
                    });
                  }}
                >
                  <Image
                    src={item.thumb}
                    alt={title}
                    width={item.thumbW}
                    height={item.thumbH}
                    sizes="(max-width: 768px) 100vw, 46vw"
                    className={styles.posterImg}
                  />
                  <span className={styles.scrim} aria-hidden="true" />
                  <span className={`mono ${styles.chip} ${styles.chipOutlet}`} aria-hidden="true">
                    {item.outlet}
                  </span>
                  {item.duration && (
                    <span
                      className={`mono ${styles.chip} ${styles.chipDuration}`}
                      aria-hidden="true"
                    >
                      {item.duration}
                    </span>
                  )}
                  <span className={styles.play} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M8.5 6.2v11.6a.6.6 0 0 0 .92.5l9.02-5.8a.6.6 0 0 0 0-1l-9.02-5.8a.6.6 0 0 0-.92.5Z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6 md:p-7">
              <p className="mono text-[11px] uppercase tracking-[0.12em] text-sage-text">
                {item.show ? `${item.show} · ${item.outlet}` : item.outlet}
                {item.date && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <time dateTime={item.date.iso}>{lc(item.date.label)}</time>
                  </>
                )}
              </p>
              <h3 className="serif mt-3 text-[1.35rem] leading-snug tracking-[-0.01em] text-ink text-pretty">
                {title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                {lc(item.summary)}
              </p>

              <div className="mt-auto pt-6">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-b border-ink pb-0.5 text-sm text-ink transition-colors hover:border-sage hover:text-sage"
                >
                  {t.watchOn} {providerName(item)}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
