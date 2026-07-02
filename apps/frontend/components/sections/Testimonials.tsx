import type { AboutTestimonial } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';

/** Testimonial with optional RU copy (fallback items are trilingual; API items are RO/EN only). */
type Testimonial = AboutTestimonial & { quoteRu?: string; roleRu?: string };

/**
 * PLACEHOLDER parent reviews — shown when the back office has no testimonials yet.
 * Realistic filler; the client will replace these with real reviews (via back office
 * once the API is live, or by editing this array). Kept trilingual RO/EN/RU inline,
 * matching the site's inline-copy convention.
 */
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    quoteRo:
      'Consultația a fost calmă și fără grabă. Am plecat cu un plan clar pentru alimentația fetiței și, în sfârșit, fără anxietatea de dinainte.',
    quoteEn:
      'The consultation was calm and unhurried. We left with a clear plan for our daughter’s nutrition and, finally, without the anxiety we came in with.',
    quoteRu:
      'Консультация прошла спокойно и без спешки. Мы ушли с чётким планом питания для дочки и, наконец, без прежней тревоги.',
    author: 'Maria P.',
    roleRo: 'mamă a unei fetițe de 3 ani',
    roleEn: 'mother of a 3-year-old',
    roleRu: 'мама трёхлетней дочки',
  },
  {
    quoteRo:
      'Cu doi gemeni, aveam mereu întrebări. Doamna doctor răspunde la fiecare mesaj cu răbdare și explică pe înțelesul nostru.',
    quoteEn:
      'With twins, we always had questions. The doctor answers every message patiently and explains everything in plain language.',
    quoteRu:
      'С двойней вопросов всегда было много. Доктор терпеливо отвечает на каждое сообщение и объясняет понятным языком.',
    author: 'Andrei & Elena',
    roleRo: 'părinți de gemeni',
    roleEn: 'parents of twins',
    roleRu: 'родители двойни',
  },
  {
    quoteRo:
      'Prima lună cu bebelușul e grea. Sprijinul la alăptare și monitorizarea greutății ne-au dat încredere zi de zi.',
    quoteEn:
      'The first month with a newborn is hard. The breastfeeding support and weight monitoring gave us confidence day by day.',
    quoteRu:
      'Первый месяц с малышом даётся тяжело. Поддержка в грудном вскармливании и контроль веса возвращали уверенность день за днём.',
    author: 'Cristina M.',
    roleRo: 'mamă a unui nou-născut',
    roleEn: 'mother of a newborn',
    roleRu: 'мама новорождённого',
  },
  {
    quoteRo:
      'Abordarea integrativă ne-a ajutat să înțelegem cauza, nu doar simptomele. Recomandările au fost practice și realiste.',
    quoteEn:
      'The integrative approach helped us understand the cause, not just the symptoms. The recommendations were practical and realistic.',
    quoteRu:
      'Интегративный подход помог понять причину, а не только симптомы. Рекомендации были практичными и выполнимыми.',
    author: 'Victor D.',
    roleRo: 'tată',
    roleEn: 'father',
    roleRu: 'папа',
  },
  {
    quoteRo:
      'Copilul meu mânca extrem de selectiv. Cu pași mici din meniul personalizat, mesele au devenit în sfârșit liniștite.',
    quoteEn:
      'My child was an extremely picky eater. With the small steps in the personalized menu, mealtimes finally became calm.',
    quoteRu:
      'Мой ребёнок ел очень избирательно. Благодаря маленьким шагам из персонального меню приёмы пищи наконец стали спокойными.',
    author: 'Ana T.',
    roleRo: 'mamă a unui băiețel de 5 ani',
    roleEn: 'mother of a 5-year-old',
    roleRu: 'мама пятилетнего сына',
  },
  {
    quoteRo:
      'Ne-a plăcut că totul e clar și fără presiune. Am simțit că suntem ascultați și că deciziile le luăm împreună.',
    quoteEn:
      'We loved that everything was clear and pressure-free. We felt heard and that we were making decisions together.',
    quoteRu:
      'Понравилось, что всё ясно и без давления. Мы чувствовали, что нас слышат и решения принимаем вместе.',
    author: 'Diana & Sergiu',
    roleRo: 'părinți',
    roleEn: 'parents',
    roleRu: 'родители',
  },
];

/** Parent reviews. Editable from the back office; falls back to placeholders when empty. */
export function Testimonials({
  locale,
  items,
}: {
  locale: string;
  items: AboutTestimonial[];
}) {
  const t = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;

  const list: Testimonial[] = items.length > 0 ? items : FALLBACK_TESTIMONIALS;
  if (list.length === 0) return null;

  return (
    <section className="shell bg-[var(--cream-2)] border-y border-[var(--rule)] py-16 md:py-24">
      <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
        {t('Ce spun părinții', 'What parents say', 'Что говорят родители')}
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((it, i) => (
          <Reveal key={i} as="figure" className="flex flex-col" delay={(i % 3) * 70}>
            <blockquote className="serif-it text-[1.3rem] leading-snug text-ink text-pretty">
              “{t(it.quoteRo, it.quoteEn, it.quoteRu ?? it.quoteRo)}”
            </blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-semibold text-ink">{it.author}</span>
              {(it.roleRo || it.roleEn) && (
                <span className="text-ink-soft">
                  {' '}
                  — {t(it.roleRo, it.roleEn, it.roleRu ?? it.roleRo)}
                </span>
              )}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
