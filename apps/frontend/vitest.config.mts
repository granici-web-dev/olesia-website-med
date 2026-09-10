import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Vitest only. Next builds this app with its own toolchain, so there is no
 * `vite.config` here and this file never touches the build — it exists so the
 * pure helpers under `lib/` can be tested at all. Components are out of scope
 * by `TESTING.md`; what earns a test here is arithmetic, and today that is the
 * price formatter.
 */
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '.'),
      '@olesia/shared': resolve(
        import.meta.dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
  test: {
    name: 'frontend',
    environment: 'node',
    include: ['{app,components,lib,hooks,store}/**/*.spec.{ts,tsx}'],
    reporters: ['default'],
    passWithNoTests: false,
  },
});
