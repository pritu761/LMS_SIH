/**
 * Loading state for the trainer directory.
 */
export default function TrainersLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading trainers">
      <div className="mx-auto h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
