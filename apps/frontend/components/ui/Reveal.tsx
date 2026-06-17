'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, Ref } from 'react';

type RevealProps = {
  /** Rendered element (keeps list/section semantics, e.g. "li" / "article"). */
  as?: ElementType;
  /** Stagger delay (ms) applied to the reveal transition. */
  delay?: number;
} & ComponentPropsWithoutRef<'div'>;

/**
 * Scroll-reveal wrapper. Content is visible by default (SSR, no-JS, and
 * reduced-motion all render it in place — it never ships hidden). Once mounted
 * it hides instantly, then fades and rises in as it enters the viewport.
 *
 * Uses IntersectionObserver so it works in every modern browser, unlike CSS
 * scroll-driven animations (`animation-timeline: view()`), which Safari and
 * Firefox don't fully support.
 */
export function Reveal({ as, delay = 0, className, children, style, ...rest }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mergedStyle: CSSProperties | undefined =
    armed && delay ? { ...style, transitionDelay: `${delay}ms` } : style;

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      data-reveal={armed ? (shown ? 'in' : 'out') : undefined}
      className={className}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
}
