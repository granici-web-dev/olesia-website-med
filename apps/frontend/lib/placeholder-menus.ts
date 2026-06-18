/**
 * Placeholder weekly-menu content — for design review only, until real menus
 * come from the back office. Shared by the menus listing AND the menu detail
 * page so a menu link always opens a real page instead of 404ing. These are
 * inspiration-only meal ideas (no grams, calories or portions). ⚠ replace with
 * the doctor's reviewed menus before launch. Slugs mirror the listing.
 */

export type Bi = { ro: string; en: string; ru: string };

export interface MenuSegmentDef {
  key: string;
  ro: string;
  en: string;
  ru: string;
}

export const MENU_SEGMENTS: MenuSegmentDef[] = [
  { key: 'copii-mici', ro: 'Copii mici', en: 'Toddlers', ru: 'Малыши' },
  { key: 'copii', ro: 'Copii', en: 'Children', ru: 'Дети' },
  { key: 'familie', ro: 'Familie / adulți', en: 'Family / adults', ru: 'Семья / взрослые' },
];

const DAYS: Bi[] = [
  { ro: 'Luni', en: 'Monday', ru: 'Понедельник' },
  { ro: 'Marți', en: 'Tuesday', ru: 'Вторник' },
  { ro: 'Miercuri', en: 'Wednesday', ru: 'Среда' },
  { ro: 'Joi', en: 'Thursday', ru: 'Четверг' },
  { ro: 'Vineri', en: 'Friday', ru: 'Пятница' },
  { ro: 'Sâmbătă', en: 'Saturday', ru: 'Суббота' },
  { ro: 'Duminică', en: 'Sunday', ru: 'Воскресенье' },
];

const SLOTS_4: Bi[] = [
  { ro: 'Mic dejun', en: 'Breakfast', ru: 'Завтрак' },
  { ro: 'Prânz', en: 'Lunch', ru: 'Обед' },
  { ro: 'Gustare', en: 'Snack', ru: 'Перекус' },
  { ro: 'Cină', en: 'Dinner', ru: 'Ужин' },
];

