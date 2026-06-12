import type { Role } from '@/types';

/**
 * Back-office user accounts.
 *
 * TODO(shared): replace with DTOs/enums from `packages/shared` once it exists —
 * mirrors the `User` model in module_calendly.md §4. `password_hash` is never
 * exposed to the front end.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

/** Admin creates a user with a starter password. */
export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  password: string;
}

/** Editable profile fields (email is immutable; password via reset). */
export interface UpdateUserInput {
  name: string;
  role: Role;
}

export type RoleFilter = 'all' | Role;
