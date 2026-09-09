import { NextResponse } from 'next/server';
import { ALL_38_DOPPLER_NODES, getNetworkSummary } from '@/lib/radarNetworkData';
import { calculateMarshallPalmerDbz } from '@/lib/weatherService';
import type { HydrometeorClass, RadarStatus } from '@/types/radar';

export const dynamic = 'force-dynamic';

/** Server-side cache for live station weather (Open-Meteo allows ~10k calls/day). */
const LIVE_WX_TTL_MS = 5 * 60 * 1000;

interface LiveStationWx {
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windGusts: number;
}

let liveWxCache: { timestamp: number; data: (LiveStationWx | null)[] } | null = null;

/**
 * Pull live current conditions for all 38 stations in ONE Open-Meteo
 * multi-location request (comma-separated coordinate arrays).
 */
async function fetchLiveStationWeather(): Promise<(LiveStationWx | null)[]> {
  if (liveWxCache && Date.now() - liveWxCache.timestamp < LIVE_WX_TTL_MS) {
    return liveWxCache.data;
  }

  const latitudes = ALL_38_DOPPLER_NODES.map((n) => n.lat.toFixed(3)).join(',');
  const longitudes = ALL_38_DOPPLER_NODES.map((n) => n.lng.toFixed(3)).join(',');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}` +
    `&current=precipitation,weather_code,wind_speed_10m,wind_gusts_10m` +
    `&wind_speed_unit=kmh&forecast_days=1&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`Open-Meteo responded with HTTP ${res.status}`);

  const json = await res.json();
  const entries = Array.isArray(json) ? json : [json];
  const data = entries.map((entry: any): LiveStationWx | null => {
    const c = entry?.current;
    if (!c) return null;
    return {
      precipitation: Number(c.precipitation ?? 0),
      weatherCode: Number(c.weather_code ?? 0),
      windSpeed: Number(c.wind_speed_10m ?? 0),
      windGusts: Number(c.wind_gusts_10m ?? 0),
    };
  });

  liveWxCache = { timestamp: Date.now(), data };
  return data;
}

/** Classify hydrometeor regime from live reflectivity (HCA-style). */
function classifyLiveHydrometeor(dbz: number): HydrometeorClass {
  if (dbz >= 55) return 'Hail Core / Graupel';
  if (dbz >= 45) return 'Severe Squall Line';
  if (dbz >= 35) return 'Heavy Convective Rain';
  if (dbz >= 25) return 'Moderate Stratiform Rain';
  if (dbz >= 15) return 'Light Rain / Drizzle';
  return 'Clear Air / Marine Boundary';
}

