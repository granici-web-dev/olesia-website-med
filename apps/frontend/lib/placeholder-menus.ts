/**
 * Placeholder weekly-menu content — for design review only, until real menus
 * come from the back office. Shared by the menus listing AND the menu detail
 * page so a menu link always opens a real page instead of 404ing. These are
 * inspiration-only meal ideas (no grams, calories or portions). ⚠ replace with
 * the doctor's reviewed menus before launch. Slugs mirror the listing.
 */

export type Bi = { ro: string; en: string };

export interface MenuSegmentDef {
  key: string;
  ro: string;
  en: string;
}

export const MENU_SEGMENTS: MenuSegmentDef[] = [
  { key: 'copii-mici', ro: 'Copii mici', en: 'Toddlers' },
  { key: 'copii', ro: 'Copii', en: 'Children' },
  { key: 'familie', ro: 'Familie / adulți', en: 'Family / adults' },
];

const DAYS: Bi[] = [
  { ro: 'Luni', en: 'Monday' },
  { ro: 'Marți', en: 'Tuesday' },
  { ro: 'Miercuri', en: 'Wednesday' },
  { ro: 'Joi', en: 'Thursday' },
  { ro: 'Vineri', en: 'Friday' },
  { ro: 'Sâmbătă', en: 'Saturday' },
  { ro: 'Duminică', en: 'Sunday' },
];

const SLOTS_4: Bi[] = [
  { ro: 'Mic dejun', en: 'Breakfast' },
  { ro: 'Prânz', en: 'Lunch' },
  { ro: 'Gustare', en: 'Snack' },
  { ro: 'Cină', en: 'Dinner' },
];

const SLOTS_SNACKS: Bi[] = [
  { ro: 'Dimineața', en: 'Morning' },
  { ro: 'După-amiaza', en: 'Afternoon' },
];

export interface PlaceholderMenu {
  slug: string;
  age: string;
  title: Bi;
  description: Bi;
  days: number;
  featured?: boolean;
  intro: Bi;
  mealSlots: Bi[];
  /** One entry per day; `meals` aligns to `mealSlots`. */
  week: { day: Bi; meals: Bi[] }[];
}

/** Build a week from rows of [ro, en] tuples per meal slot. */
function week(rows: [string, string][][]): { day: Bi; meals: Bi[] }[] {
  return rows.map((meals, i) => ({
    day: DAYS[i],
    meals: meals.map(([ro, en]) => ({ ro, en })),
  }));
}

