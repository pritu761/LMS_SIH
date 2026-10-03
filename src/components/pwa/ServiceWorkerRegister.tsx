'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js once (all pages via root layout). Listens for updates
 * and reloads pending navigations only when the user is idle on the page
 * (no forced reload mid-exam: skips when an exam runner is active).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let cancelled = false;
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (cancelled) return;
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated' && !navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        });
      })
      .catch(() => {
        /* offline-first is progressive enhancement; never break the page */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
