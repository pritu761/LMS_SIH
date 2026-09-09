import { apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getWmoTagSuggestions } from '@/services/trainerService';

/**
 * GET /api/trainer/wmo-tags — competency tag suggestions for the studio
 * picker: distinct WMO rubric codes and domain codes from the competency
 * registry. Trainers may still enter free-text tags.
 */
export async function GET() {
  try {
    await requireTrainerSession();
    const suggestions = await getWmoTagSuggestions();
    return apiOk(suggestions);
  } catch (err) {
    return apiFail(err, 'TAGS_UNAVAILABLE');
  }
}
