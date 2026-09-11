# AGENTS.md — olesia-website-med

Conventions every agent (human or AI) must follow. This is the single source for procedural rules. `CLAUDE.md` defers here.

## §0 Read order

Before any non-trivial change, read in this exact order:

1. `AGENTS.md` (this file) — how we operate
2. `CLAUDE.md` — project orientation, workspace layout
3. The relevant component or page file before editing it
4. `apps/frontend/origin/` — reference design when implementing UI

## §1 Binding rules

### R1 — Shape before code (non-trivial work)

For any new page, new section, significant UI change, or new API module:

1. Run `/rigorous shape`. It reads the standards (`PRINCIPLES.md`, `STACK.md`, `TESTING.md`) and interrogates the idea before any code exists.
2. Save the result as `docs/shape-<slug>.md` — one file per slice, committed with the work it describes.
3. Get it approved. `/rigorous craft` does not run against an unapproved shape.

The shape states what the slice does, what it deliberately does not do, which files it touches, and how it will be verified. It is not a design document; a page is enough.

Carve-outs (no shape needed): typo fixes, copy edits, dependency bumps, formatter reflows, and documentation.

### R2 — Origin is read-only

`apps/frontend/origin/` contains the reference HTML/JSX prototypes. **Never edit files in `origin/`.** Use them only to understand the intended design. Implement in `apps/frontend/components/` and `apps/frontend/app/`.

### R3 — Three locales, and where each string lives

The site is `ro` (default), `en` and `ru`. Copy lives in one of two places, and the split is by scope, not by preference.

**Page copy is authored inline, as a ternary on the locale.** All three branches are mandatory and are kept in sync by hand — nothing falls back for a missing one. From `apps/frontend/app/[locale]/faq/page.tsx`:

```tsx
const en = locale === 'en';
const ru = locale === 'ru';

title: ru
  ? 'Частые вопросы | Dr. Olesea Jalba'
  : en
    ? 'FAQ | Dr. Olesea Jalba'
    : 'Întrebări frecvente | Dr. Olesea Jalba',
```

When a block has several fields, declare the shape once in the same file and read it with one helper, rather than repeating the ternary per field — the same file does exactly that:

```tsx
type Bi = { ro: string; en: string; ru: string };
const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);
```

**`i18n/messages/{ro,en,ru}.json` carries the shared frame only** — `nav`, `footer`, and the primitives that appear on every page. Seven components read it through `next-intl`: `Nav`, `Footer`, `Hero`, `Services`, `HowItWorks`, `About`, `LeadFormModal`. Adding a key means adding it to all three files.

Do not migrate one to the other. A page moved into JSON gains a layer and loses the ability to read the three languages side by side; a nav string moved out of JSON gets duplicated across every layout that renders it.

**Dynamic content from the API** is trilingual too: RO and EN required, `*Ru` nullable, and readers fall back RU → RO through `loc()` in `apps/frontend/lib/api.ts`, which treats an empty string as missing. Never invent a translation for the client's own content — an empty RU field is hers to fill in the back office.

### R4 — Styling: Tailwind + CSS Modules

- Use **Tailwind** for layout utilities: `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`.
- Use **CSS Modules** for component-specific styles: hover states, CSS custom properties, complex selectors, animations.
- **Never** use inline `style={{}}` for values that could be CSS Module rules.
- Brand tokens are CSS custom properties defined in `globals.css`. Use `var(--sage)`, `var(--ink)`, etc. Never hardcode hex values in component files.
- **Never** use Tailwind `text-[]` or `bg-[]` arbitrary values for brand colors — use CSS variables instead.

### R5 — TypeScript strict

- `strict: true` is enforced. No `any`, no `// @ts-ignore` — the tree has zero of both, and that is the point of a codebase with almost no tests.
- `as unknown as X` only where a value genuinely leaves the type system (a Prisma JSON column, a raw text response), and only with a comment saying why. Five exist; `PRINCIPLES.md` names each one.
- All component props must have explicit types.
- Server components are `async`, client components have `'use client'` at the top.

