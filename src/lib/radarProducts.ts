import type { RadarProduct, RadarProductId } from '@/services/radarTypes';
import type { StormTrack } from '@/services/radarTypes';

// ============================================================================
// Dual-pol product metadata + synthetic field model (Phase 2.3B).
//
// Only Z (reflectivity) is a live mosaic. V/ZDR/KDP/CC/ET overlays are
// SYNTHESIZED from the storm-cell model (gaussian falloff + rotational
// couplets) for training: every simulated surface is badged as such in the
// UI, and cursor readouts report model values with units. When IMD product
// mosaics become available, replace fieldValue() with tile sampling.
// ============================================================================

export const RADAR_PRODUCTS: RadarProduct[] = [
  {
    id: 'Z',
    name: 'Reflectivity',
    unit: 'dBZ',
    live: true,
    description: 'Echo intensity from hydrometeors. Live mosaic tiles.',
    interpretation: 'Below 15 dBZ drizzle/virga • 35–50 moderate–heavy rain • above 55 hail likely.',
    steps: [
      { label: '<15', min: 0, max: 15, color: '#0ea5e9' },
      { label: '15–30', min: 15, max: 30, color: '#22c55e' },
      { label: '30–45', min: 30, max: 45, color: '#eab308' },
      { label: '45–55', min: 45, max: 55, color: '#f97316' },
      { label: '55+', min: 55, max: 80, color: '#ef4444' },
    ],
  },
  {
    id: 'V',
    name: 'Radial Velocity',
    unit: 'm/s',
    live: false,
    description: 'Motion toward/away from radar. Simulated couplet overlay.',
    interpretation: 'Tight inbound/outbound couplet = rotation. Folding beyond ±Nyquist needs dealiasing.',
    steps: [
      { label: '−48', min: -48, max: -24, color: '#16a34a' },
      { label: '−24', min: -24, max: -8, color: '#86efac' },
      { label: '0', min: -8, max: 8, color: '#e2e8f0' },
      { label: '+24', min: 8, max: 24, color: '#fca5a5' },
      { label: '+48', min: 24, max: 48, color: '#dc2626' },
    ],
  },
  {
    id: 'ZDR',
    name: 'Differential Reflectivity',
    unit: 'dB',
    live: false,
    description: 'Drop oblateness proxy. Simulated column overlay.',
    interpretation: 'ZDR column above freezing level = strong updraft lofting supercooled drops.',
    steps: [
      { label: '<0', min: -2, max: 0, color: '#38bdf8' },
      { label: '0–1', min: 0, max: 1, color: '#a5b4fc' },
      { label: '1–3', min: 1, max: 3, color: '#facc15' },
      { label: '3–5', min: 3, max: 5, color: '#fb923c' },
      { label: '5+', min: 5, max: 8, color: '#ef4444' },
    ],
  },
  {
    id: 'KDP',
    name: 'Specific Differential Phase',
    unit: '°/km',
    live: false,
    description: 'Liquid-water mass proxy. Simulated core overlay.',
    interpretation: 'KDP cores mark heavy-rain mass; immune to calibration drift and hail contamination.',
    steps: [
      { label: '0', min: 0, max: 0.5, color: '#e0f2fe' },
      { label: '1', min: 0.5, max: 1.5, color: '#7dd3fc' },
      { label: '2', min: 1.5, max: 2.5, color: '#facc15' },
      { label: '4', min: 2.5, max: 4, color: '#fb923c' },
      { label: '6+', min: 4, max: 6, color: '#dc2626' },
    ],
  },
  {
    id: 'CC',
    name: 'Correlation Coefficient',
    unit: '',
    live: false,
    description: 'Hydrometeor uniformity. Simulated debris overlay.',
    interpretation: 'CC near 1 = uniform rain; tornadic debris / hail shows as a low-CC ball.',
    steps: [
      { label: '<0.8', min: 0, max: 0.8, color: '#ef4444' },
      { label: '0.9', min: 0.8, max: 0.9, color: '#fb923c' },
      { label: '0.95', min: 0.9, max: 0.95, color: '#facc15' },
      { label: '0.98', min: 0.95, max: 0.98, color: '#86efac' },
      { label: '1.0', min: 0.98, max: 1, color: '#16a34a' },
    ],
  },
  {
    id: 'ET',
    name: 'Echo Tops',
    unit: 'km',
    live: false,
    description: 'Highest echo altitude. Simulated tops rings.',
    interpretation: 'Tops above 12 km with cold overshooting tops = severe potential.',
    steps: [
      { label: '<4', min: 0, max: 4, color: '#bae6fd' },
      { label: '8', min: 4, max: 8, color: '#38bdf8' },
      { label: '12', min: 8, max: 12, color: '#facc15' },
      { label: '15', min: 12, max: 15, color: '#fb923c' },
      { label: '18+', min: 15, max: 20, color: '#dc2626' },
    ],
  },
];

