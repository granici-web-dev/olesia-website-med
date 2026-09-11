import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';
import { paths } from '@/config/routes';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  /**
   * Say "signed out" only after the server has said so. When it refuses, the
   * session is still open and the panel stays where it is: a login screen over
   * a live session is the panel telling the doctor something untrue about who
   * can reach her patients.
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error(ro.userMenu.logoutFailed);
      return;
    }
    toast.success(ro.userMenu.logout, { description: ro.app.name });
    navigate(paths.login, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=open]:bg-accent">
        <Avatar>
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[10rem] truncate font-medium sm:inline">
          {user.name}
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-1.5 py-2">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
          <Badge variant="muted" className="mt-0.5 w-fit">
            {ro.roles[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound />
          {ro.userMenu.profile}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings />
          {ro.userMenu.settings}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => void handleLogout()}
        >
          <LogOut />
          {ro.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
