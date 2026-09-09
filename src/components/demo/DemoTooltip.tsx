import type { ReactNode } from 'react';

interface DemoTooltipProps {
  tip: string;
  children: ReactNode;
}

/**
 * Accessible tooltip for disabled demo actions: visible on hover AND
 * keyboard focus, with the same message always available as adjacent text.
 */
export function DemoTooltip({ tip, children }: DemoTooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-center text-[11px] font-semibold leading-snug text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-black dark:ring-1 dark:ring-white/20"
      >
        {tip}
      </span>
    </span>
  );
}
