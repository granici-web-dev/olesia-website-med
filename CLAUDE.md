# CLAUDE.md — olesia-website-med

Entry point for Claude Code agents. **Procedural rules and read order live in `AGENTS.md`.**

## Where the project stands (2026-09-10)

All three applications are live and well ahead of the client: the API runs 27 domain
modules, the back office has 24 pages, the site has 20 routes in three languages. The
features that older notes still list as "next" — FAQ, testimonials, media appearances,
the digital library, patient uploads, working hours, 2FA, reCAPTCHA, rate limiting, the
production stack, CI — are built. What blocks launch is on the client's side: legal
entity, EU hosting, the domain, a paid Calendly, working hours, SMTP, content.

- **The working plan is `PLAN.md`.** One step at a time, in order; a step opens only after
  the previous one is verified and committed. Read it before picking anything up.
- **The standards are `PRINCIPLES.md` (judgment), `STACK.md` (technology) and
  `TESTING.md` (what is worth testing).** `AGENTS.md` holds the procedural rules.
- **Client scope and blockers:** `docs/brief-changes-2026-06-24.md` — two rounds of client
  answers (2026-06-24 and 2026-07-26) with a per-phase status. Its price table is the
  service catalog: ~13 services in EUR, plus group C deliverables.

**Payments (this reverses the older "out of scope — manual" note).** The maib e-Commerce
Checkout ledger is built and merged into `main`: the `payments` API module, the schema,
the back-office `Plăți` page, 39 tests. It is verified against the bank's sandbox but
**dark** — nothing calls `PaymentsService.start()`, there is no pre-checkout step and no
return pages, and the bank's callback has never been delivered because there is no public
HTTPS host yet. `paymentStatus` on an appointment, order, subscription or question is now
a **mirror of the `Payment` row**, not a field set by hand. Anything payments-related
starts at `docs/payments-maib-checkout.md`, which is the source of truth.

## Quick orientation

