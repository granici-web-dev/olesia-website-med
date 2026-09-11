import type { PublicContactDto, PublicPostDto, WorkingHoursDto } from './api';
import { loc } from './api';
import { routing } from '@/i18n/routing';
import { siteUrl } from './site-url';

/**
 * schema.org descriptions of the practice, built from what the API actually
 * says (audit A7, F14).
 *
 * The rule that shapes every function here: nothing is asserted that the
 * client has not entered. A `Physician` block with an invented phone number or
 * a guessed address is worse than no block, because a search engine will
 * publish it. A field the API has nothing for is simply absent, and a whole
 * block returns `null` when there is nothing to describe.
 */

const DOCTOR_NAME = 'Dr. Olesea Jalba';

/** schema.org spells its weekdays out, and starts them at Monday like we do. */
const SCHEMA_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function absolute(locale: string, path: string): string {
  return `${siteUrl()}/${locale}${path}`;
}

export interface PhysicianInput {
  locale: string;
  /** The page the block sits on, so `url` points at it rather than at the site. */
  path: string;
  contacts: PublicContactDto[];
  hours: WorkingHoursDto | null;
  /** Absolute or site-relative portrait, when the page has one. */
  imageUrl?: string;
}

export function physicianJsonLd({
  locale,
  path,
  contacts,
  hours,
  imageUrl,
}: PhysicianInput): object {
  const first = (type: string) =>
    contacts.find((c) => c.type === type)?.value.trim();
  const telephone = first('phone');
  const email = first('email');
  const address = first('address');
  const socialLinks = contacts
    .filter((c) => c.type === 'social')
    .map((c) => c.value.trim())
    .filter((v) => /^https?:\/\//i.test(v));

  const openingHours = (hours?.days ?? [])
    .filter((d) => !d.closed)
    .map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_WEEKDAYS[d.weekday - 1],
      opens: d.opensAt,
      closes: d.closesAt,
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: DOCTOR_NAME,
    url: absolute(locale, path),
    medicalSpecialty: ['Pediatric', 'DietNutrition'],
    knowsLanguage: [...routing.locales],
    areaServed: { '@type': 'Country', name: 'Moldova' },
    availableLanguage: [...routing.locales],
    ...(imageUrl
      ? {
          image: imageUrl.startsWith('http')
            ? imageUrl
            : `${siteUrl()}${imageUrl}`,
        }
      : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressCountry: 'MD',
          },
        }
      : {}),
    ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
    ...(openingHours.length > 0
      ? { openingHoursSpecification: openingHours }
      : {}),
  };
}

export function articleJsonLd(locale: string, post: PublicPostDto): object {
  const headline = loc(locale, post.titleRo, post.titleEn, post.titleRu);
  const description = loc(
    locale,
    post.excerptRo ?? '',
    post.excerptEn,
    post.excerptRu,
  ).trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    inLanguage: locale,
    mainEntityOfPage: absolute(locale, `/articles/${post.slug}`),
    author: { '@type': 'Person', name: DOCTOR_NAME },
    publisher: { '@type': 'Person', name: DOCTOR_NAME },
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
  };
}

export interface BreadcrumbInput {
  label: string;
  /** Locale-relative href, as `Breadcrumbs` takes it. Absent on the last crumb. */
  href?: string;
}

/**
 * `BreadcrumbList` for a trail. Returns `null` for a trail of one, which is
 * not a trail — the home crumb alone describes nothing.
 */
export function breadcrumbJsonLd(
  locale: string,
  items: BreadcrumbInput[],
): object | null {
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: absolute(locale, item.href === '/' ? '' : item.href) }
        : {}),
    })),
  };
}
