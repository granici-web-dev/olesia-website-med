import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

/**
 * Every path under a locale that matches no page.
 *
 * Without this route, an unmatched URL never reaches `[locale]` at all: Next
 * renders the *root* `not-found` boundary, which sits outside the locale
 * layout — no `<html lang>`, no Nav, no Footer, and Next's own English
 * sentence regardless of which language the visitor was reading (audit A7,
 * F3). Matching the path first and then calling `notFound()` from inside the
 * segment is what puts `app/[locale]/not-found.tsx` on screen, and declaring
 * the locale first is what lets that page read it on the server.
 */
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
