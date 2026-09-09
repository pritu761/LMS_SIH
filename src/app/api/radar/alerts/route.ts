import { apiFail, apiOk } from '@/lib/api-helpers';
import { getActiveAlerts } from '@/lib/radarAlerts';

/**
 * GET /api/radar/alerts — public. Active color-coded warnings (RED /
 * ORANGE / YELLOW) with district, validity and phenomenon. Currently served
 * from a realistic mock feed (source: "mock"); wire the IMD warnings API
 * into getActiveAlerts() for production — the contract is stable.
 */
export async function GET() {
  try {
    const feed = getActiveAlerts();
    return apiOk(feed);
  } catch (err) {
    return apiFail(err, 'ALERTS_UNAVAILABLE');
  }
}
