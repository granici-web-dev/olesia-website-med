import Link from 'next/link';
import styles from './About.module.css';

const DETAILS = [
  {
    label: 'Studii',
    body: 'USMF "N. Testemițanu"\nRezidențiat pediatrie\nFormare nutriție clinică',
  },
  {
    label: 'Specializări',
    body: 'Nutriție pediatrică\nAlimentația sugarului\nDiversificare BLW',
  },
] as const;

export function About() {
  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>Despre</div>
        <h3 className={styles.title}>
          Două specializări,
          <br />
          <span className={styles.titleAccent}>un singur scop</span>
        </h3>
      </div>

      <div>
        <p className={styles.body}>
          Sunt medic pediatru și nutriționist. Cele două roluri se completează
          firesc: înțeleg corpul copilului în mișcare, dar și ce îl construiește
          la masă. Lucrez exclusiv online, pentru ca distanța să nu mai fie o
          problemă — familii din toată țara și din diasporă.
        </p>

        <div className={styles.details}>
          {DETAILS.map(({ label, body }) => (
            <div key={label}>
              <div className={styles.detailLabel}>{label}</div>
              <div className={styles.detailBody}>{body}</div>
            </div>
          ))}
        </div>

        <Link href="/about" className={styles.link}>
          Citește biografia completă →
        </Link>
      </div>
    </section>
  );
}