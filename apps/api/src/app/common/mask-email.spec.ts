import { maskEmail } from './mask-email';

describe('maskEmail', () => {
  it('keeps the first character and the domain', () => {
    expect(maskEmail('ana@gmail.com')).toBe('a***@gmail.com');
  });

  it('reveals nothing when there is no local part to mask', () => {
    // '@x.md' would otherwise mask to '@***@x.md' and leak the shape.
    expect(maskEmail('@example.md')).toBe('***');
  });

  it('reveals nothing for a value that is not an address', () => {
    expect(maskEmail('not-an-address')).toBe('***');
    expect(maskEmail('')).toBe('***');
  });

  it('masks a one-character local part the same as any other', () => {
    // The mask cannot hide a local part that is a single character; what it
    // must not do is fail or expand it.
    expect(maskEmail('a@b.md')).toBe('a***@b.md');
  });

  it('masks every character but the first, however long the address', () => {
    expect(maskEmail('olesea.jalba.pediatru@example.md')).toBe(
      'o***@example.md',
    );
  });
});
