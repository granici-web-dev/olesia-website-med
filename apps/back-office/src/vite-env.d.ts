/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the NestJS API. Defaults to `/api` (same-origin proxy). */
  readonly VITE_API_URL?: string;
  /** Sentry project DSN. Empty or absent switches error tracking off. */
  readonly VITE_SENTRY_DSN?: string;
  /** The commit the bundle was built from, so a stack trace names a version. */
  readonly VITE_SENTRY_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
