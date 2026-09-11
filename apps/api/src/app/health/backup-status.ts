/**
 * Reading the file `docker/backup.sh` leaves behind after every run.
 *
 * Split out from the service because the decision it makes is arithmetic on a
 * timestamp and nothing else, and because the shape it parses comes from a
 * shell script rather than from the type system: the file is written by
 * another program, on another schedule, into a volume this process mounts
 * read-only.
 */

/**
 * How old the last successful backup may be before `/health` calls it a
 * failure. The nightly run is at 03:00 local, so 26 hours covers a run that
 * started late and a clock that drifted, and still catches the night one did
 * not happen at all.
 */
export const BACKUP_MAX_AGE_MS = 26 * 60 * 60 * 1000;

export type CheckResult = 'pass' | 'fail';

/**
 * `raw` is the file's contents. Anything other than "the last run said it
 * succeeded, recently" is a failure — including a file this cannot parse,
 * because a status file that has stopped being readable is a backup nobody
 * can vouch for.
 */
export function readBackupStatus(raw: string, now: Date): CheckResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'fail';
  }

  if (typeof parsed !== 'object' || parsed === null) return 'fail';

  const { ok, at } = parsed as { ok?: unknown; at?: unknown };
  if (ok !== true || typeof at !== 'string') return 'fail';

  const ranAt = Date.parse(at);
  if (Number.isNaN(ranAt)) return 'fail';

  return now.getTime() - ranAt <= BACKUP_MAX_AGE_MS ? 'pass' : 'fail';
}
