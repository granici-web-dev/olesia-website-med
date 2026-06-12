import { Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { ro } from '@/i18n/ro';

/** Sticky top bar: mobile nav trigger, search, notifications, current user. */
export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <MobileSidebar />

      <label className="relative hidden flex-1 items-center sm:flex sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder={ro.header.search}
          aria-label={ro.header.search}
          className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
      </label>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={ro.header.notifications}
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu />
      </div>
    </header>
  );
}