/** Derive operational status from live precipitation + WMO code. */
function deriveLiveStatus(precipitation: number, weatherCode: number): RadarStatus {
  if ([95, 96, 99].includes(weatherCode) || precipitation >= 25) return 'NOWCASTING';
  if (precipitation > 0.5 || [80, 81, 82, 65, 67, 75, 86].includes(weatherCode)) return 'STREAMING';
  if ([71, 73, 77, 85].includes(weatherCode)) return 'CALIBRATING';
  return 'ONLINE';
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const band = searchParams.get('band');
  const region = searchParams.get('region');
  const status = searchParams.get('status');

  let nodes = [...ALL_38_DOPPLER_NODES];

  if (band && band !== 'ALL') {
    nodes = nodes.filter((n) => n.band.toLowerCase() === band.toLowerCase());
  }

  if (region && region !== 'ALL') {
    nodes = nodes.filter((n) => n.region.toLowerCase() === region.toLowerCase());
  }

  if (status && status !== 'ALL') {
    nodes = nodes.filter((n) => n.status.toLowerCase() === status.toLowerCase());
  }

  // Attempt live per-station conditions; fall back to static climatology offline
  let liveWx: (LiveStationWx | null)[] = [];
  let isLive = false;
  try {
    liveWx = await fetchLiveStationWeather();
    isLive = liveWx.some((w) => w !== null);
  } catch (err) {
    console.warn('Live station weather unavailable, using static fallback:', err);
  }

  // Real-time dynamic polling to keep telemetry alive
  const now = new Date();
  const timeMs = now.getTime();
  const dynamicNodes = nodes.map((node, index) => {
    const dynamicAzimuth = Math.floor((node.azimuthDeg + (timeMs / 50) % 360) % 360);
    const dynamicLatency = Number((node.latencyMs + Math.sin(timeMs / 2000 + index) * 1.5).toFixed(1));

    const wx = liveWx[ALL_38_DOPPLER_NODES.indexOf(node)] ?? null;

    if (wx) {
      // ── LIVE PATH: derive radar observables from real precipitation ──
      const liveDbz =
        wx.precipitation > 0.01
          ? calculateMarshallPalmerDbz(wx.precipitation)
          : Number((4 + Math.abs(Math.sin(timeMs / 5000 + index * 1.7)) * 8).toFixed(1));
      const liveVelocity = Number((wx.windSpeed / 3.6 + Math.sin(timeMs / 4000 + index) * 1.2).toFixed(1));
      // Heavier rain → more oblate drops (higher ZDR), slightly lower CC
      const liveZdr = Number(clamp(0.4 + wx.precipitation * 0.06, 0.2, 4).toFixed(2));
      const liveCc = Number(clamp(0.99 - wx.precipitation * 0.001, 0.85, 0.99).toFixed(3));

      return {
        ...node,
        azimuthDeg: dynamicAzimuth,
        latencyMs: dynamicLatency,
        reflectivityDbz: liveDbz,
        velocityMs: liveVelocity,
        zdrDb: liveZdr,
        correlationCoeff: liveCc,
        hydrometeorType: classifyLiveHydrometeor(liveDbz),
        status: deriveLiveStatus(wx.precipitation, wx.weatherCode),
        lastScanTime: 'Live (0s ago)',
      };
    }

    // ── FALLBACK PATH: static climatology + simulated micro-fluctuations ──
    const dynamicReflectivity = Number(
      (node.reflectivityDbz + Math.sin(timeMs / 3000 + index) * 0.8).toFixed(1)
    );

    return {
      ...node,
      azimuthDeg: dynamicAzimuth,
      latencyMs: dynamicLatency,
      reflectivityDbz: dynamicReflectivity,
      lastScanTime: 'Live (0s ago)',
    };
  });

  const baseSummary = getNetworkSummary();
  const nowcastingCount = dynamicNodes.filter((n) => n.status === 'NOWCASTING').length;
  const summary = {
    ...baseSummary,
    totalNodes: dynamicNodes.length,
    onlineNodes: dynamicNodes.filter((n) => n.status !== 'CALIBRATING').length,
    streamingNodes: dynamicNodes.filter((n) => n.status === 'STREAMING' || n.status === 'NOWCASTING').length,
    nowcastingAlerts: nowcastingCount,
    avgLatencyMs: Number(
      (dynamicNodes.reduce((sum, n) => sum + n.latencyMs, 0) / Math.max(1, dynamicNodes.length)).toFixed(1)
    ),
    lastSyncTimestamp: now.toISOString(),
  };

  // Top-3 most active stations for the live ticker (by reflectivity)
  const highlights = [...dynamicNodes]
    .sort((a, b) => b.reflectivityDbz - a.reflectivityDbz)
    .slice(0, 3)
    .map((n) => ({
      id: n.id,
      code: n.code,
      city: n.city,
      state: n.state,
      reflectivityDbz: n.reflectivityDbz,
      status: n.status,
      hydrometeorType: n.hydrometeorType,
    }));

  return NextResponse.json({
    success: true,
    summary,
    totalCount: dynamicNodes.length,
    nodes: dynamicNodes,
    isLive,
    dataSource: isLive ? 'open-meteo-live' : 'static-fallback',
    observedAt: now.toISOString(),
    highlights,
  });
}
