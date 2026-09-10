/**
 * Which seed profile to run, and the guards that stand between a production
 * database and a default password.
 *
 * `dev` is the default because the seed is run far more often on a laptop than
 * on a server, and a laptop that gets the production profile by accident only
 * loses demo content. The reverse mistake — a server quietly seeded with
 * `admin12345` and the interim FAQ — is the one worth an exception.
 */

export type SeedProfile = 'dev' | 'prod';

export interface SeedAdmin {
  email: string;
  password: string;
}

export interface ResolvedSeed {
  profile: SeedProfile;
  admin: SeedAdmin | null;
}

export class SeedConfigError extends Error {}

function present(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveSeedProfile(env: NodeJS.ProcessEnv): ResolvedSeed {
  const raw = present(env.SEED_PROFILE) ?? 'dev';

  if (raw === 'dev') {
    return { profile: 'dev', admin: null };
  }

  if (raw !== 'prod') {
    throw new SeedConfigError(
      `SEED_PROFILE must be "dev" or "prod", got "${raw}".`,
    );
  }

  const email = present(env.ADMIN_EMAIL);
  const password = present(env.ADMIN_PASSWORD);

  if (email === null || password === null) {
    const missing = [
      email === null ? 'ADMIN_EMAIL' : null,
      password === null ? 'ADMIN_PASSWORD' : null,
    ].filter((name): name is string => name !== null);

    throw new SeedConfigError(
      `SEED_PROFILE=prod requires ${missing.join(' and ')}. ` +
        'The production seed will not invent an administrator password. ' +
        'Set it and run the seed again.',
    );
  }

  return {
    profile: 'prod',
    admin: { email: email.toLowerCase(), password },
  };
}
