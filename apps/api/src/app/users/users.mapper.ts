import type { UserDto } from '@olesia/shared';
import type { User } from '../../generated/prisma/client';

/** Maps a User row to its public DTO (never exposes `passwordHash`, the TOTP
 *  secret or the recovery-code hashes — only whether 2FA is on). */
export function toUserDto(u: User): UserDto {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserDto['role'],
    isActive: u.isActive,
    totpEnabled: u.totpEnabled,
    mustChangePassword: u.mustChangePassword,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}
