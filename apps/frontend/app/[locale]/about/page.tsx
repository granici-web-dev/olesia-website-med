import { api, loc } from '../../../lib/api';
import type { ReactNode } from 'react';
import { Credentials } from '@/components/sections/Credentials';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';

export const revalidate = 60;

/** Inline **bold** → <strong>. */
function inline(text: string, key: string): ReactNode[] {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${key}-${i}`} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      <span key={`${key}-${i}`}>{part}</span>
    ),
  );
}

/** Minimal Markdown → JSX (headings, lists, quotes, paragraphs). */
function renderMarkdown(src: string): ReactNode[] {
  return src
    .trim()
    .split(/\n{2,}/)
    .map((block, i) => {
      const key = `b${i}`;
      const lines = block.split('\n');
      if (block.startsWith('## ')) {
        return (
          <h2 key={key} className="serif mt-12 text-[1.9rem] leading-snug tracking-[-0.01em] first:mt-0">
            {block.slice(3)}
          </h2>
        );
      }
      if (block.startsWith('> ')) {
        return (
          <blockquote key={key} className="serif-it my-8 border-l-2 border-sage pl-5 text-[1.4rem] leading-snug text-[var(--walnut)]">
            {inline(block.replace(/^> ?/gm, ''), key)}
          </blockquote>
        );
      }
      if (lines.every((l) => /^[-*] /.test(l))) {
        return (
          <ul key={key} className="my-5 list-disc space-y-1.5 pl-5 text-ink-soft">
            {lines.map((l, j) => (
              <li key={`${key}-${j}`}>{inline(l.slice(2), `${key}-${j}`)}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={key} className="mt-5 leading-relaxed text-ink-soft text-pretty">
          {inline(block, key)}
        </p>
      );
    });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const about = await api.about();

  const eyebrow = loc(locale, 'Despre noi', 'About');
  const title = about
    ? loc(locale, about.titleRo, about.titleEn)
    : loc(locale, 'Despre noi', 'About us');
  const content = about ? loc(locale, about.contentRo, about.contentEn) : '';
  const images = about?.images ?? [];

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-20 md:py-28">
        <div
          className={
            images.length > 0
              ? 'grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20'
              : ''
          }
        >
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="serif mt-4 max-w-[16ch] text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              {title}
            </h1>
            <div className="mt-10 max-w-[60ch] text-[1.05rem]">
              {content ? renderMarkdown(content) : null}
            </div>
          </div>

          {images.length > 0 && (
            <div className="flex flex-col gap-5 lg:sticky lg:top-24">
              {images.slice(0, 3).map((src, i) => (
                // Same framing as the homepage hero photo: 4/5, cover, top-anchored.
                <div
                  key={i}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-top"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Credentials locale={locale} stats={about?.stats ?? []} />
      <Testimonials locale={locale} items={about?.testimonials ?? []} />
      <Faq locale={locale} items={about?.faq ?? []} />
    </main>
  );
}
