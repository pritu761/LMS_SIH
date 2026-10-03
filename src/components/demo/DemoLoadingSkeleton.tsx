/**
 * Shared skeleton for /demo loading states (static pages load instantly;
 * this covers slow networks and segment transitions).
 */
export function DemoLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading demo">
      <div className="h-11 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="mt-6 h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
