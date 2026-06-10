import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

const STATS = [
  { value: '12+', label: 'Ani practică clinică' },
  { value: '2', label: 'Specializări · Pediatrie & Nutriție' },
  { value: '1.400+', label: 'Familii consultate' },
] as const;

export function Hero() {
  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          Consultații exclusiv online · Pediatrie & Nutriție
        </div>

        <h1 className={styles.headline}>
          Consultații
          <br />
          <span className={styles.headlineAccent}>video</span>, plan
          <br />
          scris, urmărire.
        </h1>

        <p className={styles.sub}>
          Pediatrie și nutriție de calitate, fără să ieși din casă. Toate
          consultațiile se desfășoară online, iar planul scris ajunge la tine în
          24 de ore.
        </p>

        <div className={styles.actions}>
          <Link href="/contact" className={styles.btnDark}>
            Programează consultație →
          </Link>
          <a href="#how-it-works" className={styles.btnOutline}>
            Cum funcționează
          </a>
        </div>

        <div className={styles.stats}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className={styles.statNumber}>{value}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.photoWrapper}>
        <div className={styles.photoFrame}>
          <Image
            src="/assets/olesea-hero.png"
            alt="Dr. Olesea Jalba"
            fill
            className={styles.photo}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className={styles.photoCaption}>
          <span>Dr. Olesea Jalba</span>
          <span>Online · Oriunde</span>
        </div>
      </div>
    </section>
  );
}