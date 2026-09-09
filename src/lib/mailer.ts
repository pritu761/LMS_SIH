import { NextResponse } from 'next/server';

// ============================================================================
// Outbound mail (Phase 1.5A/D). Provider-agnostic: uses Resend when
// RESEND_API_KEY is configured, otherwise logs in development and reports
// { sent: false }. User-facing mail is ALWAYS mirrored as an in-app
// Notification by the caller, so no message is ever lost in dev mode.
// Required env (prod): RESEND_API_KEY, RESEND_FROM (optional).
// ============================================================================

export interface MailInput {
  to: string;
  subject: string;
  text: string;
}

export interface MailResult {
  sent: boolean;
  provider: 'resend' | 'none' | 'resend-error';
  detail?: string;
}

/**
 * Send a transactional email. Never throws — callers treat delivery as
 * best-effort and rely on in-app notifications for guaranteed reach.
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[mailer:dev] to=${input.to} subject=${input.subject}\n${input.text.slice(0, 400)}`);
    }
    return { sent: false, provider: 'none', detail: 'No mail provider configured (RESEND_API_KEY).' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? 'CapacityConnect <onboarding@resend.dev>',
        to: input.to,
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { sent: false, provider: 'resend-error', detail: detail.slice(0, 300) };
    }
    return { sent: true, provider: 'resend' };
  } catch (err) {
    return { sent: false, provider: 'resend-error', detail: err instanceof Error ? err.message : 'Mail send failed.' };
  }
}

/** Generate a one-time temporary password (12 alphanumeric chars). */
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
