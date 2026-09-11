/** Which way a headline number moved, and by how much. */
export interface MetricDelta {
  value: string;
  trend: 'up' | 'down' | 'flat';
}

/**
 * Period-over-period change for the appointments headline.
 *
 * With nothing in the previous period there is no percentage to state, so the
 * count itself is the honest answer. The one case that needs saying out loud
 * is zero against zero: "0" beside "+12 %" reads as twelve fewer appointments
 * rather than as no change, which is why it carries the unit.
 */
export function appointmentsDelta(
  total: number,
  previous: number,
): MetricDelta {
  if (previous === 0) {
    return total === 0
      ? { value: '0 %', trend: 'flat' }
      : { value: `+${total}`, trend: 'up' };
  }
  const pct = Math.round(((total - previous) / previous) * 100);
  return {
    value: `${pct > 0 ? '+' : ''}${pct}%`,
    trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  };
}
