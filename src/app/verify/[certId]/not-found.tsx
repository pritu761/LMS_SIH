import Link from 'next/link';

/** 404 for unknown /verify/[certId] verification IDs. */
export default function VerifyNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="rounded-2xl bg-[#0b1e36]/5 px-4 py-2 font-mono text-2xl font-black text-[#0b1e36] dark:bg-white/10 dark:text-white">
        404
      </span>
      <h1 className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">Certificate not found</h1>
      <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        No credential matches this verification ID. Check the QR link or the ID printed on the certificate.
      </p>
      <Link
        href="/catalog"
        className="mt-2 rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] focus-visible:ring-offset-2 dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
