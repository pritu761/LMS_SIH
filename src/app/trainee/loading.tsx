/**
 * Loading state for the trainee dashboard.
 */
export default function TraineeLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-12 w-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-5 space-y-5">
        {[380, 520, 440, 420, 300].map((h, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}
