/**
 * `normalizePatientEmail` is the dedup key for a medical record, so the cases
 * that used to merge two people are the cases worth pinning (audit A3, F4/F12).
 */
import { normalizePatientEmail } from './patient-email';

describe('normalizePatientEmail', () => {
  it('lower-cases, so one address cannot become two dossiers', () => {
    expect(normalizePatientEmail('Ana@Gmail.com')).toBe('ana@gmail.com');
    expect(normalizePatientEmail('ANA@GMAIL.COM')).toBe('ana@gmail.com');
  });

  it('trims the whitespace a pasted address arrives with', () => {
    expect(normalizePatientEmail('  ana@gmail.com \n')).toBe('ana@gmail.com');
    expect(normalizePatientEmail('\tAna@Gmail.com  ')).toBe('ana@gmail.com');
  });

  it('reads an empty address as no address, never as a key', () => {
    // A Calendly booking with no email arrives as '', and `String @unique`
    // accepts it — which is how every anonymous lead ended up on one dossier.
    expect(normalizePatientEmail('')).toBeNull();
    expect(normalizePatientEmail('   ')).toBeNull();
  });

  it('treats a missing value the same as an empty one', () => {
    expect(normalizePatientEmail(null)).toBeNull();
    expect(normalizePatientEmail(undefined)).toBeNull();
  });

  it('leaves an ordinary address alone', () => {
    expect(normalizePatientEmail('ana@gmail.com')).toBe('ana@gmail.com');
  });
});
