import { Agentation } from 'agentation';

/**
 * In-browser annotation overlay for pinpointing UI to change. Dev-only —
 * `import.meta.env.DEV` is `true` under `vite dev`, `false` in production builds.
 */
export function DevTools() {
  if (!import.meta.env.DEV) return null;
  return <Agentation />;
}
