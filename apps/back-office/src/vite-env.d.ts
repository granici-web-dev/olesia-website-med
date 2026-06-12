/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the NestJS API. Defaults to `/api` (same-origin proxy). */
  readonly VITE_API_URL?: string;
  /**
   * When not exactly `"false"`, the app uses the in-memory mock data layer.
   * Set `VITE_API_MOCKS=false` once the backend endpoints are live.
   */
  readonly VITE_API_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
