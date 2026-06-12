import { Link } from 'react-router-dom';

import { BrandMark } from '@/components/common/brand-mark';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

/** Fixed desktop navigation rail. Hidden below lg (replaced by the sheet). */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link
          to={paths.dashboard}
          className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40"
          aria-label={`${ro.app.name} — acasă`}
        >
          <BrandMark />
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}
