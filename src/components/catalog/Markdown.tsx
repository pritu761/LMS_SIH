import ReactMarkdown, { type Components } from 'react-markdown';

/**
 * Gov-styled Markdown renderer for published lesson content.
 * Maps Markdown elements onto the CapacityConnect navy/gold Tailwind theme
 * (light + dark). Rendered HTML is produced by react-markdown (no
 * dangerouslySetInnerHTML), so lesson bodies stay XSS-safe.
 */
const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-display text-2xl font-extrabold text-[#0b1e36] sm:text-3xl dark:text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-8 text-xl font-extrabold text-[#0b1e36] dark:text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display mt-6 text-lg font-extrabold text-[#0b1e36] dark:text-white">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-200">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-200">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-200">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 rounded-r-xl border-l-4 border-[#c59b48] bg-[#c59b48]/10 px-4 py-3 text-sm italic text-slate-700 dark:text-slate-200">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0b1e36] p-4 font-mono text-sm leading-relaxed text-slate-100 dark:bg-black/40">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
      className="font-semibold text-[#9a7224] underline decoration-[#c59b48]/60 underline-offset-2 hover:text-[#0b1e36] dark:text-[#dfb76c] dark:hover:text-white"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-bold text-[#0b1e36] dark:text-white">{children}</strong>,
  hr: () => <hr className="my-8 border-slate-200 dark:border-white/10" />,
};

export function Markdown({ content }: { content: string }) {
  return <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>;
}
