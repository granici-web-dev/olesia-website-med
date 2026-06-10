# CLAUDE.md — olesia-website-med

Entry point for Claude Code agents. **Procedural rules and read order live in `AGENTS.md`.**

## Quick orientation

- **Monorepo:** Nx + pnpm workspaces.
- **Frontend:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 + CSS Modules, Zustand (UI state), TanStack Query (server state), next-intl (EN/RO).
- **CMS:** Sanity.io (managed, hosted). Content types: articles, services, pricing. Client in `apps/frontend/lib/sanity/`.
- **Booking:** Cal.com self-hosted. Embed widget in `/contact` page.
- **i18n:** Two locales — `ro` (default) and `en`. Messages in `apps/frontend/i18n/messages/{ro,en}.json`.
- **Deploy:** Docker Compose for local/staging. Production TBD.

## Workspace layout

```
apps/
  frontend/          Next.js 15 app (@olesia/frontend)
    app/
      [locale]/      Locale-scoped routes (ro, en)
    components/
      layout/        Nav, Footer — appear on every page
      sections/      Page sections (Hero, HowItWorks, Services, About, …)
      ui/            Reusable primitives (Button, Badge, …)
    i18n/
      messages/      en.json, ro.json
      routing.ts     Locale config (defaultLocale: ro)
      request.ts     next-intl server config
    lib/
      sanity/        Sanity client + queries
      cal/           Cal.com helpers
    store/           Zustand stores (ui.store.ts, …)
    hooks/           Custom React hooks
    types/           Shared TypeScript types
    origin/          READ-ONLY reference design (HTML/JSX prototypes). Never edit.
libs/                Shared libs (future: shared-types, shared-utils)
```

## Pointers

- **Read order, binding rules, workflow, naming, glossary:** `AGENTS.md`.
- **Reference design:** `apps/frontend/origin/` — HTML/JSX prototypes. Source of truth for visual design decisions.
- **Environment variables:** `apps/frontend/.env.local.example`.