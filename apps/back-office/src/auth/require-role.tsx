import { useAuth } from '@/auth/auth-context';
import type { Role } from '@/types';
import { Forbidden } from '@/components/common/forbidden';

/** Wraps a route element, rendering a Forbidden state when the role is missing. */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { hasRole } = useAuth();
  if (!hasRole(roles)) {
    return <Forbidden />;
  }
  return <>{children}</>;
}
