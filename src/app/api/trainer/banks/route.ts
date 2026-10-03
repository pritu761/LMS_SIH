import { apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { listBanks } from '@/services/trainerService';

/**
 * GET /api/trainer/banks — question banks with question counts and an
 * ownership flag for the caller (used by the bank picker + delete guards).
 */
export async function GET() {
  try {
    const session = await requireTrainerSession();
    const banks = await listBanks(session.userId);
    return apiOk({ banks });
  } catch (err) {
    return apiFail(err, 'BANKS_UNAVAILABLE');
  }
}