### R6 — No premature abstractions

Rule of three: extract a helper or component only when it appears in 3+ places. Two similar blocks beat a premature abstraction.

## §2 Glossary

| Term                 | Meaning                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Section**          | A full-width page section (Hero, HowItWorks, Services, About). Lives in `components/sections/`.    |
| **Layout component** | Nav, Footer — rendered in the locale layout, present on every page. Lives in `components/layout/`. |
| **UI primitive**     | Small reusable element (Button, Badge, Tag). Lives in `components/ui/`.                            |
| **Origin**           | `apps/frontend/origin/` — read-only reference design prototypes.                                   |
| **Locale layout**    | `app/[locale]/layout.tsx` — wraps every page with Nav, Footer, fonts, i18n provider.               |
| **Shape**            | A planning doc in `docs/shape-<slug>.md` written before implementing non-trivial work.             |

## §3 File naming

| Type              | Pattern                                    | Example                           |
| ----------------- | ------------------------------------------ | --------------------------------- |
| Section component | `PascalCase.tsx` + `PascalCase.module.css` | `Hero.tsx`, `Hero.module.css`     |
| Layout component  | `PascalCase.tsx` + `PascalCase.module.css` | `Nav.tsx`, `Nav.module.css`       |
| UI primitive      | `PascalCase.tsx` + `PascalCase.module.css` | `Button.tsx`, `Button.module.css` |
| Page              | `page.tsx` (Next.js convention)            | `app/[locale]/about/page.tsx`     |
| Shape doc         | `docs/shape-<slug>.md`                     | `docs/shape-booking-form.md`      |

## §4 Component structure

Every component file follows this order:

```tsx
// 1. Imports — React/Next first, then internal, then styles
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/ui/Reveal';
import styles from './Hero.module.css';

// 2. Constants (static data, arrays)
const STATS = [...] as const;

// 3. Component
export function Hero() { ... }
```

- Named exports only — no default exports for components.
- `'use client'` at top only when the component uses hooks, browser APIs, or event handlers.
- Server components by default (no directive needed).

## §5 i18n key conventions

Keys are dotted, English-readable, hierarchical:

```
home.hero.headline
home.hero.sub
home.howItWorks.title
home.services.title
nav.bookOnline
footer.tagline
```

Never use Romanian words as key names. Keys index content, not language.

## §6 Image handling

- All images go in `apps/frontend/public/assets/`.
- Use `next/image` (`<Image />`) always — never `<img>`.
- Always provide `alt`, `width`/`height` or `fill` + `sizes`.
- Remote images are served by our own API (back-office uploads). `next.config.ts` derives the allowed host from `API_URL`, so a new environment needs no edit there — set the variable.

## §7 Commit discipline

**Shape:** `type(optional-scope): subject`. The subject is a finished sentence about the outcome — what the reader now has, not which files moved. Lower case, no trailing period, ≤ 72 characters.

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `ci`, `test`.

**Scope** is the app or module (`frontend`, `api`, `back-office`, `nav`, `payments`). Optional, and worth adding whenever the change sits in one place.

The body explains why. If a commit corrects an earlier decision, say which one and what was wrong with it — `docs/` is the decision log, and a commit that silently reverses a documented choice leaves the log lying.

```
feat(api): let people change their own password, and brake second-factor guessing
fix(frontend): correct the locale switcher href on the EN route
docs: close plan step 5b
```

Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.

No `--no-verify`. Hook failure = real failure.

## §8 Forbidden patterns

- Hardcoded hex colors in `.tsx` or `.module.css` files (use `var(--token)`).
- A user-facing string with fewer than three locale branches (see R3). One language hardcoded is the bug, not the inline ternary.
- Default exports for components.
- `<img>` instead of `<Image />`.
- Editing anything inside `apps/frontend/origin/`.
- `any` type or `@ts-ignore`.
- Inline `style={{}}` for styles that belong in CSS Modules.
- `TODO` comments without a linked issue.
