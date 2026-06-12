import type { UserDto } from '@olesia/shared';
import type { User } from '../../generated/prisma/client';

/** Maps a User row to its public DTO (never exposes `passwordHash`). */
export function toUserDto(u: User): UserDto {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserDto['role'],
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}