- **Monorepo:** Nx + pnpm workspaces.
- **Next 16 is not the Next.js in your training data.** Read the relevant guide in
  `node_modules/next/dist/docs/` before touching the frontend. (`next dev` writes
  `apps/frontend/AGENTS.md` and `apps/frontend/CLAUDE.md` saying so; they are
  generated and git-ignored, not this project's rules.)
- **Frontend:** Next.js 16 App Router (16.3.4), React 19, TypeScript strict, Tailwind CSS v4 + CSS Modules, next-intl, react-markdown for the client's own text. **No client state library and no client data-fetching library**: pages are server components that read the API directly, and the handful of interactive pieces use `useState`. Zustand and TanStack Query were both listed here and used nowhere; they went with audit A7.
- **Content:** **No third-party CMS — fully custom (decided 2026-06-10).** All content is served by the **NestJS content API** (`apps/api`) and edited in the custom back office (`apps/back-office`): services, blog, about, contacts, FAQ, testimonials, media appearances, library materials, site media, working hours. Rationale: the same admin surface must also own appointments, payments, patient files and the `admin`/`editor` roles, which an off-the-shelf CMS cannot host. Sanity was dropped and its integration deleted. See `STACK.md`.
- **Booking:** **Calendly** (needs a paid plan, ≥ Standard — the free plan allows one active event type, which is why four of the five links currently fail) — webhook-driven into the `appointments` module. The earlier Cal.com integration was deleted.
- **i18n:** Three locales — `ro` (default), `en`, `ru`. Page copy is authored inline as a locale ternary; the JSON in `i18n/messages/` carries the shared frame only (nav, footer, UI primitives). API content is trilingual with `*Ru` nullable, falling back RU → RO. The rule and its example are `AGENTS.md` R3.
- **Deploy:** the site is on Vercel. The API + Postgres ship as `docker-compose.prod.yml` with nightly backups — prepared and locally verified, but the host is not chosen yet. See `docs/deployment.md`.

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
      messages/      ro.json, en.json, ru.json — the shared frame only
      routing.ts     Locale config (defaultLocale: ro)
      request.ts     next-intl server config
    lib/             api.ts (content client), calendly.ts, analytics.ts,
                     legal-entity.ts, uploads.ts, service-content.ts, …
    hooks/           Custom React hooks
    types/           Shared TypeScript types
    origin/          READ-ONLY reference design (HTML/JSX prototypes). Never edit.
  api/               NestJS API (27 domain modules)
  back-office/       React + Vite admin panel (24 pages), Romanian-only
packages/
  shared/            DTOs and enums imported by all three apps
```

## Target architecture — backend + back office

Three applications and one shared package, all built. `module_calendly.md` is the original specification and still governs the booking integration and the data model; where it and the code disagree, the code and the dated notes in `docs/` win — the file itself says which parts are superseded.

- **apps/frontend** — the public site (`@olesia/frontend`, Next.js), consuming the API and typing its responses via `packages/shared`. (Kept as `apps/frontend` — this **is** the spec's `apps/web`; do not rename.)
- **apps/api** — **NestJS** backend, one module per domain, 27 of them: `auth`, `users`, `services`, `appointments`, `subscriptions`, `quick-questions`, `deliverable-orders`, `payments`, `blog`, `contacts`, `about`, `faq`, `testimonials`, `media-appearances`, `materials`, `site-media`, `working-hours`, `patients`, `uploads`, `storage`, `leads`, `contact-messages`, `mail`, `dashboard`, `health`, `prisma`, `captcha`. **PostgreSQL + Prisma**, Swagger at `/api/docs`, deployed via Docker.
- **apps/back-office** — **React + Vite + shadcn/ui** admin panel, 24 pages. UI is **Romanian-only** (every string in `src/i18n/ro.ts`). Build its UI with the **`impeccable`** skill.
- **packages/shared** — single source of TS DTOs + enums (service codes, roles, statuses, payment states) imported by all apps. No manual type duplication on the frontends.

**Key facts**

- **Auth:** JWT (short access + refresh), roles `admin` / `editor`; closed registration (admin creates users); passwords hashed (argon2/bcrypt).
- **Services:** the catalog is data — a `services` table edited in the back office, prices in EUR. Group **A** are Calendly video slots (`pediatric`, `nutrition_copii`, `nutrition_adulti`, `integrative`, `free_consult`), group **B** are portal-only (monitoring/subscriptions, EXPRESS questions), group **C** are the deliverables (menus and protocols). Map a booking to a service **by `event_type` URI only** — never by the editable `a1` answer, and never by the slug: on the test account the slugs do not match their own event names. ⚠️ Known debt: the site still reads prices from `SERVICE_PRICE_META` and the i18n JSON, so editing one in the back office does not change the page. `PLAN.md` step 8.
- **Content:** every content entity is trilingual — RO and EN required, `*Ru` nullable with a RU → RO fallback; public GETs are read-only/unauthenticated; lists are paginated.
- **Payments:** maib e-Commerce Checkout. The ledger is in `main` and the bank's sandbox is verified, but no flow calls it yet — see the header above and `docs/payments-maib-checkout.md`. `paymentStatus` on an appointment, order, subscription or question mirrors the `Payment` row; the back office no longer sets it by hand.
- **Calendly:** env `CALENDLY_API_TOKEN`, `CALENDLY_ORG_URI`, `CALENDLY_WEBHOOK_SIGNING_KEY`; verify webhook signature; idempotency by `scheduled_event.uri`.
- **Deploy:** multi-stage Dockerfile + docker-compose (`api`, `postgres`, `backup`; volumes for PG, `uploads/` and `private-uploads/`); `/health` healthcheck; Prisma migrations on container start. Details and the required environment: `docs/deployment.md`.
- **GDPR:** portal stores names/emails/medical attachments (EU/Moldova) — handle consent, storage, and PII-safe logging.

**Decided** (overrides the spec's `[DEFAULT]`s, 2026-06-10): keep **Nx + pnpm workspaces** (not Turborepo); the site app stays **`apps/frontend`** (= the spec's `apps/web`); file storage stays **local `uploads/`** for now (→ S3/Cloudinary later, behind the `storage` abstraction); blog content is **Markdown**.

## Skills

- **Responsive layout & breakpoints:** Any work involving responsive design, breakpoints, container queries, mobile-first layouts, or Tailwind responsive utilities MUST use the `tailwind-responsive-design` skill. Invoke it before adding or modifying responsive styles — do not hand-roll breakpoint logic from memory.
- **Back office UI:** When building or refining `apps/back-office` UI (shadcn/ui components, states, layout, accessibility), use the **`impeccable`** skill.

## Pointers

- **What to work on next:** `PLAN.md`.
- **Standards:** `PRINCIPLES.md` (judgment), `STACK.md` (technology), `TESTING.md` (tests).
- **Read order, binding rules, workflow, naming, glossary:** `AGENTS.md`.
- **Backend / back office / Calendly spec:** `module_calendly.md` — the original specification; superseded in places, and it says where.
- **Payments:** `docs/payments-maib-checkout.md`.
- **Client scope, blockers, per-phase status:** `docs/brief-changes-2026-06-24.md`.
- **Production deployment and the required environment:** `docs/deployment.md`.
- **Reference design:** `apps/frontend/origin/` — HTML/JSX prototypes. Source of truth for visual design decisions.
- **Environment variables:** `apps/frontend/.env.local.example` (site), `docs/deployment.md` (API).

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