import type { WeatherAlert } from '@/services/radarTypes';

// ============================================================================
// Active warnings feed (Phase 2.3E). MOCK dataset with realistic IMD-style
// color-coded warnings (district polygons are approximate bounding boxes).
// Production upgrade: replace getActiveAlerts() with the IMD warning API
// (CAP/XML feed) and map severity → RED/ORANGE/YELLOW here; the map, panel
// and Alert type need no changes.
// ============================================================================

export interface AlertFeed {
  alerts: WeatherAlert[];
  updatedAt: string;
  source: 'mock';
}

const NOW = Date.now();
const H = 3600000;
const iso = (t: number) => new Date(t).toISOString();

export const MOCK_ALERTS: WeatherAlert[] = [
  {
    id: 'AL-2026-0901',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.12,
    lng: 72.88,
    radiusKm: 45,
    severity: 'RED',
    phenomenon: 'Extremely heavy rainfall + squally winds 70–80 kmph',
    validFrom: iso(NOW - 2 * H),
    validTo: iso(NOW + 10 * H),
    description: 'Offshore trough with embedded convection. Suspend local train operations on low-lying sections; keep pumps on standby.',
  },
  {
    id: 'AL-2026-0902',
    district: 'Puri',
    state: 'Odisha',
    lat: 19.81,
    lng: 85.83,
    radiusKm: 60,
    severity: 'ORANGE',
    phenomenon: 'Very heavy rainfall, storm surge 1–2 m',
    validFrom: iso(NOW - 5 * H),
    validTo: iso(NOW + 18 * H),
    description: 'Low-pressure system over northwest Bay. Fishermen advised not to venture out; beach activities suspended.',
  },
  {
    id: 'AL-2026-0903',
    district: 'South Delhi',
    state: 'Delhi',
    lat: 28.55,
    lng: 77.2,
    radiusKm: 25,
    severity: 'YELLOW',
    phenomenon: 'Thunderstorm with gusty winds 50–60 kmph',
    validFrom: iso(NOW - 1 * H),
    validTo: iso(NOW + 5 * H),
    description: 'Pre-monsoon cell cluster moving east. Secure loose structures; expect brief power dips.',
  },
  {
    id: 'AL-2026-0904',
    district: 'Kochi',
    state: 'Kerala',
    lat: 9.97,
    lng: 76.28,
    radiusKm: 40,
    severity: 'ORANGE',
    phenomenon: 'Heavy rainfall, waterlogging in low areas',
    validFrom: iso(NOW - 3 * H),
    validTo: iso(NOW + 12 * H),
    description: 'Strengthening westerlies. District control room on orange readiness; schools in flood-prone wards closed.',
  },
  {
    id: 'AL-2026-0905',
    district: 'Guwahati',
    state: 'Assam',
    lat: 26.14,
    lng: 91.74,
    radiusKm: 50,
    severity: 'YELLOW',
    phenomenon: 'Moderate to heavy rainfall, lightning',
    validFrom: iso(NOW),
    validTo: iso(NOW + 9 * H),
    description: 'Moisture incursion from the Bay. Lightning safety drills advised for outdoor labor.',
  },
  {
    id: 'AL-2026-0906',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.08,
    lng: 80.27,
    radiusKm: 35,
    severity: 'YELLOW',
    phenomenon: 'Thunderstorm with heavy spells',
    validFrom: iso(NOW - 1 * H),
    validTo: iso(NOW + 6 * H),
    description: 'Offshore convective line. Storm-water drains cleared; metro services normal with advisories.',
  },
  {
    id: 'AL-2026-0907',
    district: 'Bhuj',
    state: 'Gujarat',
    lat: 23.29,
    lng: 69.67,
    radiusKm: 55,
    severity: 'ORANGE',
    phenomenon: 'Dust storm + thundershowers, visibility drop',
    validFrom: iso(NOW + 2 * H),
    validTo: iso(NOW + 14 * H),
    description: 'Dry-line interaction over Kutch. Highway patrols alerted; salt-pan workers moved to shelter.',
  },
  {
    id: 'AL-2026-0908',
    district: 'Srinagar',
    state: 'J&K',
    lat: 34.08,
    lng: 74.8,
    radiusKm: 45,
    severity: 'YELLOW',
    phenomenon: 'Hailstorm at isolated places, gusty winds',
    validFrom: iso(NOW + 4 * H),
    validTo: iso(NOW + 16 * H),
    description: 'Western disturbance approaching. Orchardists advised to activate hail nets.',
  },
];

export function getActiveAlerts(): AlertFeed {
  return { alerts: MOCK_ALERTS, updatedAt: new Date(NOW).toISOString(), source: 'mock' };
}
