import * as React from 'react';

/**
 * A value that settles before anyone acts on it.
 *
 * The patient search runs on the server, so every keystroke would otherwise be
 * a query against the dossier table. Three hundred milliseconds is about the
 * gap between words when someone is typing a name.
 */
export function useDebounced<T>(value: T, delayMs = 300): T {
  const [settled, setSettled] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
