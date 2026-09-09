'use client';

import { DemoError } from '@/components/demo/DemoError';

/** Error boundary for /demo/admin. */
export default function DemoAdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DemoError error={error} reset={reset} backHref="/demo" backLabel="Back to demos" />;
}
