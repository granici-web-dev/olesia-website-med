/**
 * Placeholder blog content — for design review only, until real posts come from
 * the API (back office, later). Shared by the blog listing AND the article page
 * so a placeholder link always opens a real, readable article instead of 404ing.
 * Each body is short, general, non-diagnostic guidance in the brand's calm voice;
 * ⚠ replace with the doctor's reviewed content before launch.
 */

export type Bi = { ro: string; en: string; ru: string };

export interface PlaceholderCategory {
  key: string;
  ro: string;
  en: string;
  ru: string;
}

/* Categories = SEO clusters (⚠ confirm the final list). */
export const PLACEHOLDER_CATEGORIES: PlaceholderCategory[] = [
  { key: 'nutritie', ro: 'Nutriție', en: 'Nutrition', ru: 'Питание' },
  { key: 'sanatatea-copilului', ro: 'Sănătatea copilului', en: 'Child health', ru: 'Здоровье ребёнка' },
  { key: 'alimentatia-sugarului', ro: 'Alimentația sugarului', en: 'Infant feeding', ru: 'Питание грудного ребёнка' },
  { key: 'frecvent-bolnav', ro: 'Copilul frecvent bolnav', en: 'The frequently ill child', ru: 'Часто болеющий ребёнок' },
  { key: 'dezvoltare', ro: 'Dezvoltare', en: 'Development', ru: 'Развитие' },
  { key: 'alergii', ro: 'Alergii', en: 'Allergies', ru: 'Аллергии' },
];

export interface PlaceholderPost {
  slug: string;
  category: string;
  title: Bi;
  excerpt: Bi;
  /** Markdown body, rendered on the article page. */
  body: Bi;
  /** ISO date — fixed, since these are placeholders. */
  date: string;
  minutes: number;
}

const DISCLAIMER: Bi = {
  ro: '\n\n> Acest articol are caracter general și nu înlocuiește o consultație. Pentru situația copilului tău, programează o consultație.',
  en: '\n\n> This article is general information and doesn’t replace a consultation. For your child’s situation, book a consultation.',
  ru: '\n\n> Эта статья носит общий характер и не заменяет консультацию. Если вопрос касается вашего ребёнка — запишитесь на приём.',
};

