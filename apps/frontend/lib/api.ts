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
  LegalEntityDto,
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
  LegalEntityDto,
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
 * `next build` prerenders every page, so an API that is down at build time
 * turned an outage into a *failed deployment*: nothing shipped at all, not even
 * the pages that need no API. The site is deployed before its API has a host,
 * and CI has no API, so this was every build.
 *
 * During the production build an outage is therefore treated as emptiness: the
 * page is prerendered with nothing in it and revalidates within a minute of the
 * first request that finds the API answering. At runtime nothing changes — an
 * outage is thrown and answered by `app/[locale]/error.tsx`, because a live
 * visitor must not be shown a confident, empty version of the site.
 */
const isBuild = (): boolean =>
  process.env.NEXT_PHASE === 'phase-production-build';

/**
 * One line per failed route, so a build that ships empty pages says so.
 * The host is left out: it is an env value and build logs are public.
 */
function warnAtBuild(path: string, status: number): void {
  console.warn(
    `[api] ${path} unavailable at build time (${status || 'network'}); ` +
      'prerendering it empty, ISR will fill it in',
  );
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
    if (isBuild()) {
      warnAtBuild(path, 0);
      return empty;
    }
    throw new ApiUnavailableError(path, 0);
  }
  if (res.status >= 500) {
    if (isBuild()) {
      warnAtBuild(path, res.status);
      return empty;
    }
    throw new ApiUnavailableError(path, res.status);
  }
  if (!res.ok) return empty;
  return (await res.json()) as T;
}

/**
 * A singleton the API creates on first read, so there is no "not there yet"
 * state to render: anything other than the row is the API failing.
 *
 * @param atBuild the row the API would create on its own first read, used only
 * while prerendering — see `isBuild`. There is no empty rendering of a
 * singleton, so the build needs something shaped like the row.
 */
async function getRequired<T>(path: string, atBuild: T): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  } catch {
    if (isBuild()) {
      warnAtBuild(path, 0);
      return atBuild;
    }
    throw new ApiUnavailableError(path, 0);
  }
  if (!res.ok) {
    if (isBuild()) {
      warnAtBuild(path, res.status);
      return atBuild;
    }
    throw new ApiUnavailableError(path, res.status);
  }
  return (await res.json()) as T;
}

/**
 * What `GET /working-hours` answers before anyone has edited it: the Prisma
 * defaults of the singleton (`schema.prisma`, `WorkingHours`), with no days
 * filled in. `isPlaceholder` makes the page print its "provisional hours" note
 * rather than state a schedule we do not have.
 */
const WORKING_HOURS_AT_BUILD: WorkingHoursDto = {
  timezone: 'Europe/Chisinau',
  days: [],
  expressSlaMinutes: 60,
  isPlaceholder: true,
  updatedAt: new Date(0).toISOString(),
};

/**
 * What the API answers before the client's incorporation exists — and what a
 * build with no API reachable must assume. Empty is the honest reading: the
 * legal pages then render their draft banner, which is exactly right for a
 * site whose entity is still outstanding.
 */
const LEGAL_ENTITY_AT_BUILD: LegalEntityDto = {
  registeredName: '',
  idno: '',
  address: '',
};

export const api = {
  services: () => getJson<PublicServiceDto[]>('/services', []),
  contacts: () => getJson<PublicContactDto[]>('/contacts', []),
  legalEntity: () =>
    getRequired<LegalEntityDto>('/contacts/legal-entity', LEGAL_ENTITY_AT_BUILD),
  about: () => getJson<AboutPageDto | null>('/about', null),
  workingHours: () =>
    getRequired<WorkingHoursDto>('/working-hours', WORKING_HOURS_AT_BUILD),
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
