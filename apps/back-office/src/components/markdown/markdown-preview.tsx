import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

/** Renders trusted markdown (no raw HTML) with token-aware prose styling. */
export function MarkdownPreview({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground',
        'prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground',
        'prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4',
        'prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-blockquote:not-italic',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none',
        'prose-hr:border-border prose-img:rounded-lg',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            void node;
            return <a target="_blank" rel="noreferrer" {...props} />;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
