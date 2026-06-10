import type { Metadata } from 'next';

export const metadata: Metadata = {
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