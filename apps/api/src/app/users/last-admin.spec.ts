/**
 * The rule that keeps somebody able to administer the practice.
 *
 * `/users` is admin-only and registration is closed, so the active admins are
 * the only people who can create, promote or reactivate anyone. Audit A5 (F1)
 * found nothing defending that set: the single admin account could demote or
 * deactivate itself, and the way back is a psql prompt on the production host.
 */
import { Role } from '../../generated/prisma/enums';
import { refuseAccountChange, type AccountState } from './last-admin';

const ADMIN: AccountState = { id: 'a1', role: Role.admin, isActive: true };
const OTHER_ADMIN: AccountState = {
  id: 'a2',
  role: Role.admin,
  isActive: true,
};
const EDITOR: AccountState = { id: 'e1', role: Role.editor, isActive: true };
const RETIRED_ADMIN: AccountState = {
  id: 'a3',
  role: Role.admin,
  isActive: false,
};

describe('refuseAccountChange', () => {
  it('lets an ordinary edit through', () => {
    // A rename carries neither a role nor an active flag, so it never reaches
    // the counting at all.
    expect(refuseAccountChange('a1', 'e1', {}, [ADMIN, EDITOR])).toBeNull();
  });

  it('refuses an admin demoting herself, even with another admin around', () => {
    expect(
      refuseAccountChange('a1', 'a1', { role: Role.editor }, [
        ADMIN,
        OTHER_ADMIN,
      ]),
    ).toBe('cannot_demote_self');
  });

  it('refuses an admin deactivating herself, even with another admin around', () => {
    expect(
      refuseAccountChange('a1', 'a1', { isActive: false }, [
        ADMIN,
        OTHER_ADMIN,
      ]),
    ).toBe('cannot_deactivate_self');
  });

  it('lets an admin edit her own name and reassert her own role', () => {
    expect(
      refuseAccountChange('a1', 'a1', { role: Role.admin, isActive: true }, [
        ADMIN,
      ]),
    ).toBeNull();
  });

  it('refuses demoting the last admin', () => {
    expect(
      refuseAccountChange('a2', 'a1', { role: Role.editor }, [ADMIN, EDITOR]),
    ).toBe('last_admin');
  });

  it('refuses deactivating the last admin', () => {
    expect(
      refuseAccountChange('a2', 'a1', { isActive: false }, [ADMIN, EDITOR]),
    ).toBe('last_admin');
  });

  it('allows demoting an admin while another active one remains', () => {
    expect(
      refuseAccountChange('a2', 'a1', { role: Role.editor }, [
        ADMIN,
        OTHER_ADMIN,
      ]),
    ).toBeNull();
  });

  it('does not count a deactivated admin as cover', () => {
    // The account exists and says `admin`, and it cannot log in. Counting it
    // would leave the practice locked out while the list looked fine.
    expect(
      refuseAccountChange('a3', 'a1', { role: Role.editor }, [
        ADMIN,
        RETIRED_ADMIN,
      ]),
    ).toBe('last_admin');
  });

  it('allows promoting an editor, which is how the corner is escaped', () => {
    expect(
      refuseAccountChange('a1', 'e1', { role: Role.admin }, [ADMIN, EDITOR]),
    ).toBeNull();
  });

  it('says nothing about an account that is not there', () => {
    // The caller has already answered 404; this must not shadow it with a 409.
    expect(
      refuseAccountChange('a1', 'gone', { role: Role.editor }, [ADMIN]),
    ).toBeNull();
  });
});
