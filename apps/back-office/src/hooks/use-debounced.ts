import * as React from 'react';

/**
 * A value that settles before anyone acts on it.
 *
 * The patient search runs on the server, so every keystroke would otherwise be
 * a query against the dossier table. Three hundred milliseconds is about the
 * gap between words when someone is typing a name.
 */
const SETTLE_MS = 300;

export function useDebounced<T>(value: T): T {
  const [settled, setSettled] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(value), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  return settled;
}
