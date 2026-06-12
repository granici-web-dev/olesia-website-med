import * as React from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link2,
  Code,
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { MarkdownPreview } from '@/components/markdown/markdown-preview';
import { ro } from '@/i18n/ro';

const m = ro.markdown;

/** Controlled Markdown editor: write/preview tabs + a formatting toolbar. */
export function MarkdownEditor({
  value,
  onChange,
  id,
  placeholder = m.placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = React.useState<'write' | 'preview'>('write');

  const restore = (start: number, end: number) => {
    requestAnimationFrame(() => {
      const ta = ref.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(start, end);
    });
  };

  const surround = (before: string, after: string, fallback: string) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = value.slice(s, e) || fallback;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(next);
    restore(s + before.length, s + before.length + selected.length);
  };

  const prefixLines = (prefix: string | ((i: number) => string)) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const block = value.slice(lineStart, e) || '';
    const lines = block.length ? block.split('\n') : [''];
    const out = lines
      .map((ln, i) => (typeof prefix === 'function' ? prefix(i) : prefix) + ln)
      .join('\n');
    const next = value.slice(0, lineStart) + out + value.slice(e);
    onChange(next);
    restore(lineStart, lineStart + out.length);
  };

  const tools = [
    { icon: Bold, label: m.bold, run: () => surround('**', '**', m.bold) },
    { icon: Italic, label: m.italic, run: () => surround('*', '*', m.italic) },
    { icon: Heading2, label: m.heading, run: () => prefixLines('## ') },
    { icon: Quote, label: m.quote, run: () => prefixLines('> ') },
    { icon: List, label: m.bulletList, run: () => prefixLines('- ') },
    {
      icon: ListOrdered,
      label: m.numberedList,
      run: () => prefixLines((i) => `${i + 1}. `),
    },
    {
      icon: Link2,
      label: m.link,
      run: () => surround('[', '](https://)', m.link),
    },
    { icon: Code, label: m.code, run: () => surround('`', '`', 'cod') },
  ];

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as 'write' | 'preview')}
      className="gap-0 overflow-hidden rounded-md border"
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 p-1.5">
        <TabsList className="h-8 bg-transparent p-0">
          <TabsTrigger
            value="write"
            className="data-[state=active]:bg-card data-[state=active]:shadow-xs"
          >
            {m.write}
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-card data-[state=active]:shadow-xs"
          >
            {m.preview}
          </TabsTrigger>
        </TabsList>

        {tab === 'write' && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-5" />
            <div className="flex items-center gap-0.5">
              {tools.map(({ icon: Icon, label, run }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      aria-label={label}
                      onClick={run}
                    >
                      <Icon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </>
        )}
      </div>

      <TabsContent value="write" className="m-0">
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="block max-h-[640px] min-h-[320px] w-full resize-y bg-card px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />
      </TabsContent>

      <TabsContent value="preview" className="m-0">
        <div className="min-h-[320px] px-4 py-3">
          {value.trim() ? (
            <MarkdownPreview source={value} />
          ) : (
            <p className="text-sm text-muted-foreground">{m.previewEmpty}</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
