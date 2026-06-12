import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { Role } from '@/types';

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
      {ro.roles[role]}
    </Badge>
  );
}

export function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'destructive'}>
      {active ? ro.users.statusLabel.active : ro.users.statusLabel.blocked}
    </Badge>
  );
}
