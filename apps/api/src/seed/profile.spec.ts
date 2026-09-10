import { resolveSeedProfile, SeedConfigError } from './profile';

/**
 * These six cases are the only thing standing between a production database and
 * an administrator account with a password nobody chose. The seed itself needs a
 * database and is out of scope here; the decision it makes first is not.
 */

describe('resolveSeedProfile', () => {
  it('defaults to dev when SEED_PROFILE is unset', () => {
    expect(resolveSeedProfile({})).toEqual({ profile: 'dev', admin: null });
  });

  it('resolves prod when both admin variables are set', () => {
    expect(
      resolveSeedProfile({
        SEED_PROFILE: 'prod',
        ADMIN_EMAIL: 'Doctor@Example.MD',
        ADMIN_PASSWORD: 'a-real-password',
      }),
    ).toEqual({
      profile: 'prod',
      admin: { email: 'doctor@example.md', password: 'a-real-password' },
    });
  });

  it('refuses prod without ADMIN_PASSWORD, and names it', () => {
    expect(() =>
      resolveSeedProfile({ SEED_PROFILE: 'prod', ADMIN_EMAIL: 'a@b.md' }),
    ).toThrow(/ADMIN_PASSWORD/);
  });

  it('refuses prod without ADMIN_EMAIL, and names it', () => {
    expect(() =>
      resolveSeedProfile({ SEED_PROFILE: 'prod', ADMIN_PASSWORD: 'x' }),
    ).toThrow(/ADMIN_EMAIL/);
  });

  it('treats a blank ADMIN_PASSWORD as missing', () => {
    expect(() =>
      resolveSeedProfile({
        SEED_PROFILE: 'prod',
        ADMIN_EMAIL: 'a@b.md',
        ADMIN_PASSWORD: '   ',
      }),
    ).toThrow(SeedConfigError);
  });

  it('refuses an unknown profile rather than falling back to dev', () => {
    expect(() => resolveSeedProfile({ SEED_PROFILE: 'staging' })).toThrow(
      /"dev" or "prod"/,
    );
  });
});
