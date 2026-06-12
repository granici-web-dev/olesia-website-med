import type { Role as SharedRole } from '@olesia/shared';

/**
 * Local view-model types. Enums/DTOs are sourced from `@olesia/shared`
 * (single source of truth). `Role` is the string-union projection of the
 * shared `Role` enum so components keep ergonomic literal comparisons.
 */

export type Role = `${SharedRole}`; // 'admin' | 'editor'

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
