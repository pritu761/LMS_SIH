import { RadarMetadata, RadarFrame } from '@/types/weather';

export interface RadarHotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  peakDbz: number;
  velocityKmH: number;
  headingDeg: number;
  precipitationType: string;
}

/**
 * Active meteorological radar hotspots simulated for offline fallback & realistic Doppler radar echoes.
 */
export const MOCK_RADAR_HOTSPOTS: RadarHotspot[] = [
  {
    id: 'bob_cyclonic_cell',
    name: 'Bay of Bengal Deep Depression',
    lat: 18.5,
    lon: 86.2,
    radiusKm: 280,
    peakDbz: 56,
    velocityKmH: 22,
    headingDeg: 315, // NW
    precipitationType: 'Severe Convective Rain Bands',
  },
  {
    id: 'konkan_squall_line',
    name: 'Konkan Coast Squall Line',
    lat: 19.1,
    lon: 72.4,
    radiusKm: 160,
    peakDbz: 48,
    velocityKmH: 30,
    headingDeg: 70, // ENE
    precipitationType: 'Heavy Coastal Monsoon Downpour',
  },
  {
    id: 'northern_plains_wd',
    name: 'Delhi NCR Western Disturbance',
    lat: 28.8,
    lon: 77.1,
    radiusKm: 140,
    peakDbz: 42,
    velocityKmH: 25,
    headingDeg: 90, // E
    precipitationType: 'Thunderstorm & Squalls',
  },
  {
    id: 'chennai_offshore_cell',
    name: 'Chennai Offshore Convective Cell',
    lat: 13.2,
    lon: 80.8,
    radiusKm: 120,
    peakDbz: 50,
    velocityKmH: 18,
    headingDeg: 290, // WNW
    precipitationType: 'Intense Tropical Showers',
  },
  {
    id: 'bengaluru_orographic',
    name: 'Western Ghats Orographic Convection',
    lat: 12.8,
    lon: 76.8,
    radiusKm: 90,
    peakDbz: 38,
    velocityKmH: 15,
    headingDeg: 45, // NE
    precipitationType: 'Moderate Stratiform & Showers',
  },
  {
    id: 'subhimalayan_front',
    name: 'Sub-Himalayan Foothill Storm Cell',
    lat: 26.8,
    lon: 89.2,
    radiusKm: 110,
    peakDbz: 52,
    velocityKmH: 20,
    headingDeg: 135, // SE
    precipitationType: 'Convective Hail Storm Core',
  },
  {
    id: 'uk_maritime_front',
    name: 'English Channel Maritime Front',
    lat: 50.8,
    lon: 0.1,
    radiusKm: 200,
    peakDbz: 34,
    velocityKmH: 40,
    headingDeg: 90, // E
    precipitationType: 'Light-to-Moderate Rain Front',
  },
  {
    id: 'us_atlantic_squall',
    name: 'New York Coastal Squall',
    lat: 40.5,
    lon: -73.8,
    radiusKm: 150,
    peakDbz: 46,
    velocityKmH: 35,
    headingDeg: 45, // NE
    precipitationType: 'Convective Summer Squall',
  },
  {
    id: 'tokyo_bay_cell',
    name: 'Tokyo Bay Maritime Depression',
    lat: 35.2,
    lon: 139.8,
    radiusKm: 180,
    peakDbz: 44,
    velocityKmH: 28,
    headingDeg: 30, // NNE
    precipitationType: 'Subtropical Rain Band',
  },
];

/**
 * Calculates simulated radar reflectivity (dBZ) and rain rate (mm/h)
 * for any coordinate based on proximity to active meteorological hotspots.
 */
export function getSimulatedRadarEcho(
  lat: number,
  lon: number,
  timestampSeconds = Math.floor(Date.now() / 1000)
): {
  dbz: number;
  rainRateMmH: number;
  description: string;
  cellName?: string;
} {
  let maxDbz = 0;
  let nearestCell: RadarHotspot | undefined;

  for (const hotspot of MOCK_RADAR_HOTSPOTS) {
    // Great circle distance approximation (equirectangular projection)
    const latRad = (lat * Math.PI) / 180;
    const dLat = ((hotspot.lat - lat) * Math.PI) / 180;
    const dLon = ((hotspot.lon - lon) * Math.PI) / 180;
    const x = dLon * Math.cos(latRad);
    const distKm = Math.sqrt(dLat * dLat + x * x) * 6371;

    if (distKm <= hotspot.radiusKm) {
      // Gaussian radial decay
      const sigma = hotspot.radiusKm / 2.5;
      const decay = Math.exp(-(distKm * distKm) / (2 * sigma * sigma));
      const localDbz = Math.round(hotspot.peakDbz * decay * 10) / 10;

      if (localDbz > maxDbz) {
        maxDbz = localDbz;
        nearestCell = hotspot;
      }
    }
  }

  // Marshall-Palmer inverse: R = (10^(dBZ/10) / 200)^(1 / 1.6)
  let rainRate = 0;
  if (maxDbz >= 10) {
    const z = Math.pow(10, maxDbz / 10);
    rainRate = Math.round(Math.pow(z / 200, 1 / 1.6) * 10) / 10;
  }

  let description = 'Clear / No significant radar echoes';
  if (maxDbz >= 60) description = 'Extreme convective storm / Hail core';
  else if (maxDbz >= 50) description = 'Severe thunderstorm with torrential downpour';
  else if (maxDbz >= 40) description = 'Heavy rain / Strong convective cell';
  else if (maxDbz >= 30) description = 'Moderate stratiform rain';
  else if (maxDbz >= 20) description = 'Light rain showers';
  else if (maxDbz >= 10) description = 'Light drizzle / Virga echo';

  return {
    dbz: maxDbz,
    rainRateMmH: rainRate,
    description,
    cellName: nearestCell?.name,
  };
}

/**
 * Generate synthetic radar frame series for past 2 hours + 30m nowcast.
 */
export function generateProceduralRadarFrames(
  frameIntervalMinutes = 10,
  pastCount = 13,
  nowcastCount = 4
): { past: RadarFrame[]; nowcast: RadarFrame[] } {
  const now = Math.floor(Date.now() / 1000);
  const roundedNow = Math.floor(now / (frameIntervalMinutes * 60)) * (frameIntervalMinutes * 60);
  const intervalSec = frameIntervalMinutes * 60;

  const past: RadarFrame[] = [];
  for (let i = pastCount - 1; i >= 0; i--) {
    const frameTime = roundedNow - i * intervalSec;
    const hash = Math.abs(Math.sin(frameTime) * 10000000).toString(16).substring(0, 12);
    past.push({
      time: frameTime,
      path: `/v2/radar/${hash}`,
      isNowcast: false,
    });
  }

  const nowcast: RadarFrame[] = [];
  for (let j = 1; j <= nowcastCount; j++) {
    const frameTime = roundedNow + j * intervalSec;
    const hash = Math.abs(Math.sin(frameTime) * 10000000).toString(16).substring(0, 12);
    nowcast.push({
      time: frameTime,
      path: `/v2/radar/nowcast_${hash}`,
      isNowcast: true,
    });
  }

  return { past, nowcast };
}

/**
 * Deterministic fallback radar metadata matching RainViewer API v2 structure.
 */
export function generateMockRadarMetadata(): RadarMetadata {
  const now = Math.floor(Date.now() / 1000);
  const { past, nowcast } = generateProceduralRadarFrames(10, 13, 4);

  return {
    version: '2.0-fallback',
    generated: now,
    host: 'https://tilecache.rainviewer.com',
    past,
    nowcast,
    isFallback: true,
  };
}
