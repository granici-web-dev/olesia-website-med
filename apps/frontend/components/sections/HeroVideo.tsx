'use client';

import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from './Hero.module.css';

/* Client-controlled hero video (client-provided intro). The sources arrive as
   props: the server component resolves them from the `site-media` module, so
   the client can swap any locale's cut, or the poster, from the back office.
   No autoplay — the
   visitor starts it themselves, with sound. A poster covers the load; a
   play/pause control overlays the frame (prominent when paused, on-hover while
   playing). Lives in the old photo slot (.photoFrame).

   Subtitles are BURNED INTO the picture, one encode per locale — the client's
   call (answers v2 §7: keep the Romanian audio, subtitle the rest). Burned-in
   beats a <track>: it survives muted/scrubbed playback and every mobile
   browser's native player, and it needs no controls of its own.
   They are ANIMATED (each phrase fades and rises in, then fades out), rendered
   with Remotion from `docs/olesea jalba.mp4` + a whisper transcript. Phrase-level
   rather than word-level on purpose: whisper times the Romanian audio, so
   per-word highlighting on the EN/RU translations would be invented timing.
   See `docs/brief-changes-2026-06-24.md` §11.7 for the pipeline and the
   Remotion licensing caveat.
   ⚠ The cues are placed to clear the hero's crop (`object-fit: cover;
   object-position: center 22%` in a 4/5 frame shows only y≈104…1229 of 1600).
   Re-cutting the video or changing that CSS means re-checking the placement. */
export function HeroVideo({
  sources,
  poster,
}: {
  /** One encode per locale, keyed by locale code. */
  sources: Record<string, string>;
  poster: string;
}) {
  const locale = useLocale();
  const en = locale === 'en';
  const ru = locale === 'ru';
  const src = sources[locale] ?? sources.ro;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const label = playing
    ? ru
      ? 'Пауза'
      : en
        ? 'Pause'
        : 'Pauză'
    : ru
      ? 'Смотреть видео'
      : en
        ? 'Play video'
        : 'Redă videoclipul';

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        playsInline
        /* `none`, not `metadata`: the poster is already a separate image, so
           the only thing `metadata` bought was a range request into an 8 MB
           file on every home-page load, for a video most visitors never play
           (audit A7, F24). The browser fetches it when the play button is
           pressed. */
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className={`${styles.videoBtn} ${playing ? styles.videoBtnPlaying : ''}`}
        onClick={toggle}
        aria-label={label}
      >
        {playing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
    </>
  );
}