export function productById(id: RadarProductId): RadarProduct {
  return RADAR_PRODUCTS.find((p) => p.id === id) ?? RADAR_PRODUCTS[0];
}

/** Gaussian falloff of a cell's influence at a cursor point (degrees). */
function falloff(lat: number, lng: number, cell: StormTrack): number {
  const dLat = (lat - cell.lat) * 111;
  const dLng = (lng - cell.lon) * 111 * Math.cos((cell.lat * Math.PI) / 180);
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
  const sigma = Math.max(30, cell.radiusKm * 0.55);
  return Math.exp(-(distKm * distKm) / (2 * sigma * sigma));
}

/**
 * Model value of a product at a cursor location. Z is an echo estimate;
 * the rest are synthesized training fields (see module header).
 */
export function fieldValue(product: RadarProductId, lat: number, lng: number, cells: StormTrack[]): number {
  let v = 0;
  if (product === 'Z') {
    let peak = 4;
    for (const c of cells) {
      const f = falloff(lat, lng, c);
      peak = Math.max(peak, 4 + (c.peakDbz - 4) * f);
    }
    return Math.round(peak * 10) / 10;
  }
  if (product === 'V') {
    for (const c of cells) {
      const f = falloff(lat, lng, c);
      if (f < 0.02) continue;
      // Rotational couplet: sign flips across the cell's motion axis.
      const dx = (lng - c.lon) * 111 * Math.cos((c.lat * Math.PI) / 180);
      const side = dx >= 0 ? 1 : -1;
      const strength = Math.min(48, 8 + c.peakDbz * 0.7);
      v += side * strength * f * (1 - f * 0.4);
    }
    return Math.max(-48, Math.min(48, Math.round(v * 10) / 10));
  }
  if (product === 'ZDR') {
    for (const c of cells) {
      const f = falloff(lat, lng, c);
      const convective = c.peakDbz >= 45 ? 1 : 0.3;
      v = Math.max(v, (0.4 + 4.2 * f) * convective);
    }
    return Math.round(v * 10) / 10;
  }
  if (product === 'KDP') {
    for (const c of cells) {
      const f = falloff(lat, lng, c);
      if (c.peakDbz >= 40) v = Math.max(v, 5.5 * f * f + 0.2 * f);
    }
    return Math.round(v * 10) / 10;
  }
  if (product === 'CC') {
    v = 0.995;
    for (const c of cells) {
      const f = falloff(lat, lng, c);
      if (c.peakDbz >= 55) v = Math.min(v, 0.995 - 0.28 * f);
      else if (c.peakDbz >= 45) v = Math.min(v, 0.995 - 0.08 * f);
    }
    return Math.round(v * 1000) / 1000;
  }
  // ET
  for (const c of cells) {
    const f = falloff(lat, lng, c);
    v = Math.max(v, (3.5 + c.peakDbz / 7.5) * (0.25 + 0.75 * f));
  }
  return Math.round(v * 10) / 10;
}

/** Step whose [min,max) contains the value (for legend highlight + readout). */
export function stepFor(product: RadarProduct, value: number): number {
  const idx = product.steps.findIndex((s, i) => value >= s.min && (value < s.max || i === product.steps.length - 1));
  return idx === -1 ? 0 : idx;
}
