import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

/** Authenticated layout: persistent rail + sticky header + scrolling content. */
export function AppShell() {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
