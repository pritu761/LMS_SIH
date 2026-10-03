/**
 * Loading state for /catalog — skeleton cards matching the track-card layout.
 */
export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading catalog">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto h-3 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mx-auto mt-4 h-9 w-3/4 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mx-auto mt-3 h-4 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
      </div>
      <div className="mx-auto mt-10 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
        <div className="hidden h-96 animate-pulse rounded-2xl bg-slate-100 lg:block dark:bg-white/5" />
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
