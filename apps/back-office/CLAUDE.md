# apps/back-office — admin panel

Loaded when you work in this directory. General rules: `../../AGENTS.md`. Build and
refine UI here with the `impeccable` skill.

## Shape

React 19 + Vite, `react-router-dom` 6, shadcn/ui over Radix, TanStack Query for server
state and nothing else, `react-hook-form` + zod. One feature per API domain under
`src/features/<domain>/` (`types.ts`, `api.ts`, `format.ts`, sheets and cells), one
page per route under `src/pages/`. There is no mock layer: every screen reads the API
and reports an outage.

## Rules that bite

- **Romanian only.** Every string lives in `src/i18n/ro.ts`; nothing user-facing in JSX.
  Diacritics with comma below (`ș ț`), never cedilla.
- **Every query has three states**: loading (skeleton), error (`EmptyState` with retry;
  404 distinct from other errors), empty (a sentence that says how rows get here). A
  failed request must never render as "no data".
- **Destructive actions confirm** through `components/common/ConfirmAction` with
  `pending`, name the thing and what goes with it, and disable both buttons while the
  mutation runs. Refunds, patient erasure, document deletion, revoking links, hiding a
  service from the site.
- **API codes reach the field.** 409/400 codes from `prisma-errors` and the services
  (`slug_taken`, `email_taken`, `last_admin`, `cannot_demote_self`, `file_too_large`,
  `totp_locked` with `Retry-After`) map to field errors or specific toasts, never to a
  generic "A apărut o eroare".
- **Roles match the API.** Routes and nav entries gate with `RequireRole` / `roles`
  exactly where the API is `@Roles(Role.admin)`; admin-only actions render behind
  `hasRole(['admin'])`. Today: patients, appointments, users, uploads, order deletion,
  refunds, manual payments, grant revocation, 2FA reset.
- **Lists are paginated** through one `asList` that keeps `total`; search is server-side
  with a debounce. Never download a full table to filter in the browser.
- **Session layer is honest.** `http.ts` refreshes once, times out at 20 s, treats an
  empty 200 as `undefined`; logout waits for the server; `queryClient.clear()` on logout
  and on 401; blob downloads go through `request()`.
- **Same origin as the API** in production (Caddy serves the panel and proxies `/api`);
  the refresh cookie is `SameSite=Lax` and that is the CSRF defence.

## Tests

Vitest with jsdom, `test` block in `vite.config.mts`, `src/test-setup.ts`. Pure
functions: formatters, schemas, session rules. Run: `pnpm nx test back-office`.
