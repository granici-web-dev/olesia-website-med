import { generateStarterPassword } from './starter-password';

const ALPHABET =
  /^[abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;

describe('generateStarterPassword', () => {
  it('is twelve characters from the unambiguous alphabet', () => {
    const password = generateStarterPassword();
    expect(password).toHaveLength(12);
    expect(password).toMatch(ALPHABET);
  });

  it('does not repeat itself across a thousand accounts', () => {
    // A weak generator shows up here first: this is what caught Math.random
    // being used for a credential.
    const seen = new Set(
      Array.from({ length: 1000 }, () => generateStarterPassword()),
    );
    expect(seen.size).toBe(1000);
  });
});
