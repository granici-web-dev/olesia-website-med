/**
 * Who is allowed to change what about a back-office account.
 *
 * Registration is closed and `/users` is admin-only, so the set of people who
 * can reach the user list is the set of active admins. Audit A5 (F1) found
 * nothing defending that set: an admin could demote herself to editor, or
 * deactivate herself, and the practice was left with a database nobody could
 * administer — no self-service recovery, no second admin to undo it, and the
 * way back is a psql prompt on the production host.
 *
 * The rule lives here as a pure function over the account list because that is
 * the only way to test the decision without a database (`TESTING.md`), and
 * because "the last admin" is arithmetic, not a query.
 */
import { Role } from '../../generated/prisma/enums';

/** The two columns the rule reads, on every account. */
export interface AccountState {
  id: string;
  role: Role;
  isActive: boolean;
}

/** What `PATCH /users/:id` may change. */
export interface AccountChange {
  role?: Role;
  isActive?: boolean;
}

/**
 * Machine codes, answered as 409. Distinct because they are three different
 * conversations with the operator: two are "not on yourself", one is "not at
 * all until somebody else can do this job".
 */
export type AccountChangeRefusal =
  'cannot_demote_self' | 'cannot_deactivate_self' | 'last_admin';

function isActiveAdmin(account: AccountState): boolean {
  return account.role === Role.admin && account.isActive;
}

/**
 * Why this change must be refused, or `null` when it may go through.
 *
 * `accounts` is every account as it stands now, including the target. The
 * caller reads it under a lock and writes in the same transaction, because
 * two admins demoting each other at the same moment would otherwise both see
 * the other as the survivor.
 */
export function refuseAccountChange(
  actorId: string,
  targetId: string,
  change: AccountChange,
  accounts: AccountState[],
): AccountChangeRefusal | null {
  const target = accounts.find((a) => a.id === targetId);
  if (!target) return null;

  const demoting = change.role !== undefined && change.role !== target.role;
  const deactivating = change.isActive === false && target.isActive;

  // Refused on oneself whether or not another admin exists. An admin who
  // demotes herself by accident cannot undo it, and saying "there is another
  // admin, go ask them" is a worse answer than not doing it.
  if (targetId === actorId) {
    if (demoting && change.role === Role.editor) return 'cannot_demote_self';
    if (deactivating) return 'cannot_deactivate_self';
  }

  if (!demoting && !deactivating) return null;

  const after = accounts.map((account) =>
    account.id === targetId
      ? {
          ...account,
          role: change.role ?? account.role,
          isActive: change.isActive ?? account.isActive,
        }
      : account,
  );
  return after.some(isActiveAdmin) ? null : 'last_admin';
}
