# CLAUDE.md — olesia-website-med

Entry point for Claude Code agents. **Procedural rules and read order live in `AGENTS.md`.**

## Quick orientation

- **Monorepo:** Nx + pnpm workspaces.
- **Frontend:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 + CSS Modules, Zustand (UI state), TanStack Query (server state), next-intl (EN/RO).
- **Content:** **No third-party CMS — fully custom (decided 2026-06-10).** All content (services, blog, contacts, about) is served by the **NestJS content API** (`apps/api`) and edited in the custom back office (`apps/back-office`). **Sanity is dropped** — legacy `apps/frontend/lib/sanity/` is to be removed. Rationale: the back office must also own appointments/payments/GDPR data and `admin`/`editor` roles, which a CMS can't host. See `module_calendly.md`.
- **Booking:** **Calendly** (paid plan, ≥ Standard) — webhook-driven into the `appointments` backend module. **Replaces the earlier Cal.com plan** (legacy `apps/frontend/lib/cal/` to be removed).
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
      sanity/        LEGACY — being removed (content moves to the NestJS API)
      cal/           LEGACY — being removed (booking moves to Calendly)
    store/           Zustand stores (ui.store.ts, …)
    hooks/           Custom React hooks
    types/           Shared TypeScript types
    origin/          READ-ONLY reference design (HTML/JSX prototypes). Never edit.
libs/                Shared libs (future: shared-types, shared-utils)
```

## Target architecture — backend + back office

The repo is expanding from a frontend-only app into a **3-app monorepo + shared types package**. Binding source of truth for this work: **`module_calendly.md`** (read it before touching backend, back office, or booking).

- **apps/frontend** — current public site (`@olesia/frontend`, Next.js). Will consume the backend API and type its responses via `packages/shared`. (Kept as `apps/frontend` — this **is** the spec's `apps/web`; do not rename.)
- **apps/api** — **NestJS** backend, one module per domain: `auth`, `users`, `services`, `appointments`, `subscriptions`, `quick-questions`, `blog`, `contacts`, `about`, `dashboard`, `storage`, `health`. **PostgreSQL + Prisma**, Swagger at `/api/docs`, deployed via Docker.
- **apps/back-office** — **React + Vite + shadcn/ui** admin panel. UI is **Romanian-only** (strings in one i18n dictionary). Build its UI with the **`impeccable`** skill.
- **packages/shared** — single source of TS DTOs + enums (service codes, roles, statuses) imported by all apps. No manual type duplication on the frontends.

**Key facts**

- **Auth:** JWT (short access + refresh), roles `admin` / `editor`; closed registration (admin creates users); passwords hashed (argon2/bcrypt).
- **Services (5):** group **A** = Calendly video slots (`pediatric`, `nutrition`, `integrative`); group **B** = portal only, no calendar (`monitoring` = sub 04, `quick_question` = 05). Map a booking to a service **by `event_type` URI only** — never by the editable `a1` answer.
- **Content:** every content entity is bilingual RO/EN (`*_ro` / `*_en`); public GETs are read-only/unauthenticated; lists are paginated.
- **Payments:** out of scope — manual. Entities carry `payment_status` `pending` → `confirmed` (set by hand in back office).
- **Calendly:** env `CALENDLY_API_TOKEN`, `CALENDLY_ORG_URI`, `CALENDLY_WEBHOOK_SIGNING_KEY`; verify webhook signature; idempotency by `scheduled_event.uri`.
- **Deploy:** multi-stage Dockerfile + docker-compose (`api`, `postgres`; volumes for PG + `uploads/`); `/health` healthcheck; Prisma migrations on container start.
- **GDPR:** portal stores names/emails/medical attachments (EU/Moldova) — handle consent, storage, and PII-safe logging.

**Decided** (overrides the spec's `[DEFAULT]`s, 2026-06-10): keep **Nx + pnpm workspaces** (not Turborepo); the site app stays **`apps/frontend`** (= the spec's `apps/web`); file storage stays **local `uploads/`** for now (→ S3/Cloudinary later, behind the `storage` abstraction); blog content is **Markdown**.

## Skills

- **Responsive layout & breakpoints:** Any work involving responsive design, breakpoints, container queries, mobile-first layouts, or Tailwind responsive utilities MUST use the `tailwind-responsive-design` skill. Invoke it before adding or modifying responsive styles — do not hand-roll breakpoint logic from memory.
- **Back office UI:** When building or refining `apps/back-office` UI (shadcn/ui components, states, layout, accessibility), use the **`impeccable`** skill.

## Pointers

- **Read order, binding rules, workflow, naming, glossary:** `AGENTS.md`.
- **Backend / back office / Calendly spec:** `module_calendly.md` — binding source of truth for the NestJS API, admin panel, and booking integration.
- **Reference design:** `apps/frontend/origin/` — HTML/JSX prototypes. Source of truth for visual design decisions.
- **Environment variables:** `apps/frontend/.env.local.example`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->