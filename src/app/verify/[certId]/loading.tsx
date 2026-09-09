/**
 * Loading state for /verify/[certId].
 */
export default function VerifyLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6" aria-busy="true" aria-label="Verifying certificate">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 rounded-3xl border border-slate-200 p-8 dark:border-white/10">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mx-auto mt-4 h-7 w-2/3 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mx-auto mt-3 h-6 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
        <div className="mx-auto mt-6 max-w-md space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
