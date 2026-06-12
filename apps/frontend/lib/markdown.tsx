import type { ReactNode } from 'react';

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
export function renderMarkdown(src: string): ReactNode[] {
  return src
    .trim()
    .split(/\n{2,}/)
    .map((block, i) => {
      const key = `b${i}`;
      const lines = block.split('\n');
      if (block.startsWith('## ')) {
        return (
          <h2
            key={key}
            className="serif mt-12 text-[1.9rem] leading-snug tracking-[-0.01em] first:mt-0"
          >
            {block.slice(3)}
          </h2>
        );
      }
      if (block.startsWith('> ')) {
        return (
          <blockquote
            key={key}
            className="serif-it my-8 border-l-2 border-sage pl-5 text-[1.4rem] leading-snug text-[var(--walnut)]"
          >
            {inline(block.replace(/^> ?/gm, ''), key)}
          </blockquote>
        );
      }
      if (lines.every((l) => /^[-*] /.test(l))) {
        return (
          <ul
            key={key}
            className="my-5 list-disc space-y-1.5 pl-5 text-ink-soft"
          >
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
