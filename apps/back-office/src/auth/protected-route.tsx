import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/auth-context';
import { returnPath } from '@/auth/session-rules';
import { ChangePasswordForm } from '@/auth/change-password-form';
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

/**
 * Gates the authenticated app. Unauthenticated users are sent to /login, and an
 * account still carrying the password an admin read out gets no further than
 * changing it.
 */
export function ProtectedRoute() {
  const { status, user, sessionEndReason } = useAuth();
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
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: returnPath(location), reason: sessionEndReason }}
      />
    );
  }

  if (user?.mustChangePassword) {
    return (
      <div className="grid min-h-svh place-items-center px-4 py-16">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {ro.changePassword.forcedTitle}
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              {ro.changePassword.forcedHint}
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
