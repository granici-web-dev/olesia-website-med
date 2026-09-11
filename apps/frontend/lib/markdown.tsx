import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * The client's Markdown, rendered with the site's typography.
 *
 * This was a hand-written block parser that understood `##`, `>`, `- ` and
 * `**bold**` and silently rendered everything else as literal text: a link
 * came out as `[text](url)`, a table as pipes, `###` as a paragraph beginning
 * with three hashes. The back office previews the same text with
 * `react-markdown`, so what the doctor approved in the editor and what a
 * visitor read were two different documents (audit A7). Both now run the same
 * parser with the same GFM extensions; only the styling differs, because the
 * two applications look different.
 *
 * Raw HTML stays off. `react-markdown` ignores it unless `rehype-raw` is added,
 * and the content comes through an editor that has no reason to emit any.
 *
 * The pictures are plain `<img>` rather than `next/image`, deliberately and
 * temporarily: an uploaded image is served by the API, and `next/image` only
 * accepts hosts listed in `next.config.ts` — which are read from `API_URL` at
 * build time. Until the API has a stable public host, a `next/image` here
 * would render nothing at all rather than an unoptimized picture. Recorded in
 * `docs/deployment.md` (audit A7, F10/F13).
 */
export function renderMarkdown(src: string): ReactElement {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h2 className="serif mt-12 text-[2.1rem] leading-snug tracking-[-0.015em] first:mt-0">
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="serif mt-12 text-[1.9rem] leading-snug tracking-[-0.01em] first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="serif mt-9 text-[1.45rem] leading-snug tracking-[-0.01em]">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-5 leading-relaxed text-ink-soft text-pretty">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-ink">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="my-5 list-disc space-y-1.5 pl-5 text-ink-soft">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-5 list-decimal space-y-1.5 pl-5 text-ink-soft">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="serif-it my-8 border-l-2 border-sage pl-5 text-[1.4rem] leading-snug text-[var(--walnut)]">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            // Every link in this text was typed by an editor, not by us, so an
            // external one gets `noopener noreferrer` without asking where it
            // points.
            rel="noopener noreferrer nofollow"
            className="border-b border-sage text-ink transition-colors hover:border-ink"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) =>
          typeof src === 'string' ? (
            // eslint-disable-next-line @next/next/no-img-element -- see the file header
            <img
              src={src}
              alt={alt ?? ''}
              className="my-8 w-full rounded-2xl object-cover"
            />
          ) : null,
        hr: () => <hr className="my-10 border-[var(--rule)]" />,
        code: ({ children }) => (
          <code className="mono rounded bg-cream-2 px-1.5 py-0.5 text-[0.9em] text-ink">
            {children}
          </code>
        ),
        table: ({ children }) => (
          <div className="my-8 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[0.95rem]">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-[var(--rule)] pb-2 pr-6 text-[11px] font-medium uppercase tracking-[0.12em] text-sage-text">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-[var(--rule)] py-3 pr-6 align-top text-ink-soft">
            {children}
          </td>
        ),
      }}
    >
      {src}
    </ReactMarkdown>
  );
}
