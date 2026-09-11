/**
 * The EXPRESS promise as a duration, in Romanian — the back office's only
 * language.
 *
 * It exists because the tickets table used to print "Termen (48 h)" while the
 * schedule page next to it edited `expressSlaMinutes`, so the column header and
 * the deadlines under it disagreed the moment anybody changed the number. 48 h
 * was the figure from the original spec; the default has been one working hour
 * since the schedule module landed.
 *
 * Same rule as the public site's `formatSla`: minutes below an hour stay
 * minutes, a whole number of hours reads as hours, and anything in between
 * stays in minutes rather than becoming "1,5 ore", which nobody says about a
 * deadline.
 */
export function formatSla(minutes: number): string {
  // Zero is a value the schedule page accepts, and it means "as soon as it
  // arrives". "~0 min" states arithmetic where the doctor meant a promise.
  if (minutes <= 0) return 'imediat';
  if (minutes % 60 !== 0 || minutes < 60) return `~${minutes} min`;
  const hours = minutes / 60;
  return `~${hours} ${hours === 1 ? 'oră' : 'ore'}`;
}
