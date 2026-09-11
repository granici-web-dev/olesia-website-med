/**
 * Runs before every back-office spec.
 *
 * The panel formats dates and money through `Intl` with a fixed `ro-RO`
 * locale, so the only thing a test environment can change under it is the
 * time zone: `new Date('2026-09-11T08:00:00Z')` prints a different hour in
 * Chișinău than on a CI runner set to UTC. Pinning it here keeps a failing
 * assertion about a formatter a real failure rather than a passport check.
 */
process.env.TZ = 'Europe/Chisinau';
