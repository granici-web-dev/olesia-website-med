/**
 * Public-site API client. Reads from the live NestJS API's public GET
 * endpoints (no auth). Server-component fetch with a 60-second data cache.
 *
 * The response shapes are `packages/shared`'s. They used to be nine
 * hand-written interfaces here, kept in step with the API's mappers by hand
 * (audit A6, F8) — a field added on one side was a mismatch nothing caught.
 */

import type {
  AboutPageDto,
  FaqCategoryDto,
  MaterialCategoryDto,
  PublicContactDto,
  PublicMaterialDto,
  PublicMediaAppearanceDto,
  PublicPostDto,
  PublicServiceDto,
  SiteMediaDto,
  TestimonialDto,
  WorkingHoursDto,
} from '@olesia/shared';

export type {
  AboutCredential,
  AboutPageDto,
  AboutStat,
  FaqCategoryDto,
  FaqItemDto,
  MaterialCategoryDto,
  PublicContactDto,
  PublicMaterialDto,
  PublicMediaAppearanceDto,
  PublicPostDto,
  PublicServiceDto,
  SiteMediaDto,
  TestimonialDto,
  WorkingDayDto,
  WorkingHoursDto,
} from '@olesia/shared';

import { normalizeApiBase } from './api-base';

const API_URL = normalizeApiBase(process.env.API_URL, 'API_URL');

/**
 * The API could not answer — it is down, unreachable, or broken.
 *
 * Distinguished from an *empty* answer on purpose (audit A6, F5). `getJson`
 * used to turn every failure into the fallback value, so a page rendered a
 * complete, confident, empty version of itself and cached it for a minute: the
 * services list vanished, the FAQ silently fell back to a compiled-in copy, and
 * nothing anywhere said the site was not working. A 200 with `[]` means the
 * client has not written anything yet and is rendered as such; an outage is
 * thrown and answered by `app/[locale]/error.tsx`.
 */
export class ApiUnavailableError extends Error {
  constructor(
    readonly path: string,
    /** HTTP status, or 0 when the request never reached the API. */
    readonly status: number,
  ) {
    super(`api_unavailable ${path} ${status || 'network'}`);
    this.name = 'ApiUnavailableError';
  }
}

/**
 * @param empty what "the client has not filled this in" looks like.
 *
 * A 4xx is the API answering, and the only 4xx these routes produce is the 404
 * of a slug that does not exist — which is emptiness, not an outage.
 */
async function getJson<T>(path: string, empty: T): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  } catch {
    throw new ApiUnavailableError(path, 0);
  }
  if (res.status >= 500) throw new ApiUnavailableError(path, res.status);
  if (!res.ok) return empty;
  return (await res.json()) as T;
}

/**
 * A singleton the API creates on first read, so there is no "not there yet"
 * state to render: anything other than the row is the API failing.
 */
async function getRequired<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  } catch {
    throw new ApiUnavailableError(path, 0);
  }
  if (!res.ok) throw new ApiUnavailableError(path, res.status);
  return (await res.json()) as T;
}

export const api = {
  services: () => getJson<PublicServiceDto[]>('/services', []),
  contacts: () => getJson<PublicContactDto[]>('/contacts', []),
  about: () => getJson<AboutPageDto | null>('/about', null),
  workingHours: () => getRequired<WorkingHoursDto>('/working-hours'),
  faq: () => getJson<FaqCategoryDto[]>('/faq', []),
  testimonials: () => getJson<TestimonialDto[]>('/testimonials', []),
  mediaAppearances: () =>
    getJson<PublicMediaAppearanceDto[]>('/media-appearances', []),
  materials: () => getJson<PublicMaterialDto[]>('/materials', []),
  siteMedia: () => getJson<SiteMediaDto[]>('/site-media', []),
  materialCategories: () =>
    getJson<MaterialCategoryDto[]>('/materials/categories', []),
  posts: () => getJson<PublicPostDto[]>('/blog/published', []),
  post: (slug: string) =>
    getJson<PublicPostDto | null>(`/blog/published/${slug}`, null),
};

/** Short category tag for a service (shown above its title in service rows). */
export function serviceTag(locale: string, s: PublicServiceDto): string {
  // Russian readers were shown Romanian tags, because the helper only ever
  // knew two languages (audit A6, F11).
  const l = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;
  switch (s.code) {
    case 'pediatric':
      return l('Pediatrie', 'Pediatrics', 'Педиатрия');
    case 'nutrition_copii':
      return l('Nutriție · copii', 'Nutrition · children', 'Питание · дети');
    case 'nutrition_adulti':
      return l('Nutriție · adulți', 'Nutrition · adults', 'Питание · взрослые');
    case 'integrative':
      return l(
        'Integrativ & monitorizare',
        'Integrative & monitoring',
        'Комплексно и наблюдение',
      );
    case 'monitoring':
      return l('Acompaniere', 'Support', 'Сопровождение');
    case 'quick_question':
      return l('Întrebare EXPRESS', 'Express question', 'EXPRESS-вопрос');
    default:
      return s.group === 'A_booking'
        ? l('Consultație video', 'Video consultation', 'Видеоконсультация')
        : l('Acompaniere', 'Support', 'Сопровождение');
  }
}

/**
 * Pick the locale variant of a `*Ro` / `*En` / `*Ru` triple.
 *
 * Romanian is the fallback, and an empty string counts as missing just like
 * `null`: the back office writes `''` for a field the doctor left blank, and a
 * blank heading on the public page would be worse than a Romanian one.
 */
export function loc(
  locale: string,
  ro: string,
  en?: string | null,
  ru?: string | null,
): string {
  const pick = locale === 'ru' ? ru : locale === 'en' ? en : ro;
  return pick?.trim() ? pick : ro;
}
