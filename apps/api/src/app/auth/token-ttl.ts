/**
 * Turn a JWT lifetime (`15m`, `7d`, `900`) into milliseconds.
 *
 * The refresh cookie has to expire exactly when the token inside it does. They
 * used to be two independent constants, so changing `JWT_REFRESH_TTL` left the
 * cookie either outliving a dead token or throwing away a live one.
 */
export function ttlToMs(ttl: string): number {
  const match = /^(\d+)\s*(s|m|h|d)?$/.exec(ttl.trim());
  if (!match) {
    throw new Error(
      `Unsupported token lifetime "${ttl}". Use a number of seconds or a value like 15m, 24h, 7d.`,
    );
  }
  const factors: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return Number(match[1]) * factors[match[2] ?? 's'];
}
