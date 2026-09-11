import type {
  AuthTokens,
  LoginRequest,
  TotpEnrolment,
  UserDto,
} from '@olesia/shared';

import { http, refreshAccessToken, tokenStore } from '@/api/http';

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
 *
 * Through the shared refresh rather than a POST of its own: two tabs opened at
 * the same moment each presented the cookie they had been loaded with, and the
 * one that arrived second was read by the API as a replayed token, which ended
 * the session on every device the account had.
 */
export async function restoreSession(): Promise<UserDto | null> {
  const refreshed = await refreshAccessToken();
  if (!refreshed.ok) {
    tokenStore.set(null);
    return null;
  }
  try {
    return await http.get<UserDto>('/auth/me');
  } catch {
    tokenStore.set(null);
    return null;
  }
}

/**
 * Invalidate the session server-side, then clear the in-memory token.
 *
 * Throws when the API did not confirm it. This used to be best-effort, which
 * meant a laptop with no network showed "Deconectare" and a login screen while
 * the session it was supposed to have ended stayed open on the server — the one
 * case where the panel must not say a thing it has not verified.
 */
export async function logout(): Promise<void> {
  await http.post<void>('/auth/logout');
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
