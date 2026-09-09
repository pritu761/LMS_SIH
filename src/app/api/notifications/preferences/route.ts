import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiError, apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import { getUserPrefs } from '@/lib/notify';
import prisma from '@/lib/prisma';
import { NOTIFICATION_TYPE_LABELS } from './labels';

const prefsSchema = z.object({
  email: z.record(z.boolean()).default({}),
  inApp: z.record(z.boolean()).default({}),
});

/**
 * GET /api/notifications/preferences — authenticated (own row). Per-type
 * email + in-app toggles (all-on by default) with human labels.
 *
 * PUT — replaces the toggle maps (unknown keys ignored, max 40 entries).
 */
export async function GET() {
  try {
    const session = await requireAssistantSession();
    const prefs = await getUserPrefs(session.userId);
    return apiOk({ email: prefs.email, inApp: prefs.inApp, types: NOTIFICATION_TYPE_LABELS });
  } catch (err) {
    return apiFail(err, 'PREFS_UNAVAILABLE');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAssistantSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = prefsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Preferences payload is invalid.');
    }
    const clean = (map: Record<string, boolean>) => {
      const out: Record<string, boolean> = {};
      for (const key of Object.keys(NOTIFICATION_TYPE_LABELS)) {
        if (typeof map[key] === 'boolean') out[key] = map[key];
      }
      return out;
    };
    const email = clean(parsed.data.email);
    const inApp = clean(parsed.data.inApp);
    await prisma.notificationPreference.upsert({
      where: { userId: session.userId },
      update: { emailEnabled: email, inAppEnabled: inApp },
      create: { userId: session.userId, emailEnabled: email, inAppEnabled: inApp },
    });
    return apiOk({ email, inApp });
  } catch (err) {
    return apiFail(err, 'PREFS_UNAVAILABLE');
  }
}
