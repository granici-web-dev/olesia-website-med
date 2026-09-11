import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site-url';

/**
 * `metadataBase` is the only thing this layout contributes, and every page
 * depends on it: canonical links, the hreflang set and the OG image are all
 * declared as paths, and Next needs an origin to turn them into the absolute
 * URLs a crawler requires (audit A7, F19). The title and description below are
 * a floor nothing normally reaches — `app/[locale]/layout.tsx` replaces them
 * per locale, and each page replaces them again.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: 'Dr. Olesea Jalba — Pediatrics & Nutrition',
  description: 'Online pediatrics and nutrition consultations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
