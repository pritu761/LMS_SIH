/**
 * Loading state for the exam shell.
 */
export default function ExamLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10" aria-busy="true" aria-label="Loading exam">
      <div className="h-9 w-2/3 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
    </div>
  );
}
