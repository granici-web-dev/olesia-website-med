import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/common/brand-mark';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ro } from '@/i18n/ro';

/** Off-canvas navigation for narrow viewports. Closes on route change. */
export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={ro.header.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 p-0"
        aria-describedby={undefined}
      >
        <SheetHeader className="h-16 flex-row items-center border-b px-5 py-0">
          <SheetTitle className="sr-only">{ro.app.tagline}</SheetTitle>
          <BrandMark />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
