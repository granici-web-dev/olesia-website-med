import { LEGAL_ENTITY_INCOMPLETE } from '@/lib/legal-entity';

/**
 * Says out loud that a legal page is not finished.
 *
 * It renders only while `LEGAL_ENTITY` is missing a required field, so it
 * cannot be forgotten on the page after the data arrives, and it cannot be
 * dismissed while the page is genuinely incomplete. The alternative — a policy
 * that reads as authoritative but names no controller and no registered entity
 * — is worse than an obviously unfinished one, because a visitor has no way to
 * tell.
 */
export function LegalDraftNotice({ locale }: { locale: string }) {
  if (!LEGAL_ENTITY_INCOMPLETE) return null;

  const ru = locale === 'ru';
  const en = locale === 'en';

  return (
    <div
      role="note"
      className="border-b border-[var(--rule)] bg-[var(--cream-2)]"
    >
      <div className="shell py-4">
        <p className="max-w-[80ch] text-[0.9375rem] leading-relaxed text-ink text-pretty">
          <span className="mono mr-2 text-[11px] uppercase tracking-[0.12em] text-sage-text">
            {ru ? 'Черновик' : en ? 'Draft' : 'Ciornă'}
          </span>
          {ru
            ? 'Этот документ ещё не окончателен: в нём не указаны юридические данные (наименование, IDNO, адрес) и он не прошёл проверку юриста. Мы дополним его до запуска сайта.'
            : en
              ? 'This document is not final: it does not yet state the legal entity behind the practice (registered name, fiscal code, address) and has not been reviewed by a lawyer. It will be completed before the site launches.'
              : 'Acest document nu este încă final: nu conține datele juridice ale cabinetului (denumire înregistrată, IDNO, adresă) și nu a fost verificat de un jurist. Îl completăm înainte de lansarea site-ului.'}
        </p>
      </div>
    </div>
  );
}
