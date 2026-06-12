import { api, loc, type ContactDto } from '../../../lib/api';

export const revalidate = 60;

function href(c: ContactDto): string | null {
  switch (c.type) {
    case 'phone':
      return `tel:${c.value.replace(/\s+/g, '')}`;
    case 'email':
      return `mailto:${c.value}`;
    case 'social':
      return c.value;
    case 'other':
      return /^https?:\/\//i.test(c.value) ? c.value : null;
    default:
      return null;
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const contacts = (await api.contacts()).filter((c) => c.active);

  const t = {
    eyebrow: loc(locale, 'Contact', 'Contact'),
    title: loc(locale, 'Hai să vorbim', 'Let’s talk'),
    intro: loc(
      locale,
      'Programări, întrebări sau colaborări — alege canalul care îți este la îndemână.',
      'Appointments, questions or collaborations — pick whatever channel suits you.',
    ),
  };

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-20 md:py-28">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="serif mt-4 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
          {t.title}
        </h1>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
          {t.intro}
        </p>

        <dl className="mt-14 grid grid-cols-1 gap-x-12 gap-y-9 sm:grid-cols-2">
          {contacts.map((c) => {
            const link = href(c);
            const ext = c.type === 'social' || c.type === 'other';
            return (
              <div key={c.id} className="border-t border-[var(--rule)] pt-5">
                <dt className="eyebrow">{loc(locale, c.labelRo, c.labelEn)}</dt>
                <dd className="serif mt-2 text-[1.6rem] leading-snug">
                  {link ? (
                    <a
                      href={link}
                      target={ext ? '_blank' : undefined}
                      rel={ext ? 'noreferrer' : undefined}
                      className="text-[var(--walnut)] underline-offset-4 transition-colors hover:text-sage-deep hover:underline"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span>{c.value}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
    </main>
  );
}
