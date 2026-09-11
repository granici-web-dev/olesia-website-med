/**
 * `/health` reports whether the database was backed up last night, and this
 * function is the whole of that decision. It exists because the alternative
 * was a line in a rotated container log: a backup that stopped running was
 * discoverable only by someone who went looking (audit A11, H1 and H4).
 *
 * The file is written by `docker/backup.sh` — a shell script, in another
 * container, on another schedule — so everything here is about refusing to
 * believe a file that does not say what it should.
 */
import { BACKUP_MAX_AGE_MS, readBackupStatus } from './backup-status';

const NOW = new Date('2026-09-11T09:00:00.000Z');

function statusFile(fields: Record<string, unknown>): string {
  return JSON.stringify(fields);
}

describe('readBackupStatus', () => {
  it('passes a successful run from this morning', () => {
    const raw = statusFile({
      at: '2026-09-11T00:00:03Z',
      ok: true,
      dbBytes: 412_233,
      filesBytes: 9_120_004,
      error: null,
    });

    expect(readBackupStatus(raw, NOW)).toBe('pass');
  });

  it('fails a run that reported an error, however recent', () => {
    const raw = statusFile({
      at: '2026-09-11T08:59:00Z',
      ok: false,
      dbBytes: 0,
      filesBytes: 0,
      error: 'the dump has no completion trailer, so it is truncated',
    });

    expect(readBackupStatus(raw, NOW)).toBe('fail');
  });

  it('passes at the age limit and fails a second past it', () => {
    const atLimit = new Date(NOW.getTime() - BACKUP_MAX_AGE_MS).toISOString();
    const pastLimit = new Date(
      NOW.getTime() - BACKUP_MAX_AGE_MS - 1000,
    ).toISOString();

    expect(readBackupStatus(statusFile({ at: atLimit, ok: true }), NOW)).toBe(
      'pass',
    );
    expect(readBackupStatus(statusFile({ at: pastLimit, ok: true }), NOW)).toBe(
      'fail',
    );
  });

  it('catches one missed night by the following morning', () => {
    // The nightly run is 03:00 Chișinău, which is 00:00 UTC. The window has to
    // be long enough that last night's run still reads as a pass through the
    // working day, and short enough that a night with no run at all is a
    // failure before the practice opens the morning after.
    const lastNight = '2026-09-11T00:00:00Z';
    const theNightBefore = '2026-09-10T00:00:00Z';

    expect(readBackupStatus(statusFile({ at: lastNight, ok: true }), NOW)).toBe(
      'pass',
    );
    expect(
      readBackupStatus(statusFile({ at: theNightBefore, ok: true }), NOW),
    ).toBe('fail');
  });

  it('fails a file it cannot parse rather than assuming the best', () => {
    expect(readBackupStatus('', NOW)).toBe('fail');
    expect(readBackupStatus('{"at": "2026-09-11T00:00:03Z", "ok"', NOW)).toBe(
      'fail',
    );
    expect(readBackupStatus('null', NOW)).toBe('fail');
    expect(readBackupStatus('"ok"', NOW)).toBe('fail');
  });

  it('fails a file missing the two fields it reads', () => {
    expect(readBackupStatus(statusFile({ ok: true }), NOW)).toBe('fail');
    expect(
      readBackupStatus(statusFile({ at: '2026-09-11T00:00:03Z' }), NOW),
    ).toBe('fail');
    expect(
      readBackupStatus(statusFile({ at: 'last tuesday', ok: true }), NOW),
    ).toBe('fail');
  });

  it('does not accept a truthy value in place of ok', () => {
    // `ok` is written as a JSON literal by a shell script that builds the
    // document with printf. A quoted "false" is exactly the kind of thing that
    // would slip through a loose check, and it would read as a healthy backup.
    expect(
      readBackupStatus(
        statusFile({ at: '2026-09-11T00:00:03Z', ok: 'false' }),
        NOW,
      ),
    ).toBe('fail');
    expect(
      readBackupStatus(statusFile({ at: '2026-09-11T00:00:03Z', ok: 1 }), NOW),
    ).toBe('fail');
  });
});
