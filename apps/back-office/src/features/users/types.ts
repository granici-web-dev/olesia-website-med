import type { Role } from '@/types';

/**
 * Back-office user accounts.
 *
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 * Mirrors the `User` model in module_calendly.md §4; `password_hash` is never
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
