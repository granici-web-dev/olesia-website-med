'use client';

import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from './Hero.module.css';

/* Client-controlled hero video (client-provided intro). No autoplay — the
   visitor starts it themselves, with sound. A poster covers the load; a
   play/pause control overlays the frame (prominent when paused, on-hover while
   playing). Lives in the old photo slot (.photoFrame). */
export function HeroVideo() {
  const locale = useLocale();
  const en = locale === 'en';
  const ru = locale === 'ru';
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
        poster="/assets/olesea-hero-poster.jpg"
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      >
        <source src="/assets/olesea-hero-sound.mp4" type="video/mp4" />
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
