import { useEffect, useState } from 'react';

export function useRememberedFilter(key: string, enabled: boolean) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(key) ?? '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (enabled) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  }, [enabled, key, value]);

  return [value, setValue] as const;
}
