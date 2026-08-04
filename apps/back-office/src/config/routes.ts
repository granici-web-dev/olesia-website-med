/** Canonical route paths. Import these instead of hardcoding strings. */
export const paths = {
  login: '/login',
  dashboard: '/',
  appointments: '/programari',
  subscriptions: '/abonamente',
  quickQuestions: '/intrebari-rapide',
  messages: '/mesaje',
  orders: '/comenzi',
  patients: '/pacienti',
  blog: '/blog',
  blogNew: '/blog/nou',
  services: '/servicii',
  contacts: '/contacte',
  about: '/despre-noi',
  faq: '/intrebari-frecvente',
  testimonials: '/recenzii',
  media: '/aparitii-media',
  library: '/biblioteca',
  siteMedia: '/imagini-video',
  users: '/utilizatori',
  security: '/securitate',
} as const;

/** Editor route for a specific post. */
export const blogEditPath = (id: string) => `/blog/${id}`;

/** Detail route for a specific patient. */
export const patientDetailPath = (id: string) => `/pacienti/${id}`;
