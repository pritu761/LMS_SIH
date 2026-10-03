'use client';

import { useState } from 'react';
import { Mail, Smartphone } from 'lucide-react';

interface PrefsProps {
  initialEmail: Record<string, boolean>;
  initialInApp: Record<string, boolean>;
  types: Record<string, string>;
}

/**
 * Per-type delivery preferences: email and in-app toggles. Saved to the
 * caller's NotificationPreference row; the dispatcher honors both.
 */
export function PreferencesForm({ initialEmail, initialInApp, types }: PrefsProps) {
  const [email, setEmail] = useState<Record<string, boolean>>(initialEmail);
  const [inApp, setInApp] = useState<Record<string, boolean>>(initialInApp);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inApp }),
      });
      const body = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Save failed.');
      setMessage('Preferences saved — future notifications follow these toggles.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) => setter((m) => ({ ...m, [key]: !(m[key] !== false) }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-black/20 dark:text-slate-400">
        <span>Notification type</span>
        <span className="flex items-center justify-center gap-1"><Mail className="h-3 w-3" aria-hidden="true" />Mail</span>
        <span className="flex items-center justify-center gap-1"><Smartphone className="h-3 w-3" aria-hidden="true" />App</span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-white/10">
        {Object.entries(types).map(([key, label]) => (
          <li key={key} className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 px-4 py-2.5">
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
              <span className="block font-mono text-[10px] text-slate-500">{key}</span>
            </span>
            <span className="flex justify-center">
              <input
                type="checkbox"
                checked={email[key] !== false}
                onChange={() => toggle(setEmail, key)}
                aria-label={`Email for ${label}`}
                className="h-4 w-4 accent-[#c59b48]"
              />
            </span>
            <span className="flex justify-center">
              <input
                type="checkbox"
                checked={inApp[key] !== false}
                onChange={() => toggle(setInApp, key)}
                aria-label={`In-app for ${label}`}
                className="h-4 w-4 accent-[#c59b48]"
              />
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-3.5 dark:border-white/10">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
        {message && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400" aria-live="polite">{message}</p>
        )}
      </div>
    </div>
  );
}
