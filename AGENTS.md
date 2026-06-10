ш# AGENTS.md — olesia-website-med

Conventions every agent (human or AI) must follow. This is the single source for procedural rules. `CLAUDE.md` defers here.

## §0 Read order

Before any non-trivial change, read in this exact order:

1. `AGENTS.md` (this file) — how we operate
2. `CLAUDE.md` — project orientation, workspace layout
3. The relevant component or page file before editing it
4. `apps/frontend/origin/` — reference design when implementing UI

## §1 Binding rules

### R1 — Shape before code (non-trivial work)

For any new page, new section, or significant UI change:
- Describe the plan in a short `docs/shape-<slug>.md` before writing code.
- Carve-outs (no shape needed): typo fixes, copy updates in i18n JSON, dependency bumps, formatter reflows.

### R2 — Origin is read-only

`apps/frontend/origin/` contains the reference HTML/JSX prototypes. **Never edit files in `origin/`.** Use them only to understand the intended design. Implement in `apps/frontend/components/` and `apps/frontend/app/`.

### R3 — i18n for all user-facing text

Every string rendered in JSX/TSX goes through `next-intl`:
```tsx
// correct
const t = useTranslations('home');
<h1>{t('hero.headline')}</h1>

// wrong — hardcoded string in JSX
<h1>Consultații video</h1>
```
Romanian copy lives in `i18n/messages/ro.json`. English in `en.json`. Both files must stay in sync — add a key to both when adding new text.

### R4 — Styling: Tailwind + CSS Modules

- Use **Tailwind** for layout utilities: `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`.
- Use **CSS Modules** for component-specific styles: hover states, CSS custom properties, complex selectors, animations.
- **Never** use inline `style={{}}` for values that could be CSS Module rules.
- Brand tokens are CSS custom properties defined in `globals.css`. Use `var(--sage)`, `var(--ink)`, etc. Never hardcode hex values in component files.
- **Never** use Tailwind `text-[]` or `bg-[]` arbitrary values for brand colors — use CSS variables instead.

### R5 — TypeScript strict

- `strict: true` is enforced. No `any`, no `// @ts-ignore`, no `as unknown as X`.
- All component props must have explicit types.
- Server components are `async`, client components have `'use client'` at the top.

### R6 — No premature abstractions

Rule of three: extract a helper or component only when it appears in 3+ places. Two similar blocks beat a premature abstraction.

## §2 Glossary

| Term | Meaning |
|------|---------|
| **Section** | A full-width page section (Hero, HowItWorks, Services, About). Lives in `components/sections/`. |
| **Layout component** | Nav, Footer — rendered in the locale layout, present on every page. Lives in `components/layout/`. |
| **UI primitive** | Small reusable element (Button, Badge, Tag). Lives in `components/ui/`. |
| **Origin** | `apps/frontend/origin/` — read-only reference design prototypes. |
| **Locale layout** | `app/[locale]/layout.tsx` — wraps every page with Nav, Footer, fonts, i18n provider. |
| **Shape** | A planning doc in `docs/shape-<slug>.md` written before implementing non-trivial work. |

## §3 File naming

| Type | Pattern | Example |
|------|---------|---------|
| Section component | `PascalCase.tsx` + `PascalCase.module.css` | `Hero.tsx`, `Hero.module.css` |
| Layout component | `PascalCase.tsx` + `PascalCase.module.css` | `Nav.tsx`, `Nav.module.css` |
| UI primitive | `PascalCase.tsx` + `PascalCase.module.css` | `Button.tsx`, `Button.module.css` |
| Zustand store | `<name>.store.ts` | `ui.store.ts` |
| Sanity query | `<name>.query.ts` | `articles.query.ts` |
| Page | `page.tsx` (Next.js convention) | `app/[locale]/about/page.tsx` |
| Shape doc | `docs/shape-<slug>.md` | `docs/shape-booking-form.md` |

## §4 Component structure

Every component file follows this order:

```tsx
// 1. Imports — React/Next first, then internal, then styles
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui.store';
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
- Remote images (Sanity CDN) must be listed in `next.config.ts` under `images.remotePatterns`.

## §7 Commit discipline

- **Conventional Commits.** Subject ≤ 72 chars. Body explains why, not what.
- Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- No `--no-verify`. Hook failure = real failure.

```
feat(home): add HowItWorks section with 4-step grid
fix(nav): correct locale switcher href for EN route
chore(deps): bump next-intl to 4.14.0
```

## §8 Forbidden patterns

- Hardcoded hex colors in `.tsx` or `.module.css` files (use `var(--token)`).
- Hardcoded user-facing strings in JSX (use `useTranslations`).
- Default exports for components.
- `<img>` instead of `<Image />`.
- Editing anything inside `apps/frontend/origin/`.
- `any` type or `@ts-ignore`.
- Inline `style={{}}` for styles that belong in CSS Modules.
- `TODO` comments without a linked issue.