import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getUserPrefs } from '@/lib/notify';
import { PreferencesForm } from '@/components/notifications/PreferencesForm';
import { NOTIFICATION_TYPE_LABELS } from '@/app/api/notifications/preferences/labels';

export const metadata = { title: 'Notification Preferences' };

/**
 * GET /notifications/preferences — authenticated delivery preferences
 * (own row): per-type email + in-app toggles honored by the dispatcher.
 */
export default async function PreferencesPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/notifications/preferences');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const prefs = await getUserPrefs(session.userId);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/notifications"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All notifications
        </Link>
      </nav>
      <header className="mt-3 flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
          <Settings2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Notification preferences</h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">Email needs a configured provider; in-app always works</p>
        </div>
      </header>
      <div className="mt-5">
        <PreferencesForm initialEmail={prefs.email} initialInApp={prefs.inApp} types={NOTIFICATION_TYPE_LABELS} />
      </div>
    </div>
  );
}
