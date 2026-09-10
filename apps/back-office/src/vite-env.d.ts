/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the NestJS API. Defaults to `/api` (same-origin proxy). */
  readonly VITE_API_URL?: string;
  /**
   * Set to exactly `"true"` to run against the in-memory mock data layer.
   * Anything else — including unset — talks to the real API.
   */
  readonly VITE_API_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
