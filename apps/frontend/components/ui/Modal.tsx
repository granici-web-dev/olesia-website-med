'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/**
 * Anything inside the panel that Tab can reach.
 *
 * `:not([tabindex="-1"])` on every branch, not just the last: the forms in
 * these dialogs carry a honeypot input, which is off the tab order but is still
 * an `input` (audit A6, F21). It sorted first in the panel, so the trap sent
 * Shift+Tab from the first real field into a hidden box — and focus vanished.
 */
const FOCUSABLE =
  'input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog. Centered panel on desktop, full-screen bottom sheet
 * on mobile. Closes on ESC and backdrop click, locks body scroll while open,
 * moves focus into the panel and restores it on close. Honors reduced-motion
 * via CSS. Rendered through a portal so it escapes any clipping context.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog (for aria-labelledby). */
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Trap Tab/Shift+Tab within the panel.
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    // Focus the first focusable control inside the panel.
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={styles.panel}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
