import type { Role } from '../../generated/prisma/enums';

/** Decoded access-token claims. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Decoded refresh-token claims (carried in the httpOnly cookie). `jti` is the
 * id of the `RefreshSession` row, which is what makes the token revocable.
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

/** The authenticated principal attached to the request by JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
