# STACK.md

Technology choices for `olesia-website-med`, read off the repository on **2026-09-10** and
corrected by the maintainer. Versions are as pinned in the manifests.

An Nx monorepo with three applications and one shared package: a public marketing and
booking site, a NestJS content and operations API, and a Romanian-only back office.

---

## Choices

| Area | Choice | Version |
| --- | --- | --- |
| Language | TypeScript, `strict` | `^5.9.3` |
| Monorepo | Nx + pnpm workspaces | `nx 22.7.5`, `pnpm@9.15.9` |
| API framework | NestJS on Express | `@nestjs/* ^11`, `express ^5.2.1` |
| Database | PostgreSQL via Prisma with the pg driver adapter | `prisma ^7.8.0`, `@prisma/adapter-pg ^7.8.0` |
| API auth | JWT access + refresh, passport-jwt, argon2 hashing | `@nestjs/jwt ^11.0.2`, `argon2 ^0.44.0` |
| API validation | class-validator + class-transformer DTOs | `^0.15.1` / `^0.5.1` |
| API docs | Swagger at `/api/docs` | `@nestjs/swagger ^11.4.4` |
| API hardening | helmet, @nestjs/throttler | `^8.3.0`, `^6.5.0` |
| Scheduled work | @nestjs/schedule | `^6.1.3` |
| Mail | nodemailer | `^8.0.11` |
| Images | sharp, in the API's storage pipeline | `^0.35.0` |
| Public site | Next.js App Router, React 19 | `next 16.2.7`, `react ^19` |
| Public site i18n | next-intl, locales `ro` (default) / `en` / `ru` | — |
| Public site styling | Tailwind v4 + CSS Modules, brand tokens as CSS variables | `tailwindcss ^4` |
| Back office | React 19 + Vite, react-router-dom | `vite ^8`, `react-router-dom 6.30.3` (exact) |
| Back office UI | shadcn/ui over Radix primitives, CVA, tailwind-merge, lucide, sonner | — |
| Back office data | TanStack Query | `^5.101.0` |
| Back office forms | react-hook-form + zod | `^7.78.0`, `zod ^4.4.3` |
| Shared types | `packages/shared` — DTOs and enums, built with `tsc` | workspace |
| Formatter | Prettier, single option: `singleQuote` | `~3.6.2` |
| Test runner (API) | Jest with `@swc/jest` | `jest ~30.3.0` |
| Test runner (back office) | Vitest, wired but unused | `vitest ~4.1.0` |
| CI | GitHub Actions: typecheck, three builds, migration check | — |
| Deploy (site) | Vercel | — |
| Deploy (API) | Docker Compose + Postgres, nightly backups | `docker-compose.prod.yml` |
| Dependency updates | Dependabot, grouped | — |

## Decisions

**Content management: a custom CMS, built in this repository.** The content modules of the
NestJS API (`services`, `blog`, `about`, `contacts`, `faq`, `testimonials`,
`media-appearances`, `materials`, `site-media`, `working-hours`) plus the
`apps/back-office` admin panel on React + Vite + shadcn/ui, Romanian-only interface.

Third-party CMSes, Sanity included, were rejected deliberately on **2026-06-10**: the same
admin surface has to own appointments, payments, patient files and the `admin` / `editor`
roles, and an off-the-shelf CMS does not give that. The legacy Sanity integration has been
deleted (`apps/frontend/lib/sanity/` is gone; two stale mentions remain in
`next.config.ts` remote patterns and `apps/frontend/api/CLAUDE.md`). The legacy Cal.com
directory is gone as well, booking having moved to Calendly.

This is a settled decision, not an absence to be filled later. New editable content gets a
module here, not an external service.

**Prisma 7 through the pg driver adapter, not the default engine.** `PrismaService`
constructs the client with `new PrismaPg({ connectionString })`. Anything instantiating
Prisma outside Nest (a script, a probe) must do the same or it fails at construction.

**No Redis.** Throttler storage is in-memory and the module comment says so plainly: this
is correct for a single instance, and a multi-instance deployment would need a shared
store. Recorded as a known limit rather than solved in advance.

**No ESLint.** Prettier with a single option is the whole formatting policy. Discipline
comes from `strict` TypeScript plus the rules in `AGENTS.md`, not from a linter.

**`nodenext` applies to the API only.** `tsconfig.base.json` sets
`module`/`moduleResolution: nodenext`; the back office and the site override both to
`esnext` / `bundler`. `apps/api/tsconfig.app.json` carries a comment about the dependency
incompatibility behind this.

**Dependencies are pooled at the root.** The root `package.json` holds runtime dependencies
for all three applications at once (`next`, `@nestjs/*`, `react-router-dom`, `sharp`),
while `apps/frontend` also has its own manifest. Ownership of a given dependency is
therefore ambiguous by inspection. Stated as fact, not as a recommendation.

**i18n is asymmetric.** The public site is `ro` / `en` / `ru`, with dynamic content from
the API stored `*_ro` / `*_en` only and falling back to `ro` for `ru`. The back office is
Romanian-only, with every string in one dictionary (`src/i18n/ro.ts`).

**`apps/frontend/origin/` is a read-only reference design.** HTML and JSX prototypes that
define the visual intent. Never edited; implementations live in `components/` and `app/`.

## Anti-choices

- **No GraphQL.** REST with Swagger.
- **No ORM other than Prisma**, and no raw SQL in application code. Hand-written SQL exists
  only in migrations.
- **No `prisma db push`.** Migrations are generated and committed; see `PRINCIPLES.md`.
- **No state library in the back office** beyond TanStack Query for server state. Zustand
  is listed for the public site and used in exactly one file.
- **No Edge runtime** on the site; the API is a long-running Node process.
- **No third-party payment SDK.** The maib client is hand-written; maib ships PHP and .NET
  SDKs only.

## Dead or near-dead dependencies

Kept honest so nobody treats them as load-bearing.

- **`ai`, `@google/genai`** — the parked AI image generation. Used by one script,
  `apps/frontend/scripts/generate-images.ts`, and not by any running code.
- **`agentation`** — dev-tools components only.
- **`zustand`** — named as the UI state library in `CLAUDE.md`, present in one file.

## Work in progress, not yet part of the committed stack

**maib e-Commerce Checkout.** `apps/api/src/app/payments/`, the migration
`20260910120000_payments`, the shared payment DTOs and the back-office `Plăți` feature are
written and verified against the bank's sandbox but not committed, and nothing calls
`PaymentsService.start()` yet. `docs/payments-maib-checkout.md` is the reference: it
records the bank's API, four places where the sandbox disagrees with the documentation,
and what is still blocked on the client and on the acquirer. Treat that document as the
source of truth for anything payments-related.
