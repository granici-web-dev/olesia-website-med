/** Canonical route paths. Import these instead of hardcoding strings. */
export const paths = {
  login: '/login',
  dashboard: '/',
  appointments: '/programari',
  subscriptions: '/abonamente',
  quickQuestions: '/intrebari-rapide',
  patients: '/pacienti',
  blog: '/blog',
  blogNew: '/blog/nou',
  services: '/servicii',
  contacts: '/contacte',
  about: '/despre-noi',
  users: '/utilizatori',
} as const;

/** Editor route for a specific post. */
export const blogEditPath = (id: string) => `/blog/${id}`;

/** Detail route for a specific patient. */
export const patientDetailPath = (id: string) => `/pacienti/${id}`;
