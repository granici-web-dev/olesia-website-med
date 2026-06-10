import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

const SERVICES_LINKS = [
  'Consultație pediatrică',
  'Consultație nutrițională',
  'Integrativă',
  'Abonament',
  'Întrebare rapidă',
];

const RESOURCES_LINKS = ['Articole', 'Ghiduri descărcabile', 'Meniuri săptămânale', 'FAQ'];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Image
            src="/assets/logo-long.png"
            alt="Dr. Olesea Jalba — pediatru & nutriționist"
            width={380}
            height={96}
            className={styles.logo}
          />
          <p className={styles.tagline}>
            Cabinet online de pediatrie și nutriție. Consultații prin
            video-call, plan scris la final, urmărire pe termen lung.
          </p>
          <Link href="/contact" className={styles.bookBtn}>
            Programează →
          </Link>
        </div>

        <div>
          <div className={styles.colLabel}>Servicii</div>
          <div className={styles.colLinks}>
            {SERVICES_LINKS.map((label) => (
              <Link key={label} href="/services">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.colLabel}>Resurse</div>
          <div className={styles.colLinks}>
            {RESOURCES_LINKS.map((label) => (
              <Link key={label} href="/articles">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.colLabel}>Contact</div>
          <div className={styles.colLinks}>
            <a href="mailto:contact@oleseajalba.md">contact@oleseajalba.md</a>
            <a href="tel:+37379000000">+373 79 000 000</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© Olesea Jalba · 2026</span>
        <span>RO · EN</span>
        <span>GDPR · Termeni</span>
      </div>
    </footer>
  );
}