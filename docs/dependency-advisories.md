# Dependency advisories — what was fixed and what is deliberately left

Moved out of `STACK.md` on 2026-09-16. `STACK.md` keeps the rule; this file keeps
the evidence. Re-run `pnpm audit` before trusting the numbers.

## State on 2026-09-12 (step 15)

`pnpm audit` went from 17 high / 17 moderate / 1 low to **6 high / 13 moderate /
0 low**, no critical at any point, and not one `pnpm.overrides` entry added.
Sixteen advisories cleared, each by the smallest version move that clears it:

- **`nodemailer` 8.0.11 → 9.1.1** (five advisories, two high): the message-level
  `raw` option and `resolveContent()`'s legacy signature bypassed
  `disableFileAccess` / `disableUrlAccess`, and `addressparser` was quadratic.
  v9's breaking change is TLS validation on remote content; `MailService`
  attaches nothing by URL. Verified against a local MailHog: `verify()`
  succeeds, RO and RU templates arrive with diacritics and Cyrillic intact, a
  refused port logs `code=ESOCKET` and no address, the no-SMTP branch answers
  `false`. `@types/nodemailer` stays at 8.0.1, DefinitelyTyped has no 9.x yet.
- **`@nestjs/swagger` 11.4.4 → 11.4.7** (four `js-yaml` advisories, three high):
  `js-yaml` 4.1.1 was pinned exactly inside swagger, so in-range was the only
  move without an override. Swagger only calls `dump()`, never `load()`.
  `/api/docs`, `/api/docs-json` (108 paths) and `/api/docs-yaml` verified.
- **`fast-uri` 3.1.2 → 3.1.7** (six high, SSRF and host confusion), **`qs`**
  6.15.2 → 6.16.0, **`body-parser`** 2.2.2 → 2.3.0: stale lockfile resolutions
  inside ranges `express` 5.2.1 already allowed.

## What remains, and why nothing is forced for it

- **`mysql2`** (one high, one moderate) and **`deepmerge-ts`** (one high) are
  dependencies of the `prisma` CLI, which carries a MySQL driver and a config
  loader it never uses here. Because `prisma` is a peer of `@prisma/client`,
  `pnpm install --prod` materialises its files in the runtime image's store, but
  neither `prisma` nor `mysql2` is linked into `/app/node_modules` or onto PATH.
  Checked inside a built image: `require.resolve('mysql2')` fails and
  `node_modules/.bin/prisma` does not exist. Migrations run in the separate
  `migrate` container that does have the CLI.
- **`brace-expansion`** (Sentry's bundler plugin), **`image-size`** (`less`
  under Vite), **`smol-toml`**, **`adm-zip`**, **`baseline-browser-mapping`**,
  **`uuid`**, **`vitest` / `@vitest/mocker`**, the remaining **`qs`** 6.15.3
  inside the `express` 4 that `webpack-dev-server` pulls in: build and test
  tooling. Each is a DoS or local file-access issue reachable only by feeding
  the tool a crafted input, and the only inputs are this repository's own files.
- **`react-router` / `@remix-run/router` / `react-router-dom`** (five moderate:
  open redirect, SSR-hydration injection) are in the back office, a client-side
  SPA behind a login on an admin host, with no SSR hydration and no untrusted
  link source. The fix is a `react-router` major, its own step.

## Removed packages

- **2026-09-11 (audit A7):** `zustand` and `@tanstack/react-query` from
  `apps/frontend`; each had one importer and neither importer was imported.
  TanStack Query stays in the root manifest for the back office.
- **2026-09-10:** `ai` and `@google/genai`, which existed for one parked script.
  The script is kept at `docs/parked/generate-images.ts`; reviving it means
  re-adding both packages deliberately.

## Dependabot decisions

- **2026-09-16, #14 merged** (`73a5c68`): the routine group, 19 in-range updates; 568 tests and CI green.
- **2026-09-16, #17 merged** (`69fb43d`): `nodemailer` 9.1.1 → 10.0.9; a prescription with a PDF sent through Mailpit arrived intact.
- **2026-09-16, #15 closed, major ignored:** Nest 12 moves to ESM and Jest breaks; needs its own migration.
- **2026-09-16, #16 closed, major ignored:** `webpack-cli` 7 dropped `--node-env`, which Nx passes; wait for Nx.
- **2026-09-16, #18 closed, major ignored:** TypeScript 6 breaks on `baseUrl` in `apps/back-office/tsconfig.app.json`; revisit with the stack upgrade.
