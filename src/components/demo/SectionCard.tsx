import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Shared dashboard card shell for demo dashboards (also reusable by the
 * future real dashboards): icon + title header with an optional action slot.
 */
export function SectionCard({ icon: Icon, title, subtitle, action, children, className = '' }: SectionCardProps) {
  return (
    <section
      aria-label={title}
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60 ${className}`}
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </span>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
