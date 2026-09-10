/**
 * The parent reviews the client actually sent (`docs/testemonials.md`).
 *
 * ⚠️ This file is the only place reviews may come from. Two rounds of invented
 * testimonials have already reached this repo — three placeholder ones that sat
 * in the database until 2026-07-28, and a "Zlobin Alexandru / DoctorChat"
 * review in the frontend fallback that appears in no client material at all.
 * **Nothing goes in here that is not in a document from the client.**
 *
 * Handling rules:
 * · The wording is the reviewer's. Only spelling and spacing were normalised —
 *   never the meaning. (Review 1 is copied from a message with several typos.)
 * · Each review was written in ONE language; the other two are faithful
 *   translations. Review 1 was written in Russian, review 2 in Romanian.
 * · An unsigned review keeps `author: null`. The site renders a neutral,
 *   localized label for it — it never gets a name that was not given.
 * · `roleRo/En/Ru` is context we can support from the review's own text, and is
 *   left null when there is none to draw on.
 */

export interface SeedTestimonial {
  quoteRo: string;
  quoteEn: string;
  quoteRu: string;
  author: string | null;
  roleRo: string | null;
  roleEn: string | null;
  roleRu: string | null;
  source: string | null;
}

export const TESTIMONIALS: SeedTestimonial[] = [
  {
    // Written in Russian, unsigned.
    quoteRo:
      'Mulțumesc mult doamnei doctor pentru tratamentul competent și de calitate al copilului. Ne-am adresat sâmbătă, cu o tuse foarte puternică. Doctorul a fost foarte atent cu copilul și, după toate analizele, i-a explicat mamei pe înțeles schema de tratament. Acasă am urmat totul întocmai — deja în a treia zi tusea a început să cedeze (pneumonie pe dreapta). În a cincea zi copilul se simțea mult mai bine. Vă mulțumesc enorm pentru ajutor și pentru că la Chișinău am întâlnit un medic la fel de bun ca în Ucraina (Nikolaev). Pentru că atunci când copilul e bolnav e mereu panică, mai ales într-o altă țară.',
    quoteEn:
      'Thank you so much for the competent, high-quality care of our child. We came in on a Saturday with a very bad cough. The doctor was extremely attentive with the child and, after all the tests, explained the treatment plan to the mother in plain language. At home we followed it exactly — by the third day the cough began to ease (right-sided pneumonia). By the fifth day the child felt much better. Thank you enormously for your help, and for the fact that in Chișinău I met a doctor as good as the one back in Ukraine (Mykolaiv). Because when your child is ill there is always panic — especially in another country.',
    quoteRu:
      'Спасибо большое доктору за грамотное, квалифицированное и качественное лечение ребёнка. Обратились в субботу с очень сильным кашлем. Доктор был очень внимателен к ребёнку и после всех анализов доступно объяснил маме курс лечения. Дома всё делали по назначению врача — уже на третий день лечения кашель начал уходить (правосторонняя пневмония). На пятый день ребёнок чувствовал себя намного лучше. Спасибо вам огромное за помощь и за то, что в Кишинёве мне встретился такой же грамотный врач, как и в Украине (Николаев). Потому что, когда болеет ребёнок, всегда паника — особенно в другой стране.',
    author: null,
    roleRo: 'copil tratat de pneumonie',
    roleEn: 'child treated for pneumonia',
    roleRu: 'ребёнок лечился от пневмонии',
    source: null,
  },
  {
    // Written in Romanian, signed.
    quoteRo:
      'Mulțumesc că mi-ați calmat fricile și mi-ați sugerat soluțiile potrivite situației noastre! 🙏🌸',
    quoteEn:
      'Thank you for calming my fears and suggesting the right solutions for our situation! 🙏🌸',
    quoteRu:
      'Спасибо, что успокоили мои страхи и подсказали решения, подходящие нашей ситуации! 🙏🌸',
    author: 'Cociu Felicia',
    roleRo: null,
    roleEn: null,
    roleRu: null,
    source: null,
  },
];
