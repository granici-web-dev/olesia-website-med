/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/back-office',
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@olesia/shared': resolve(
        import.meta.dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
    // Proxy API calls to the NestJS backend so the browser sees a same-origin
    // `/api` (cookies + auth work without cross-site CORS). The API's global
    // prefix is also `/api`, so no path rewrite is needed.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), tailwindcss()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  /**
   * Vitest. `jsdom` rather than `node` because this is a React application and
   * a test that needs to render a component should not have to add the
   * environment first; the specs here are pure functions and would run
   * either way.
   */
  test: {
    name: 'back-office',
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    reporters: ['default'],
    passWithNoTests: false,
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
