import type { AuthTokens, LoginRequest, TotpEnrolment, UserDto } from '@olesia/shared';

import { http, tokenStore } from '@/api/http';

/**
 * Real auth flow against the NestJS `auth` module (module_calendly.md §4).
 * Access token kept in memory; refresh token is an httpOnly cookie.
 */

/** Log in with email + password, returning the authenticated user. */
export async function login(body: LoginRequest): Promise<UserDto> {
  const tokens = await http.post<AuthTokens>('/auth/login', body, {
    noAuth: true,
  });
  tokenStore.set(tokens.accessToken);
  return http.get<UserDto>('/auth/me');
}

/**
 * Restore a session on app load: exchange the refresh cookie for a fresh
 * access token, then load the current user. Returns null if not signed in.
 */
export async function restoreSession(): Promise<UserDto | null> {
  try {
    const tokens = await http.post<AuthTokens>('/auth/refresh', undefined, {
      noAuth: true,
    });
    tokenStore.set(tokens.accessToken);
    return await http.get<UserDto>('/auth/me');
  } catch {
    tokenStore.set(null);
    return null;
  }
}

/** Invalidate the session server-side and clear the in-memory token. */
export async function logout(): Promise<void> {
  try {
    await http.post('/auth/logout');
  } catch {
    // best-effort; clear locally regardless
  }
  tokenStore.set(null);
}

/**
 * Replace one's own password. The API ends every other session and answers
 * with a fresh pair, so the tab this ran in stays signed in.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const tokens = await http.post<AuthTokens>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  tokenStore.set(tokens.accessToken);
}

// --- Two-factor authentication (client answers v2 §10) ---

/** Step 1 — mint a secret and get the QR. 2FA is not active yet. */
export function startTotpEnrolment(): Promise<TotpEnrolment> {
  return http.post<TotpEnrolment>('/auth/2fa/setup');
}

/** Step 2 — prove the authenticator works; returns the recovery codes ONCE. */
export function enableTotp(code: string): Promise<{ recoveryCodes: string[] }> {
  return http.post<{ recoveryCodes: string[] }>('/auth/2fa/enable', { code });
}

/** Turning it off also needs a current code. */
export function disableTotp(code: string): Promise<void> {
  return http.post<void>('/auth/2fa/disable', { code });
}