export const PLACEHOLDER_POSTS: PlaceholderPost[] = [
  {
    slug: 'diversificarea-cand-si-cum',
    category: 'alimentatia-sugarului',
    title: { ro: 'Diversificarea: când și cum începi', en: 'Starting solids: when and how', ru: 'Прикорм: когда и как начинать' },
    excerpt: {
      ro: 'Semnele că bebelușul e pregătit și primii pași, în siguranță.',
      en: 'The signs your baby is ready, and the first steps — safely.',
      ru: 'Признаки готовности малыша и первые шаги — безопасно.',
    },
    body: {
      ro: 'Diversificarea începe de obicei în jurul vârstei de 6 luni, dar momentul potrivit ține mai mult de copil decât de calendar. Caută semnele de pregătire: stă în șezut cu sprijin minim, își ține bine capul, arată interes pentru mâncare și nu mai împinge automat lingurița cu limba.\n\nPrimele mese sunt despre explorare, nu despre cantitate — laptele rămâne principala sursă de nutriție în primele luni de diversificare. Începe cu porții mici, un aliment nou o dată, și urmărește reacțiile. Oferă texturi potrivite vârstei și mănâncă împreună cu cel mic: copiii învață privind.',
      en: 'Solids usually start around 6 months, but the right moment depends on the child more than the calendar. Look for readiness signs: sitting with little support, good head control, interest in food, and no longer automatically pushing the spoon out with the tongue.\n\nThe first meals are about exploring, not amounts — milk stays the main source of nutrition through the early months of weaning. Start with small portions, one new food at a time, and watch how your baby responds. Offer age-appropriate textures and eat together: children learn by watching.',
      ru: 'Прикорм обычно начинают около 6 месяцев, но подходящий момент зависит больше от самого ребёнка, чем от календаря. Обращайте внимание на признаки готовности: малыш сидит с минимальной поддержкой, хорошо держит голову, проявляет интерес к еде и больше не выталкивает ложку языком автоматически.\n\nПервые приёмы пищи — это про знакомство, а не про объём: в первые месяцы прикорма молоко остаётся основным источником питания. Начинайте с маленьких порций, по одному новому продукту за раз, и наблюдайте за реакциями. Предлагайте текстуры, подходящие возрасту, и ешьте вместе с малышом: дети учатся, наблюдая.',
    },
    date: '2026-06-02',
    minutes: 7,
  },
  {
    slug: 'copilul-frecvent-bolnav',
    category: 'frecvent-bolnav',
    title: { ro: 'Copilul frecvent bolnav: ce e normal', en: 'The frequently ill child: what’s normal', ru: 'Часто болеющий ребёнок: что считается нормой' },
    excerpt: {
      ro: 'Câte răceli pe an sunt normale și când să te îngrijorezi.',
      en: 'How many colds a year are normal, and when to worry.',
      ru: 'Сколько простуд в год — это норма и когда стоит насторожиться.',
    },
    body: {
      ro: 'În primii ani, mai ales după intrarea în colectivitate, 6–8 răceli pe an sunt în limite normale. Sistemul imunitar al copilului se antrenează la fiecare contact cu un virus nou, iar majoritatea infecțiilor sunt ușoare și trec de la sine.\n\nSemnele care merită atenție nu sunt numărul de răceli, ci felul lor: febră înaltă care persistă, dificultăți de respirație, refuzul lichidelor, somnolență neobișnuită sau o stare generală care nu revine între episoade. Acestea sunt momentele în care o evaluare medicală e binevenită.',
      en: 'In the early years — especially after starting daycare — 6–8 colds a year is within the normal range. A child’s immune system trains itself with every new virus, and most infections are mild and clear on their own.\n\nWhat deserves attention isn’t the number of colds but their character: high fever that persists, trouble breathing, refusing fluids, unusual drowsiness, or a child who doesn’t bounce back between episodes. Those are the moments when a medical assessment is worthwhile.',
      ru: 'В первые годы жизни, особенно когда ребёнок начинает ходить в детский сад, 6–8 простуд в год — это в пределах нормы. Иммунитет тренируется при каждой встрече с новым вирусом, и большинство инфекций протекают легко и проходят сами.\n\nВнимания заслуживает не число простуд, а то, как они проходят: высокая температура, которая держится долго, затруднённое дыхание, отказ от питья, необычная сонливость или вялость, которая не проходит между болезнями. Вот в такие моменты стоит показать ребёнка врачу.',
    },
    date: '2026-05-24',
    minutes: 6,
  },
  {
    slug: 'alergiile-alimentare-la-copii',
    category: 'alergii',
    title: { ro: 'Alergiile alimentare la copii', en: 'Food allergies in children', ru: 'Пищевая аллергия у детей' },
    excerpt: {
      ro: 'Cum recunoști o reacție și ce faci în primele momente.',
      en: 'How to recognize a reaction and what to do first.',
      ru: 'Как распознать реакцию и что делать в первые минуты.',
    },
    body: {
      ro: 'O reacție alergică apare de obicei rapid după masă: erupții pe piele, umflarea buzelor sau a pleoapelor, vărsături sau disconfort digestiv. Cele mai frecvente alimente implicate sunt laptele, ouăle, arahidele, nucile, peștele și grâul.\n\nLa primele semne ușoare, oprește alimentul și notează ce și când s-a întâmplat — informația ajută enorm la diagnostic. Dacă apar dificultăți de respirație, umflarea feței sau o stare de rău bruscă, este o urgență: sună imediat la 112.',
      en: 'An allergic reaction usually appears soon after eating: skin rashes, swelling of the lips or eyelids, vomiting, or digestive discomfort. The most common culprits are milk, eggs, peanuts, tree nuts, fish, and wheat.\n\nAt the first mild signs, stop the food and note what happened and when — that information is invaluable for diagnosis. If there’s trouble breathing, facial swelling, or a sudden severe reaction, it’s an emergency: call 112 right away.',
      ru: 'Аллергическая реакция обычно появляется вскоре после еды: высыпания на коже, отёк губ или век, рвота или боль в животе. Чаще всего её вызывают молоко, яйца, арахис, орехи, рыба и пшеница.\n\nПри первых лёгких признаках уберите продукт и запишите, что и когда случилось — это очень поможет врачу с диагнозом. Если появились затруднённое дыхание, отёк лица или резкое ухудшение — это неотложная ситуация: сразу звоните 112.',
    },
    date: '2026-05-15',
    minutes: 8,
  },
  {
    slug: 'cum-sustii-imunitatea',
    category: 'sanatatea-copilului',
    title: { ro: 'Cum susții imunitatea copilului', en: 'Supporting your child’s immunity', ru: 'Как поддержать иммунитет ребёнка' },
    excerpt: {
      ro: 'Ce ajută cu adevărat și ce sunt doar mituri.',
      en: 'What actually helps — and what’s just a myth.',
      ru: 'Что действительно помогает, а что — лишь мифы.',
    },
    body: {
      ro: 'Imunitatea nu se „crește” cu un singur produs minune. Ce contează cu adevărat sunt bazele: somn suficient, o alimentație variată cu legume, fructe și proteine, mișcare, timp afară și vaccinările la zi.\n\nSuplimentele au rost doar în anumite situații, confirmate de un medic — de exemplu vitamina D la sugari. Restul „imunostimulatoarelor” promovate agresiv au rareori dovezi solide. Cel mai bun sprijin pentru imunitate este un stil de viață echilibrat, nu un raft de flacoane.',
      en: 'Immunity isn’t “boosted” by a single miracle product. What truly matters are the basics: enough sleep, a varied diet with vegetables, fruit, and protein, movement, time outdoors, and up-to-date vaccinations.\n\nSupplements only make sense in specific situations confirmed by a doctor — vitamin D in infants, for example. Most aggressively marketed “immune boosters” rarely have solid evidence. The best support for immunity is a balanced lifestyle, not a shelf of bottles.',
      ru: 'Иммунитет нельзя «поднять» одним чудо-средством. По-настоящему важны основы: достаточный сон, разнообразное питание с овощами, фруктами и белком, движение, прогулки и прививки по графику.\n\nДобавки нужны лишь в отдельных случаях и только по назначению врача — например, витамин D грудным детям. А за громкой рекламой «иммуностимуляторов» редко стоят серьёзные доказательства. Лучшая поддержка иммунитету — спокойный, размеренный образ жизни, а не полка с флаконами.',
    },
    date: '2026-05-06',
    minutes: 5,
  },
  {
    slug: 'mofturos-la-masa',
    category: 'nutritie',
    title: { ro: 'Mofturos la masă: strategii blânde', en: 'Picky at the table: gentle strategies', ru: 'Привередливость за столом: мягкие стратегии' },
    excerpt: {
      ro: 'Cum aduci varietate fără presiune și fără bătălii.',
      en: 'Bringing variety without pressure or battles.',
      ru: 'Как добавить разнообразие без давления и без сражений.',
    },
    body: {
      ro: 'Selectivitatea la masă este o etapă normală, mai ales între 1 și 3 ani. Presiunea — „mai o lingură”, recompense sau negocieri — de obicei întărește refuzul. Rolul tău este să oferi mâncare bună și constantă; rolul copilului este să decidă cât mănâncă.\n\nOferă același aliment de mai multe ori, în forme diferite, fără să faci din asta un eveniment. Mâncați împreună, lăsați copilul să exploreze cu mâinile și păstrați mesele relaxate. Varietatea vine cu timpul și cu expunerea repetată, nu cu bătălia.',
      en: 'Picky eating is a normal stage, especially between ages 1 and 3. Pressure — “one more bite,” rewards, or negotiations — usually reinforces the refusal. Your job is to offer good food consistently; the child’s job is to decide how much to eat.\n\nOffer the same food many times, in different forms, without making it an event. Eat together, let your child explore with their hands, and keep meals relaxed. Variety comes with time and repeated exposure, not with a battle.',
      ru: 'Избирательность в еде — это нормальный этап, особенно в возрасте от 1 до 3 лет. Давление — «ещё одну ложечку», награды или уговоры — обычно лишь усиливает отказ. Ваша задача — стабильно предлагать хорошую еду; задача ребёнка — решать, сколько съесть.\n\nПредлагайте один и тот же продукт много раз, в разном виде, не превращая это в событие. Ешьте вместе, позволяйте ребёнку исследовать еду руками и сохраняйте за столом спокойную атмосферу. Разнообразие приходит со временем и многократным знакомством, а не через борьбу.',
    },
    date: '2026-04-28',
    minutes: 6,
  },
  {
    slug: 'repere-de-dezvoltare',
    category: 'dezvoltare',
    title: { ro: 'Repere de dezvoltare pe etape', en: 'Developmental milestones by stage', ru: 'Этапы развития ребёнка' },
    excerpt: {
      ro: 'La ce să te uiți, de la naștere la vârsta preșcolară.',
      en: 'What to look for, from birth to preschool age.',
      ru: 'На что обращать внимание — от рождения до дошкольного возраста.',
    },
    body: {
      ro: 'Reperele de dezvoltare sunt jaloane orientative, nu un test pe care copilul trebuie să-l treacă la o dată fixă. Fiecare copil are propriul ritm, iar intervalele normale sunt largi: unii merg la 10 luni, alții la 15, și ambele variante sunt în regulă.\n\nUrmărește direcția, nu doar momentul: copilul câștigă treptat abilități noi — zâmbet social, statul în șezut, primele cuvinte, mersul. Dacă observi o stagnare, o pierdere a unor abilități deja câștigate sau ai pur și simplu o îngrijorare, merită discutat la o consultație.',
      en: 'Developmental milestones are guideposts, not a test a child must pass on a fixed date. Every child has their own pace, and the normal ranges are wide: some walk at 10 months, others at 15, and both are fine.\n\nWatch the direction, not just the timing: a child gradually gains new skills — social smile, sitting, first words, walking. If you notice a plateau, a loss of skills already gained, or you simply have a concern, it’s worth discussing at a consultation.',
      ru: 'Этапы развития — это ориентиры, а не экзамен, который нужно сдать строго к сроку. У каждого ребёнка свой темп, и нормальные рамки широки: одни начинают ходить в 10 месяцев, другие в 15 — и то и другое нормально.\n\nСмотрите на направление, а не только на сроки: ребёнок шаг за шагом осваивает новое — улыбку в ответ, умение сидеть, первые слова, ходьбу. Если развитие словно остановилось, ребёнок теряет то, что уже умел, или вас просто что-то тревожит — это стоит обсудить на консультации.',
    },
    date: '2026-04-19',
    minutes: 7,
  },
].map((p) => ({ ...p, body: { ro: p.body.ro + DISCLAIMER.ro, en: p.body.en + DISCLAIMER.en, ru: p.body.ru + DISCLAIMER.ru } }));

export function findPlaceholderPost(slug: string): PlaceholderPost | undefined {
  return PLACEHOLDER_POSTS.find((p) => p.slug === slug);
}

export function placeholderCategoryLabel(key: string, locale: string): string {
  const c = PLACEHOLDER_CATEGORIES.find((x) => x.key === key);
  return c ? (locale === 'ru' ? c.ru : locale === 'en' ? c.en : c.ro) : key;
}
