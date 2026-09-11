import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserDto } from '@olesia/shared';

import type { Role, User } from '@/types';
import { USE_MOCKS } from '@/api/config';
import {
  login as apiLogin,
  logout as apiLogout,
  restoreSession,
} from '@/api/auth';
import { onUnauthorized, type SessionEndReason } from '@/api/http';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Why the last session ended, when it ended on its own. */
  sessionEndReason: SessionEndReason | null;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  /** Rejects when the API did not confirm it; the session is then still live. */
  logout: () => Promise<void>;
  hasRole: (roles?: Role[]) => boolean;
  /** Called once the account has a password of its own. */
  passwordChanged: () => void;
}

const STORAGE_KEY = 'olesia.bo.session';

const AuthContext = React.createContext<AuthContextValue | null>(null);

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: String(dto.role) as Role,
    mustChangePassword: dto.mustChangePassword,
  };
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Auth provider. Real mode (the default) talks to the
 * NestJS `auth` module: access token in memory, refresh token in an httpOnly
 * cookie (module_calendly.md §4). Mock mode keeps a demo admin session in
 * localStorage so the app runs without a backend.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [sessionEndReason, setSessionEndReason] =
    React.useState<SessionEndReason | null>(null);
  const queryClient = useQueryClient();

  // Session restore on load.
  React.useEffect(() => {
    let active = true;

    if (USE_MOCKS) {
      const stored = readStoredUser();
      setUser(stored);
      setStatus(stored ? 'authenticated' : 'unauthenticated');
      return;
    }

    restoreSession().then((dto) => {
      if (!active) return;
      setUser(dto ? toUser(dto) : null);
      setStatus(dto ? 'authenticated' : 'unauthenticated');
    });

    // A failed token refresh anywhere forces a logout. The cache goes with it:
    // it is keyed by query, not by account, and what it holds is patient names.
    const off = onUnauthorized((reason) => {
      if (!active) return;
      queryClient.clear();
      setUser(null);
      setSessionEndReason(reason);
      setStatus('unauthenticated');
    });

    return () => {
      active = false;
      off();
    };
  }, [queryClient]);

  const login = React.useCallback(
    async (email: string, password: string, totpCode?: string) => {
      if (USE_MOCKS) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (!email || !password) throw new Error('invalid_credentials');
        const demo: User = {
          id: 'demo-admin',
          name: email.split('@')[0] || 'Administrator',
          email,
          role: 'admin',
          mustChangePassword: false,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
        setUser(demo);
        setStatus('authenticated');
        return;
      }

      const dto = await apiLogin({ email, password, totpCode });
      setUser(toUser(dto));
      setSessionEndReason(null);
      setStatus('authenticated');
    },
    [],
  );

  /**
   * Sign out, and say so only once the server has. Everything the previous
   * account read is dropped before the next login: react-query keeps answers
   * for thirty seconds, and on this panel those answers are patient names.
   */
  const logout = React.useCallback(async () => {
    if (USE_MOCKS) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await apiLogout();
    }
    queryClient.clear();
    setUser(null);
    setSessionEndReason(null);
    setStatus('unauthenticated');
  }, [queryClient]);

  const passwordChanged = React.useCallback(() => {
    setUser((current) =>
      current ? { ...current, mustChangePassword: false } : current,
    );
  }, []);

  const hasRole = React.useCallback(
    (roles?: Role[]) => {
      if (!roles || roles.length === 0) return true;
      return !!user && roles.includes(user.role);
    },
    [user],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      sessionEndReason,
      login,
      logout,
      hasRole,
      passwordChanged,
    }),
    [user, status, sessionEndReason, login, logout, hasRole, passwordChanged],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
