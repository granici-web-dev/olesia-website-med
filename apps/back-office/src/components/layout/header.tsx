import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { UserMenu } from '@/components/layout/user-menu';

/**
 * Sticky top bar: mobile nav trigger and the current user.
 *
 * It also carried a search field and a notification bell. Neither was wired to
 * anything: the field typed into nothing, and the bell showed a dot that never
 * cleared because no feed set it. Both read as features that were not there
 * (audit A10, F14).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <MobileSidebar />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
