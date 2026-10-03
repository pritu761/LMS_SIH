'use client';

import { useEffect, useState } from 'react';

/**
 * Return a debounced copy of `value` that only updates after `delayMs`
 * milliseconds without changes. Used for the catalog search input (300ms).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
