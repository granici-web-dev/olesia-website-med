import type { Metadata } from 'next';
import { PatientUpload } from '@/components/sections/PatientUpload';

/**
 * Patient document upload (client answers v2 §11.14).
 *
 * The URL *is* the credential, so this page must never be indexed, never be
 * followed, and never leak its token to a third party. Hence `noindex,
 * nofollow` and — importantly — `referrer: no-referrer`: without it, clicking
 * the contact link on the dead-link screen would hand the whole token to the
 * next page in a Referer header.
 *
 * The route stays Romanian in every locale (`/en/incarcare/…` too): the link is
 * sent once, in one form, and a locale-dependent path would break the ones
 * already in people's inboxes the day we translate it.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return {
    title: ru
      ? 'Загрузка документов | Dr. Olesea Jalba'
      : en
        ? 'Upload documents | Dr. Olesea Jalba'
        : 'Încărcare documente | Dr. Olesea Jalba',
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  };
}

export default async function UploadPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;

  return (
    <main className="bg-cream text-ink">
      <PatientUpload locale={locale} token={token} />
    </main>
  );
}
