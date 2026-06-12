import type { Paginated, UserDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from '@/features/users/types';
import type { Role } from '@/types';

/** Real `users` endpoints (module_calendly.md §4) — admin only. */

function toView(d: UserDto): User {
  return {
    id: d.id,
    email: d.email,
    name: d.name,
    role: String(d.role) as Role,
    isActive: d.isActive,
    createdAt: d.createdAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchUsers(): Promise<User[]> {
  const r = await http.get<UserDto[] | Paginated<UserDto>>(
    '/users?pageSize=200',
  );
  return asList(r).map(toView);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return toView(await http.post<UserDto>('/users', input));
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  return toView(await http.patch<UserDto>(`/users/${id}`, input));
}

export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<User> {
  return toView(await http.patch<UserDto>(`/users/${id}`, { isActive }));
}

export async function resetPassword(id: string): Promise<string> {
  const r = await http.post<{ password: string }>(
    `/users/${id}/reset-password`,
  );
  return r.password;
}