export const PLACEHOLDER_MENUS: PlaceholderMenu[] = [
  {
    slug: 'meniu-echilibrat-familie',
    age: 'familie',
    title: { ro: 'Meniu echilibrat pentru o săptămână', en: 'A balanced week of meals' },
    description: {
      ro: 'Idei simple pentru toată familia, pe care le mâncați împreună.',
      en: 'Simple ideas for the whole family to share at the table.',
    },
    days: 7,
    featured: true,
    intro: {
      ro: 'O săptămână de idei echilibrate, gândite să fie ușor de gătit și de împărțit la masă, în familie. Adaptează porțiile la fiecare.',
      en: 'A week of balanced ideas, meant to be easy to cook and share at the family table. Adjust portions to each person.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu fructe și nuci', 'Oats with fruit and nuts'], ['Supă de legume + pui la cuptor', 'Vegetable soup + roast chicken'], ['Iaurt cu mere', 'Yogurt with apple'], ['Omletă cu legume', 'Veggie omelette']],
      [['Pâine integrală cu ou și roșii', 'Wholegrain toast with egg and tomato'], ['Orez cu pește și salată', 'Rice with fish and salad'], ['Fructe de sezon', 'Seasonal fruit'], ['Cremă de legume', 'Vegetable cream soup']],
      [['Iaurt cu granola', 'Yogurt with granola'], ['Paste cu sos de roșii și brânză', 'Pasta with tomato sauce and cheese'], ['Morcovi și hummus', 'Carrots and hummus'], ['Tocăniță de legume', 'Vegetable stew']],
      [['Clătite integrale cu fructe', 'Wholegrain pancakes with fruit'], ['Pui cu cartofi și broccoli', 'Chicken with potatoes and broccoli'], ['Brânză cu pâine', 'Cheese with bread'], ['Salată cu năut', 'Chickpea salad']],
      [['Smoothie cu banane și ovăz', 'Banana-oat smoothie'], ['Linte cu orez', 'Lentils with rice'], ['Fructe și nuci', 'Fruit and nuts'], ['Pește la cuptor cu legume', 'Baked fish with vegetables']],
      [['Ouă jumări cu avocado', 'Scrambled eggs with avocado'], ['Ciorbă + friptură de curcan', 'Soup + turkey roast'], ['Iaurt cu fructe', 'Yogurt with fruit'], ['Pizza de casă cu legume', 'Homemade veggie pizza']],
      [['Brânză, pâine și legume', 'Cheese, bread and vegetables'], ['Friptură de duminică cu garnitură', 'Sunday roast with sides'], ['Prăjitură cu fructe', 'Fruit cake'], ['Supă ușoară', 'Light soup']],
    ]),
  },
  {
    slug: 'meniu-scoala-copii',
    age: 'copii',
    title: { ro: 'Meniu pentru o săptămână de școală', en: 'A week of school-day meals' },
    description: {
      ro: 'Idei rapide pentru micul dejun, prânz și cină.',
      en: 'Quick ideas for breakfast, lunch, and dinner.',
    },
    days: 7,
    intro: {
      ro: 'Idei rapide pentru zilele de școală — mic dejun consistent, un pachet ușor de dus și cine simple.',
      en: 'Quick ideas for school days — a filling breakfast, an easy packed lunch, and simple dinners.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu banană', 'Oats with banana'], ['Sandviș cu pui și legume', 'Chicken and veggie sandwich'], ['Măr și un baton de cereale', 'Apple and a cereal bar'], ['Paste cu legume', 'Pasta with vegetables']],
      [['Iaurt cu fulgi și fructe', 'Yogurt with flakes and fruit'], ['Wrap cu brânză și salată', 'Cheese and salad wrap'], ['Morcovi bebe', 'Baby carrots'], ['Pui cu orez', 'Chicken with rice']],
      [['Pâine cu ou fiert', 'Bread with boiled egg'], ['Orez cu legume și ton', 'Rice with vegetables and tuna'], ['Iaurt de băut', 'Drinkable yogurt'], ['Supă cu găluște', 'Soup with dumplings']],
      [['Clătite cu brânză', 'Cheese pancakes'], ['Sandviș cu curcan', 'Turkey sandwich'], ['Fructe tăiate', 'Cut fruit'], ['Chiftele la cuptor cu piure', 'Baked meatballs with mash']],
      [['Smoothie cu fructe', 'Fruit smoothie'], ['Paste cu sos de roșii', 'Pasta with tomato sauce'], ['Covrigei și un fruct', 'Pretzels and a fruit'], ['Omletă cu pâine', 'Omelette with bread']],
      [['Ouă jumări cu roșii', 'Scrambled eggs with tomato'], ['Pizza de casă', 'Homemade pizza'], ['Iaurt cu miere', 'Yogurt with honey'], ['Tocăniță de legume', 'Vegetable stew']],
      [['Gofre cu fructe', 'Waffles with fruit'], ['Friptură cu cartofi', 'Roast with potatoes'], ['Brânză și fructe', 'Cheese and fruit'], ['Supă cremă', 'Cream soup']],
    ]),
  },
  {
    slug: 'meniu-copii-mofturosi',
    age: 'copii',
    title: { ro: 'Idei pentru copiii mofturoși', en: 'Ideas for picky eaters' },
    description: {
      ro: 'Variază mesele și adu culoare în farfurie, fără bătălii.',
      en: 'Bring variety and color to the plate, without the battles.',
    },
    days: 7,
    intro: {
      ro: 'Idei care aduc culoare și varietate fără presiune. Oferă, fără să insiști — expunerea repetată, blândă, face diferența.',
      en: 'Ideas that add color and variety without pressure. Offer without insisting — gentle, repeated exposure is what makes the difference.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz colorat cu fructe de pădure', 'Colorful berry oats'], ['Mini-chiftele cu sos de roșii', 'Mini meatballs with tomato sauce'], ['Bețișoare de morcov cu dip', 'Carrot sticks with dip'], ['Pireu de cartofi cu pește', 'Mashed potato with fish']],
      [['Clătite mici cu banană', 'Small banana pancakes'], ['Paste „curcubeu” cu legume', 'Rainbow veggie pasta'], ['Brânză tăiată în forme', 'Cheese in fun shapes'], ['Supă cu stelute', 'Star-shaped pasta soup']],
      [['Iaurt cu fructe tăiate mărunt', 'Yogurt with finely cut fruit'], ['Mini-pizza cu legume ascunse', 'Mini pizza with hidden veggies'], ['Felii de măr cu unt de arahide', 'Apple slices with peanut butter'], ['Omletă cu brânză', 'Cheese omelette']],
      [['Smoothie verde dulce', 'Sweet green smoothie'], ['Orez cu pui în formă de bile', 'Rice with chicken bites'], ['Mini-clătite', 'Mini pancakes'], ['Cremă de dovleac', 'Pumpkin cream soup']],
      [['Pâine prăjită cu fețe vesele', 'Toast with funny faces'], ['Burger de casă cu legume', 'Homemade veggie burger'], ['Iaurt de băut', 'Drinkable yogurt'], ['Tocăniță blândă de legume', 'Mild vegetable stew']],
      [['Gofre cu fructe', 'Waffles with fruit'], ['Frigărui colorate de legume și pui', 'Colorful chicken-and-veggie skewers'], ['Fructe înmuiate în iaurt', 'Fruit dipped in yogurt'], ['Supă cremă de morcov', 'Carrot cream soup']],
      [['Ouă jumări moi', 'Soft scrambled eggs'], ['Lasagna cu legume', 'Vegetable lasagna'], ['Prăjitură cu morcov', 'Carrot cake'], ['Supă ușoară', 'Light soup']],
    ]),
  },
  {
    slug: 'meniu-gustari-sanatoase',
    age: 'copii',
    title: { ro: 'Idei de gustări sănătoase', en: 'Healthy snack ideas' },
    description: {
      ro: 'Gustări simple între mese, fără zahăr adăugat.',
      en: 'Simple between-meal snacks, with no added sugar.',
    },
    days: 7,
    intro: {
      ro: 'O săptămână de gustări simple, fără zahăr adăugat — câte o idee pentru dimineață și una pentru după-amiază.',
      en: 'A week of simple, no-added-sugar snacks — one idea for the morning and one for the afternoon.',
    },
    mealSlots: SLOTS_SNACKS,
    week: week([
      [['Felii de măr cu unt de arahide', 'Apple slices with peanut butter'], ['Iaurt natural cu fructe', 'Plain yogurt with fruit']],
      [['Bețișoare de morcov și castravete cu hummus', 'Carrot and cucumber sticks with hummus'], ['Pâine integrală cu brânză', 'Wholegrain bread with cheese']],
      [['Banană și un pumn de nuci', 'Banana and a handful of nuts'], ['Brânză cu roșii cherry', 'Cheese with cherry tomatoes']],
      [['Smoothie cu fructe și iaurt', 'Fruit-and-yogurt smoothie'], ['Felii de pere și migdale', 'Pear slices and almonds']],
      [['Ou fiert și legume crude', 'Boiled egg and raw veggies'], ['Iaurt cu fulgi de ovăz', 'Yogurt with oat flakes']],
      [['Fructe de sezon tăiate', 'Cut seasonal fruit'], ['Mini-sandviș cu avocado', 'Mini avocado sandwich']],
      [['Bol de fructe de pădure', 'Bowl of berries'], ['Brânză și un fruct', 'Cheese and a fruit']],
    ]),
  },
  {
    slug: 'meniu-copii-mici',
    age: 'copii-mici',
    title: { ro: 'Meniu variat pentru copii mici', en: 'A varied week for toddlers' },
    description: {
      ro: 'Idei pe gustul celor mici, ușor de adaptat.',
      en: 'Toddler-friendly ideas that are easy to adapt.',
    },
    days: 7,
    intro: {
      ro: 'Idei pentru copii mici — texturi blânde, porții mici și gusturi simple. Adaptează la ce poate mânca cel mic.',
      en: 'Ideas for toddlers — soft textures, small portions, and simple flavors. Adapt to what your little one can manage.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Terci de ovăz cu măr ras', 'Oat porridge with grated apple'], ['Pireu de legume cu pui', 'Vegetable purée with chicken'], ['Iaurt natural', 'Plain yogurt'], ['Supă-cremă de legume', 'Vegetable cream soup']],
      [['Gris cu lapte și banană', 'Semolina with milk and banana'], ['Pireu de cartofi cu pește', 'Mashed potato with fish'], ['Bucățele moi de fruct', 'Soft fruit pieces'], ['Bulion cu fidea fină', 'Broth with fine noodles']],
      [['Iaurt cu pere rase', 'Yogurt with grated pear'], ['Orez bine fiert cu legume', 'Well-cooked rice with vegetables'], ['Brânză moale', 'Soft cheese'], ['Pireu de dovleac', 'Pumpkin purée']],
      [['Clătită moale cu brânză', 'Soft cheese pancake'], ['Chiftele moi la abur cu pireu', 'Soft steamed meatballs with mash'], ['Compot și biscuiți', 'Stewed fruit and biscuits'], ['Supă pasată', 'Blended soup']],
      [['Terci cu fructe de pădure pasate', 'Porridge with mashed berries'], ['Pireu de linte cu morcov', 'Lentil-and-carrot purée'], ['Iaurt de băut', 'Drinkable yogurt'], ['Omletă moale', 'Soft omelette']],
      [['Banană pasată cu ovăz', 'Mashed banana with oats'], ['Pui mărunțit cu cartof dulce', 'Shredded chicken with sweet potato'], ['Felii moi de fruct', 'Soft fruit slices'], ['Cremă de broccoli', 'Broccoli cream soup']],
      [['Gris cu fructe', 'Semolina with fruit'], ['Pireu de legume de duminică', 'Sunday vegetable purée'], ['Iaurt cu compot', 'Yogurt with stewed fruit'], ['Supă ușoară pasată', 'Light blended soup']],
    ]),
  },
  {
    slug: 'meniu-sezon-familie',
    age: 'familie',
    title: { ro: 'Meniu de sezon pentru familie', en: 'A seasonal family menu' },
    description: {
      ro: 'Idei cu legume și fructe de sezon.',
      en: 'Ideas built around seasonal fruit and vegetables.',
    },
    days: 7,
    intro: {
      ro: 'O săptămână construită în jurul legumelor și fructelor de sezon — mai gustoase, mai accesibile și pline de culoare.',
      en: 'A week built around seasonal fruit and vegetables — tastier, more affordable, and full of color.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu fructe de sezon', 'Oats with seasonal fruit'], ['Supă de sezon + pui la cuptor', 'Seasonal soup + roast chicken'], ['Fructe proaspete', 'Fresh fruit'], ['Salată de sezon cu brânză', 'Seasonal salad with cheese']],
      [['Pâine cu ou și legume de sezon', 'Bread with egg and seasonal veg'], ['Tocăniță de legume de sezon', 'Seasonal vegetable stew'], ['Iaurt cu fructe', 'Yogurt with fruit'], ['Pește la cuptor cu garnitură', 'Baked fish with sides']],
      [['Iaurt cu fructe și semințe', 'Yogurt with fruit and seeds'], ['Risotto cu legume de sezon', 'Seasonal vegetable risotto'], ['Legume crude cu dip', 'Raw veggies with dip'], ['Cremă de sezon', 'Seasonal cream soup']],
      [['Clătite cu dulceață de casă', 'Pancakes with homemade jam'], ['Friptură cu legume la cuptor', 'Roast with oven vegetables'], ['Fructe și nuci', 'Fruit and nuts'], ['Salată caldă de legume', 'Warm vegetable salad']],
      [['Smoothie cu fructe de sezon', 'Seasonal fruit smoothie'], ['Mâncare de legume cu orez', 'Vegetable dish with rice'], ['Brânză cu fructe', 'Cheese with fruit'], ['Plăcintă cu legume', 'Vegetable pie']],
      [['Ouă cu legume de sezon', 'Eggs with seasonal vegetables'], ['Ciorbă de sezon + friptură', 'Seasonal soup + roast'], ['Prăjitură cu fructe de sezon', 'Seasonal fruit cake'], ['Gratin de legume', 'Vegetable gratin']],
      [['Brânză, pâine și fructe', 'Cheese, bread and fruit'], ['Friptură de duminică cu legume', 'Sunday roast with vegetables'], ['Compot de sezon', 'Seasonal stewed fruit'], ['Supă ușoară de sezon', 'Light seasonal soup']],
    ]),
  },
];

export function findPlaceholderMenu(slug: string): PlaceholderMenu | undefined {
  return PLACEHOLDER_MENUS.find((m) => m.slug === slug);
}

export function menuSegmentLabel(key: string, en: boolean): string {
  const s = MENU_SEGMENTS.find((x) => x.key === key);
  return s ? (en ? s.en : s.ro) : key;
}
