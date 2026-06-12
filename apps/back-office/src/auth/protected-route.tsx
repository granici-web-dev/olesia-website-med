import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/auth-context';
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

/** Gates the authenticated app. Unauthenticated users are sent to /login. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div
        className="grid min-h-svh place-items-center text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {ro.common.loading}
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
