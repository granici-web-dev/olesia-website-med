import Link from 'next/link';
import styles from './HowItWorks.module.css';

const STEPS = [
  {
    n: 'I',
    title: 'Programare',
    description:
      'Alegi un slot din calendar și completezi un scurt formular cu motivul vizitei.',
  },
  {
    n: 'II',
    title: 'Pregătire',
    description:
      'Cu 24h înainte primești instrucțiuni și o listă de informații utile (analize, jurnal alimentar etc.).',
  },
  {
    n: 'III',
    title: 'Consultația',
    description:
      'Ne întâlnim pe video. Lungimea variază între 50–90 min, în funcție de tipul de consultație.',
  },
  {
    n: 'IV',
    title: 'Plan scris',
    description:
      'În 24h primești un document cu recomandări, plan alimentar (dacă e cazul) și pașii următori.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Cum funcționează</div>
          <h2 className={styles.title}>
            Patru pași<span className={styles.titleAccent}>.</span>
            <br />
            <span className={styles.titleAccent}>Niciun drum.</span>
          </h2>
        </div>
        <p className={styles.subtitle}>
          De la programare până la planul scris, totul se întâmplă într-un
          singur loc — în ritmul tău.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.connector} aria-hidden="true" />
        {STEPS.map(({ n, title, description }) => (
          <div key={n} className={styles.step}>
            <div className={styles.stepNumber}>{n}</div>
            <h3 className={styles.stepTitle}>{title}</h3>
            <p className={styles.stepDesc}>{description}</p>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerNote}>
          Platforma video, formularul și planul scris — toate gestionate
          într-un singur portal.
        </p>
        <Link href="/contact" className={styles.btn}>
          Vezi calendarul →
        </Link>
      </div>
    </section>
  );
}