import type { Role } from '../../generated/prisma/enums';

/** Decoded access-token claims. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Decoded refresh-token claims (carried in the httpOnly cookie). */
export interface RefreshTokenPayload {
  sub: string;
}

/** The authenticated principal attached to the request by JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
