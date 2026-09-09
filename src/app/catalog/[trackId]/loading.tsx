/**
 * Loading state for /catalog/[trackId] (also covers the preview page).
 */
export default function TrackDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading track">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 rounded-3xl border border-slate-200 p-6 sm:p-8 dark:border-white/10">
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
        </div>
        <div className="mt-4 h-9 w-3/4 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
