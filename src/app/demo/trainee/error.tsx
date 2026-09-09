'use client';

import { DemoError } from '@/components/demo/DemoError';

/** Error boundary for /demo/trainee. */
export default function DemoTraineeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DemoError error={error} reset={reset} backHref="/demo" backLabel="Back to demos" />;
}
