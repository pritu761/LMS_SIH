'use client';

import { DemoError } from '@/components/demo/DemoError';

/** Error boundary for /demo. */
export default function DemoHubError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DemoError error={error} reset={reset} backHref="/" backLabel="Back to home" />;
}
