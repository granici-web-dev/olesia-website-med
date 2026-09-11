/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the NestJS API. Defaults to `/api` (same-origin proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
