import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { navGroups } from '@/config/nav';
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';

/** Navigation list shared by the desktop rail and the mobile sheet. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { hasRole } = useAuth();

  return (
    <nav
      className="flex flex-col gap-6 px-3 py-4"
      aria-label={ro.sidebar.mainNav}
    >
      {navGroups.map((group) => {
        const items = group.items.filter((item) => hasRole(item.roles));
        if (items.length === 0) return null;

        return (
          <div key={group.label} className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'group/navitem relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none',
                          'focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            aria-hidden
                            className={cn(
                              'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-sidebar-primary transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <Icon
                            className={cn(
                              'size-[18px] shrink-0 transition-colors',
                              isActive
                                ? 'text-sidebar-primary'
                                : 'text-muted-foreground group-hover/navitem:text-sidebar-accent-foreground',
                            )}
                            strokeWidth={2}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
