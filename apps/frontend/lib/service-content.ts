/**
 * Shared per-service marketing copy (descriptions + "what's included"), keyed
 * by service `code`. Single source of truth so the wording stays identical on
 * the homepage Services section, the /services page, and the /pricing page.
 * (→ move into the content API / back office later.)
 */

export interface BiList {
  ro: string[];
  en: string[];
}
export interface Bi {
  ro: string;
  en: string;
}

/** Price (large) + duration/qualifier (small) per service, mirroring the
 *  homepage Services section so /pricing renders them the same way. */
export const SERVICE_PRICE_META: Record<string, { price: Bi; duration: Bi }> = {
  pediatric: {
    price: { ro: '600 lei', en: '600 lei' },
    duration: { ro: '50 min · video', en: '50 min · video' },
  },
  nutrition: {
    price: { ro: '700 lei', en: '700 lei' },
    duration: { ro: '60 min · video', en: '60 min · video' },
  },
  integrative: {
    price: { ro: '1.100 lei', en: '1,100 lei' },
    duration: { ro: '90 min · video', en: '90 min · video' },
  },
  monitoring: {
    price: { ro: 'de la 2.400 lei', en: 'from 2,400 lei' },
    duration: { ro: '3 luni', en: '3 months' },
  },
  quick_question: {
    price: { ro: '180 lei', en: '180 lei' },
    duration: { ro: '48h · scris', en: '48h · written' },
  },
};

export const SERVICE_DESCRIPTIONS: Record<string, Bi> = {
  pediatric: {
    ro: 'O consultație video dedicată sănătății copilului — simptome, creștere, dezvoltare sau o a doua opinie.',
    en: "A focused video visit for your child's health — symptoms, growth, development, or a second opinion.",
  },
  nutrition: {
    ro: 'O analiză personalizată a alimentației, pe bază de dovezi — pentru copii sau adulți.',
    en: 'A personalized, evidence-based look at feeding and nutrition — for children or adults.',
  },
  integrative: {
    ro: 'O consultație amănunțită care îmbină pediatria și nutriția, cu un plan de urmat în timp.',
    en: 'An in-depth visit that combines pediatric and nutrition expertise, with a plan to follow over time.',
  },
  monitoring: {
    ro: 'Acompaniere continuă timp de trei luni — urmăresc progresul între consultații.',
    en: 'Continuous guidance over three months — I follow your progress between consultations.',
  },
  quick_question: {
    ro: 'Ai o singură întrebare? Primești un răspuns scris de la medic în 48 de ore.',
    en: 'Have one question? Get a written answer from the doctor within 48 hours.',
  },
};

export const SERVICE_INCLUDED: Record<string, BiList> = {
  pediatric: {
    ro: [
      'Apel video de 50 de minute',
      'Analiza simptomelor, a istoricului și a documentelor trimise',
      'Evaluare clară și pașii următori',
      'Plan scris cu recomandări, în 24 de ore',
    ],
    en: [
      '50-minute video call',
      'Review of symptoms, history, and any documents you share',
      'A clear assessment and next steps',
      'Written summary with recommendations within 24 hours',
    ],
  },
  nutrition: {
    ro: [
      'Apel video de 60 de minute',
      'Analiza obiceiurilor alimentare actuale',
      'Un plan alimentar personalizat',
      'Recomandări scrise după consultație',
    ],
    en: [
      '60-minute video call',
      'Analysis of current eating and feeding patterns',
      'A personalized nutrition plan',
      'Written recommendations after the call',
    ],
  },
  integrative: {
    ro: [
      'Apel video amănunțit de 90 de minute',
      'Evaluare pediatrică și nutrițională combinată',
      'Un plan de acțiune personalizat',
      'Prima urmărire / monitorizare inclusă',
    ],
    en: [
      '90-minute in-depth video call',
      'Combined pediatric and nutrition assessment',
      'A tailored action plan',
      'Initial follow-up / monitoring included',
    ],
  },
  monitoring: {
    ro: [
      'Monitorizarea cazului timp de 3 luni',
      'Verificări periodice',
      'Ajustarea planului pe parcurs',
      'Mesagerie prioritară cu medicul',
    ],
    en: [
      'Case monitoring for 3 months',
      'Periodic check-ins',
      'Plan adjustments as things change',
      'Priority messaging with the doctor',
    ],
  },
  quick_question: {
    ro: [
      'Trimiți întrebarea (cu poze sau documente, dacă e cazul)',
      'Răspuns scris în 48 de ore',
      'O rundă de clarificări',
    ],
    en: [
      'Submit your question (with photos or documents if needed)',
      'A written reply within 48 hours',
      'One round of clarification',
    ],
  },
};