const SLOTS_SNACKS: Bi[] = [
  { ro: 'Dimineața', en: 'Morning', ru: 'Утро' },
  { ro: 'După-amiaza', en: 'Afternoon', ru: 'Полдник' },
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

/** Build a week from rows of [ro, en, ru] tuples per meal slot. */
function week(rows: [string, string, string][][]): { day: Bi; meals: Bi[] }[] {
  return rows.map((meals, i) => ({
    day: DAYS[i],
    meals: meals.map(([ro, en, ru]) => ({ ro, en, ru })),
  }));
}

export const PLACEHOLDER_MENUS: PlaceholderMenu[] = [
  {
    slug: 'meniu-echilibrat-familie',
    age: 'familie',
    title: { ro: 'Meniu echilibrat pentru o săptămână', en: 'A balanced week of meals', ru: 'Сбалансированное меню на неделю' },
    description: {
      ro: 'Idei simple pentru toată familia, pe care le mâncați împreună.',
      en: 'Simple ideas for the whole family to share at the table.',
      ru: 'Простые идеи для всей семьи — чтобы собраться за одним столом.',
    },
    days: 7,
    featured: true,
    intro: {
      ro: 'O săptămână de idei echilibrate, gândite să fie ușor de gătit și de împărțit la masă, în familie. Adaptează porțiile la fiecare.',
      en: 'A week of balanced ideas, meant to be easy to cook and share at the family table. Adjust portions to each person.',
      ru: 'Неделя сбалансированных блюд — их легко приготовить и разделить за семейным столом. Порции подстройте под каждого.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu fructe și nuci', 'Oats with fruit and nuts', 'Овсянка с фруктами и орехами'], ['Supă de legume + pui la cuptor', 'Vegetable soup + roast chicken', 'Овощной суп и курица из духовки'], ['Iaurt cu mere', 'Yogurt with apple', 'Йогурт с яблоком'], ['Omletă cu legume', 'Veggie omelette', 'Омлет с овощами']],
      [['Pâine integrală cu ou și roșii', 'Wholegrain toast with egg and tomato', 'Цельнозерновой тост с яйцом и помидором'], ['Orez cu pește și salată', 'Rice with fish and salad', 'Рис с рыбой и салатом'], ['Fructe de sezon', 'Seasonal fruit', 'Сезонные фрукты'], ['Cremă de legume', 'Vegetable cream soup', 'Овощной крем-суп']],
      [['Iaurt cu granola', 'Yogurt with granola', 'Йогурт с гранолой'], ['Paste cu sos de roșii și brânză', 'Pasta with tomato sauce and cheese', 'Паста с томатным соусом и сыром'], ['Morcovi și hummus', 'Carrots and hummus', 'Морковь с хумусом'], ['Tocăniță de legume', 'Vegetable stew', 'Овощное рагу']],
      [['Clătite integrale cu fructe', 'Wholegrain pancakes with fruit', 'Цельнозерновые блинчики с фруктами'], ['Pui cu cartofi și broccoli', 'Chicken with potatoes and broccoli', 'Курица с картофелем и брокколи'], ['Brânză cu pâine', 'Cheese with bread', 'Сыр с хлебом'], ['Salată cu năut', 'Chickpea salad', 'Салат с нутом']],
      [['Smoothie cu banane și ovăz', 'Banana-oat smoothie', 'Смузи с бананом и овсянкой'], ['Linte cu orez', 'Lentils with rice', 'Чечевица с рисом'], ['Fructe și nuci', 'Fruit and nuts', 'Фрукты и орехи'], ['Pește la cuptor cu legume', 'Baked fish with vegetables', 'Рыба из духовки с овощами']],
      [['Ouă jumări cu avocado', 'Scrambled eggs with avocado', 'Яичница с авокадо'], ['Ciorbă + friptură de curcan', 'Soup + turkey roast', 'Суп и запечённая индейка'], ['Iaurt cu fructe', 'Yogurt with fruit', 'Йогурт с фруктами'], ['Pizza de casă cu legume', 'Homemade veggie pizza', 'Домашняя пицца с овощами']],
      [['Brânză, pâine și legume', 'Cheese, bread and vegetables', 'Сыр, хлеб и овощи'], ['Friptură de duminică cu garnitură', 'Sunday roast with sides', 'Воскресное жаркое с гарниром'], ['Prăjitură cu fructe', 'Fruit cake', 'Пирог с фруктами'], ['Supă ușoară', 'Light soup', 'Лёгкий суп']],
    ]),
  },
  {
    slug: 'meniu-scoala-copii',
    age: 'copii',
    title: { ro: 'Meniu pentru o săptămână de școală', en: 'A week of school-day meals', ru: 'Меню на учебную неделю' },
    description: {
      ro: 'Idei rapide pentru micul dejun, prânz și cină.',
      en: 'Quick ideas for breakfast, lunch, and dinner.',
      ru: 'Быстрые идеи для завтрака, обеда и ужина.',
    },
    days: 7,
    intro: {
      ro: 'Idei rapide pentru zilele de școală — mic dejun consistent, un pachet ușor de dus și cine simple.',
      en: 'Quick ideas for school days — a filling breakfast, an easy packed lunch, and simple dinners.',
      ru: 'Быстрые идеи для учебных дней — сытный завтрак, удобный перекус с собой и простой ужин.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu banană', 'Oats with banana', 'Овсянка с бананом'], ['Sandviș cu pui și legume', 'Chicken and veggie sandwich', 'Сэндвич с курицей и овощами'], ['Măr și un baton de cereale', 'Apple and a cereal bar', 'Яблоко и злаковый батончик'], ['Paste cu legume', 'Pasta with vegetables', 'Паста с овощами']],
      [['Iaurt cu fulgi și fructe', 'Yogurt with flakes and fruit', 'Йогурт с хлопьями и фруктами'], ['Wrap cu brânză și salată', 'Cheese and salad wrap', 'Ролл с сыром и салатом'], ['Morcovi bebe', 'Baby carrots', 'Мини-морковь'], ['Pui cu orez', 'Chicken with rice', 'Курица с рисом']],
      [['Pâine cu ou fiert', 'Bread with boiled egg', 'Хлеб с варёным яйцом'], ['Orez cu legume și ton', 'Rice with vegetables and tuna', 'Рис с овощами и тунцом'], ['Iaurt de băut', 'Drinkable yogurt', 'Питьевой йогурт'], ['Supă cu găluște', 'Soup with dumplings', 'Суп с клёцками']],
      [['Clătite cu brânză', 'Cheese pancakes', 'Блинчики с творогом'], ['Sandviș cu curcan', 'Turkey sandwich', 'Сэндвич с индейкой'], ['Fructe tăiate', 'Cut fruit', 'Нарезанные фрукты'], ['Chiftele la cuptor cu piure', 'Baked meatballs with mash', 'Тефтели из духовки с пюре']],
      [['Smoothie cu fructe', 'Fruit smoothie', 'Фруктовый смузи'], ['Paste cu sos de roșii', 'Pasta with tomato sauce', 'Паста с томатным соусом'], ['Covrigei și un fruct', 'Pretzels and a fruit', 'Сушки и фрукт'], ['Omletă cu pâine', 'Omelette with bread', 'Омлет с хлебом']],
      [['Ouă jumări cu roșii', 'Scrambled eggs with tomato', 'Яичница с помидорами'], ['Pizza de casă', 'Homemade pizza', 'Домашняя пицца'], ['Iaurt cu miere', 'Yogurt with honey', 'Йогурт с мёдом'], ['Tocăniță de legume', 'Vegetable stew', 'Овощное рагу']],
      [['Gofre cu fructe', 'Waffles with fruit', 'Вафли с фруктами'], ['Friptură cu cartofi', 'Roast with potatoes', 'Жаркое с картофелем'], ['Brânză și fructe', 'Cheese and fruit', 'Сыр и фрукты'], ['Supă cremă', 'Cream soup', 'Крем-суп']],
    ]),
  },
  {
    slug: 'meniu-copii-mofturosi',
    age: 'copii',
    title: { ro: 'Idei pentru copiii mofturoși', en: 'Ideas for picky eaters', ru: 'Идеи для привередливых в еде детей' },
    description: {
      ro: 'Variază mesele și adu culoare în farfurie, fără bătălii.',
      en: 'Bring variety and color to the plate, without the battles.',
      ru: 'Больше разнообразия и красок в тарелке — без споров и капризов.',
    },
    days: 7,
    intro: {
      ro: 'Idei care aduc culoare și varietate fără presiune. Oferă, fără să insiști — expunerea repetată, blândă, face diferența.',
      en: 'Ideas that add color and variety without pressure. Offer without insisting — gentle, repeated exposure is what makes the difference.',
      ru: 'Идеи, которые добавляют красок и разнообразия без нажима. Предлагайте, но не настаивайте — мягкое, раз за разом, знакомство с новой едой делает своё дело.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz colorat cu fructe de pădure', 'Colorful berry oats', 'Яркая овсянка с ягодами'], ['Mini-chiftele cu sos de roșii', 'Mini meatballs with tomato sauce', 'Мини-тефтели с томатным соусом'], ['Bețișoare de morcov cu dip', 'Carrot sticks with dip', 'Морковные палочки с соусом'], ['Pireu de cartofi cu pește', 'Mashed potato with fish', 'Картофельное пюре с рыбой']],
      [['Clătite mici cu banană', 'Small banana pancakes', 'Маленькие блинчики с бананом'], ['Paste „curcubeu” cu legume', 'Rainbow veggie pasta', 'Паста «радуга» с овощами'], ['Brânză tăiată în forme', 'Cheese in fun shapes', 'Сыр в виде фигурок'], ['Supă cu stelute', 'Star-shaped pasta soup', 'Суп с макаронами-звёздочками']],
      [['Iaurt cu fructe tăiate mărunt', 'Yogurt with finely cut fruit', 'Йогурт с мелко нарезанными фруктами'], ['Mini-pizza cu legume ascunse', 'Mini pizza with hidden veggies', 'Мини-пицца со спрятанными овощами'], ['Felii de măr cu unt de arahide', 'Apple slices with peanut butter', 'Дольки яблока с арахисовой пастой'], ['Omletă cu brânză', 'Cheese omelette', 'Омлет с сыром']],
      [['Smoothie verde dulce', 'Sweet green smoothie', 'Сладкий зелёный смузи'], ['Orez cu pui în formă de bile', 'Rice with chicken bites', 'Рис с куриными шариками'], ['Mini-clătite', 'Mini pancakes', 'Мини-блинчики'], ['Cremă de dovleac', 'Pumpkin cream soup', 'Тыквенный крем-суп']],
      [['Pâine prăjită cu fețe vesele', 'Toast with funny faces', 'Тост с весёлыми рожицами'], ['Burger de casă cu legume', 'Homemade veggie burger', 'Домашний бургер с овощами'], ['Iaurt de băut', 'Drinkable yogurt', 'Питьевой йогурт'], ['Tocăniță blândă de legume', 'Mild vegetable stew', 'Нежное овощное рагу']],
      [['Gofre cu fructe', 'Waffles with fruit', 'Вафли с фруктами'], ['Frigărui colorate de legume și pui', 'Colorful chicken-and-veggie skewers', 'Яркие шпажки с курицей и овощами'], ['Fructe înmuiate în iaurt', 'Fruit dipped in yogurt', 'Фрукты в йогурте'], ['Supă cremă de morcov', 'Carrot cream soup', 'Морковный крем-суп']],
      [['Ouă jumări moi', 'Soft scrambled eggs', 'Нежная яичница-болтунья'], ['Lasagna cu legume', 'Vegetable lasagna', 'Овощная лазанья'], ['Prăjitură cu morcov', 'Carrot cake', 'Морковный пирог'], ['Supă ușoară', 'Light soup', 'Лёгкий суп']],
    ]),
  },
  {
    slug: 'meniu-gustari-sanatoase',
    age: 'copii',
    title: { ro: 'Idei de gustări sănătoase', en: 'Healthy snack ideas', ru: 'Идеи полезных перекусов' },
    description: {
      ro: 'Gustări simple între mese, fără zahăr adăugat.',
      en: 'Simple between-meal snacks, with no added sugar.',
      ru: 'Простые перекусы между приёмами пищи, без добавленного сахара.',
    },
    days: 7,
    intro: {
      ro: 'O săptămână de gustări simple, fără zahăr adăugat — câte o idee pentru dimineață și una pentru după-amiază.',
      en: 'A week of simple, no-added-sugar snacks — one idea for the morning and one for the afternoon.',
      ru: 'Неделя простых перекусов без добавленного сахара — по одной идее на утро и на полдник.',
    },
    mealSlots: SLOTS_SNACKS,
    week: week([
      [['Felii de măr cu unt de arahide', 'Apple slices with peanut butter', 'Дольки яблока с арахисовой пастой'], ['Iaurt natural cu fructe', 'Plain yogurt with fruit', 'Натуральный йогурт с фруктами']],
      [['Bețișoare de morcov și castravete cu hummus', 'Carrot and cucumber sticks with hummus', 'Морковные и огуречные палочки с хумусом'], ['Pâine integrală cu brânză', 'Wholegrain bread with cheese', 'Цельнозерновой хлеб с сыром']],
      [['Banană și un pumn de nuci', 'Banana and a handful of nuts', 'Банан и горсть орехов'], ['Brânză cu roșii cherry', 'Cheese with cherry tomatoes', 'Сыр с помидорами черри']],
      [['Smoothie cu fructe și iaurt', 'Fruit-and-yogurt smoothie', 'Смузи с фруктами и йогуртом'], ['Felii de pere și migdale', 'Pear slices and almonds', 'Дольки груши и миндаль']],
      [['Ou fiert și legume crude', 'Boiled egg and raw veggies', 'Варёное яйцо и свежие овощи'], ['Iaurt cu fulgi de ovăz', 'Yogurt with oat flakes', 'Йогурт с овсяными хлопьями']],
      [['Fructe de sezon tăiate', 'Cut seasonal fruit', 'Нарезанные сезонные фрукты'], ['Mini-sandviș cu avocado', 'Mini avocado sandwich', 'Мини-сэндвич с авокадо']],
      [['Bol de fructe de pădure', 'Bowl of berries', 'Тарелка ягод'], ['Brânză și un fruct', 'Cheese and a fruit', 'Сыр и фрукт']],
    ]),
  },
  {
    slug: 'meniu-copii-mici',
    age: 'copii-mici',
    title: { ro: 'Meniu variat pentru copii mici', en: 'A varied week for toddlers', ru: 'Разнообразное меню для малышей' },
    description: {
      ro: 'Idei pe gustul celor mici, ușor de adaptat.',
      en: 'Toddler-friendly ideas that are easy to adapt.',
      ru: 'Идеи по вкусу малышей — их легко подстроить под ребёнка.',
    },
    days: 7,
    intro: {
      ro: 'Idei pentru copii mici — texturi blânde, porții mici și gusturi simple. Adaptează la ce poate mânca cel mic.',
      en: 'Ideas for toddlers — soft textures, small portions, and simple flavors. Adapt to what your little one can manage.',
      ru: 'Идеи для малышей — нежная текстура, маленькие порции и простые вкусы. Подстройте под то, что малыш уже умеет есть.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Terci de ovăz cu măr ras', 'Oat porridge with grated apple', 'Овсяная каша с тёртым яблоком'], ['Pireu de legume cu pui', 'Vegetable purée with chicken', 'Овощное пюре с курицей'], ['Iaurt natural', 'Plain yogurt', 'Натуральный йогурт'], ['Supă-cremă de legume', 'Vegetable cream soup', 'Овощной крем-суп']],
      [['Gris cu lapte și banană', 'Semolina with milk and banana', 'Манная каша на молоке с бананом'], ['Pireu de cartofi cu pește', 'Mashed potato with fish', 'Картофельное пюре с рыбой'], ['Bucățele moi de fruct', 'Soft fruit pieces', 'Мягкие кусочки фруктов'], ['Bulion cu fidea fină', 'Broth with fine noodles', 'Бульон с тонкой вермишелью']],
      [['Iaurt cu pere rase', 'Yogurt with grated pear', 'Йогурт с тёртой грушей'], ['Orez bine fiert cu legume', 'Well-cooked rice with vegetables', 'Хорошо разваренный рис с овощами'], ['Brânză moale', 'Soft cheese', 'Мягкий творог'], ['Pireu de dovleac', 'Pumpkin purée', 'Тыквенное пюре']],
      [['Clătită moale cu brânză', 'Soft cheese pancake', 'Мягкий блинчик с творогом'], ['Chiftele moi la abur cu pireu', 'Soft steamed meatballs with mash', 'Нежные паровые тефтели с пюре'], ['Compot și biscuiți', 'Stewed fruit and biscuits', 'Компот и печенье'], ['Supă pasată', 'Blended soup', 'Суп-пюре']],
      [['Terci cu fructe de pădure pasate', 'Porridge with mashed berries', 'Каша с протёртыми ягодами'], ['Pireu de linte cu morcov', 'Lentil-and-carrot purée', 'Пюре из чечевицы с морковью'], ['Iaurt de băut', 'Drinkable yogurt', 'Питьевой йогурт'], ['Omletă moale', 'Soft omelette', 'Нежный омлет']],
      [['Banană pasată cu ovăz', 'Mashed banana with oats', 'Протёртый банан с овсянкой'], ['Pui mărunțit cu cartof dulce', 'Shredded chicken with sweet potato', 'Измельчённая курица со сладким картофелем'], ['Felii moi de fruct', 'Soft fruit slices', 'Мягкие дольки фруктов'], ['Cremă de broccoli', 'Broccoli cream soup', 'Крем-суп из брокколи']],
      [['Gris cu fructe', 'Semolina with fruit', 'Манная каша с фруктами'], ['Pireu de legume de duminică', 'Sunday vegetable purée', 'Воскресное овощное пюре'], ['Iaurt cu compot', 'Yogurt with stewed fruit', 'Йогурт с компотом'], ['Supă ușoară pasată', 'Light blended soup', 'Лёгкий суп-пюре']],
    ]),
  },
  {
    slug: 'meniu-sezon-familie',
    age: 'familie',
    title: { ro: 'Meniu de sezon pentru familie', en: 'A seasonal family menu', ru: 'Сезонное меню для семьи' },
    description: {
      ro: 'Idei cu legume și fructe de sezon.',
      en: 'Ideas built around seasonal fruit and vegetables.',
      ru: 'Идеи на основе сезонных овощей и фруктов.',
    },
    days: 7,
    intro: {
      ro: 'O săptămână construită în jurul legumelor și fructelor de sezon — mai gustoase, mai accesibile și pline de culoare.',
      en: 'A week built around seasonal fruit and vegetables — tastier, more affordable, and full of color.',
      ru: 'Неделя на основе сезонных овощей и фруктов — они вкуснее, доступнее и полны красок.',
    },
    mealSlots: SLOTS_4,
    week: week([
      [['Ovăz cu fructe de sezon', 'Oats with seasonal fruit', 'Овсянка с сезонными фруктами'], ['Supă de sezon + pui la cuptor', 'Seasonal soup + roast chicken', 'Сезонный суп и курица из духовки'], ['Fructe proaspete', 'Fresh fruit', 'Свежие фрукты'], ['Salată de sezon cu brânză', 'Seasonal salad with cheese', 'Сезонный салат с сыром']],
      [['Pâine cu ou și legume de sezon', 'Bread with egg and seasonal veg', 'Хлеб с яйцом и сезонными овощами'], ['Tocăniță de legume de sezon', 'Seasonal vegetable stew', 'Рагу из сезонных овощей'], ['Iaurt cu fructe', 'Yogurt with fruit', 'Йогурт с фруктами'], ['Pește la cuptor cu garnitură', 'Baked fish with sides', 'Рыба из духовки с гарниром']],
      [['Iaurt cu fructe și semințe', 'Yogurt with fruit and seeds', 'Йогурт с фруктами и семечками'], ['Risotto cu legume de sezon', 'Seasonal vegetable risotto', 'Ризотто с сезонными овощами'], ['Legume crude cu dip', 'Raw veggies with dip', 'Свежие овощи с соусом'], ['Cremă de sezon', 'Seasonal cream soup', 'Сезонный крем-суп']],
      [['Clătite cu dulceață de casă', 'Pancakes with homemade jam', 'Блинчики с домашним вареньем'], ['Friptură cu legume la cuptor', 'Roast with oven vegetables', 'Жаркое с овощами из духовки'], ['Fructe și nuci', 'Fruit and nuts', 'Фрукты и орехи'], ['Salată caldă de legume', 'Warm vegetable salad', 'Тёплый овощной салат']],
      [['Smoothie cu fructe de sezon', 'Seasonal fruit smoothie', 'Смузи из сезонных фруктов'], ['Mâncare de legume cu orez', 'Vegetable dish with rice', 'Овощное блюдо с рисом'], ['Brânză cu fructe', 'Cheese with fruit', 'Сыр с фруктами'], ['Plăcintă cu legume', 'Vegetable pie', 'Пирог с овощами']],
      [['Ouă cu legume de sezon', 'Eggs with seasonal vegetables', 'Яйца с сезонными овощами'], ['Ciorbă de sezon + friptură', 'Seasonal soup + roast', 'Сезонный суп и жаркое'], ['Prăjitură cu fructe de sezon', 'Seasonal fruit cake', 'Пирог с сезонными фруктами'], ['Gratin de legume', 'Vegetable gratin', 'Овощной гратен']],
      [['Brânză, pâine și fructe', 'Cheese, bread and fruit', 'Сыр, хлеб и фрукты'], ['Friptură de duminică cu legume', 'Sunday roast with vegetables', 'Воскресное жаркое с овощами'], ['Compot de sezon', 'Seasonal stewed fruit', 'Сезонный компот'], ['Supă ușoară de sezon', 'Light seasonal soup', 'Лёгкий сезонный суп']],
    ]),
  },
];

export function findPlaceholderMenu(slug: string): PlaceholderMenu | undefined {
  return PLACEHOLDER_MENUS.find((m) => m.slug === slug);
}

export function menuSegmentLabel(key: string, en: boolean, ru = false): string {
  const s = MENU_SEGMENTS.find((x) => x.key === key);
  return s ? (ru ? s.ru : en ? s.en : s.ro) : key;
}
