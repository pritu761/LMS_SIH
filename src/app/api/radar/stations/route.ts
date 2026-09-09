import { apiFail, apiOk } from '@/lib/api-helpers';
import { getOpsStations } from '@/services/radarService';

/**
 * GET /api/radar/stations — public. The 38 IMD Doppler nodes with
 * non-sensitive spec metadata (position, band, range, latest dBZ) for the
 * operations overlay. No PII, no auth required.
 */
export async function GET() {
  try {
    return apiOk({ stations: getOpsStations() });
  } catch (err) {
    return apiFail(err, 'STATIONS_UNAVAILABLE');
  }
}
