import Link from 'next/link';
import styles from './Services.module.css';

const SERVICES = [
  {
    n: '01',
    tag: 'Pediatrie',
    title: 'Consultație pediatrică',
    description:
      'Evaluare clinică completă pe video, anamneză detaliată, recomandări scrise pe care le primești în 24h. Pentru copii de la naștere până la adolescență — creștere, dezvoltare, profilaxie, întrebări la zi.',
    price: '600 lei',
    duration: '50 min · video',
  },
  {
    n: '02',
    tag: 'Nutriție',
    title: 'Consultație nutrițională',
    description:
      'Plan alimentar personalizat pentru copii sau adulți. Anamneză, analiza obiceiurilor existente, analize recente, obiective realiste. Include un follow-up programat la 4 săptămâni.',
    price: '700 lei',
    duration: '60 min · video',
  },
  {
    n: '03',
    tag: 'Integrativ',
    title: 'Consultație integrativă & monitorizare',
    description:
      'Pediatrie și nutriție într-o singură întâlnire — pentru cazuri complexe sau pentru începutul unei urmăriri pe termen lung. Plan scris, recomandări structurate, prima programare de follow-up inclusă.',
    price: '1.100 lei',
    duration: '90 min · video',
  },
  {
    n: '04',
    tag: 'Abonament',
    title: 'Monitorizare 3 luni',
    description:
      'Trei luni de urmărire activă: mesagerie directă pentru întrebări între consultații, ajustări periodice ale planului, două video-call-uri lunare. Recomandat pentru obiective de durată.',
    price: 'de la 2.400 lei',
    duration: '3 luni',
  },
  {
    n: '05',
    tag: 'Rapid',
    title: 'Întrebare rapidă',
    description:
      'Pentru întrebări punctuale care nu necesită o consultație completă. Trimiți întrebarea + context prin formular și primești un răspuns scris, documentat, în 48 de ore.',
    price: '180 lei',
    duration: '48h · scris',
  },
] as const;

export function Services() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Servicii · Cinci formate</div>
          <h2 className={styles.title}>
            Cum lucrăm
            <br />
            <span className={styles.titleAccent}>împreună.</span>
          </h2>
        </div>
        <p className={styles.headerSub}>
          Cinci moduri de a colabora — de la o întrebare punctuală la urmărire
          de trei luni. Alege ritmul potrivit pentru tine.
        </p>
      </div>

      {SERVICES.map(({ n, tag, title, description, price, duration }) => (
        <div key={n} className={styles.serviceRow}>
          <div className={styles.serviceNum}>{n}</div>
          <div>
            <div className={styles.serviceTag}>{tag}</div>
            <h3 className={styles.serviceTitle}>{title}</h3>
          </div>
          <p className={styles.serviceDesc}>{description}</p>
          <div className={styles.serviceMeta}>
            <div className={styles.servicePrice}>{price}</div>
            <div className={styles.serviceDuration}>{duration}</div>
            <Link href="/contact" className={styles.serviceLink}>
              Rezervă →
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}