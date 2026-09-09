interface ProgressBarProps {
  label: string;
  detail?: string;
  percent: number;
  tone?: 'navy' | 'gold' | 'emerald' | 'rose' | 'sky';
}

const TONE_STYLES: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  navy: 'bg-[#0b1e36] dark:bg-[#c59b48]',
  gold: 'bg-[#c59b48]',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
};

/**
 * Labeled progress bar with screen-reader text (role=progressbar + values).
 */
export function ProgressBar({ label, detail, percent, tone = 'navy' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="shrink-0 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
          {detail ?? `${clamped}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
      >
        <div className={`h-full rounded-full transition-all ${TONE_STYLES[tone]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
