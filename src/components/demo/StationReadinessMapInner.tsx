'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface DemoStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
  readiness: number;
  cadre: number;
  topGap: string | null;
}

export function readinessColor(readiness: number): string {
  if (readiness >= 80) return '#16a34a';
  if (readiness >= 50) return '#d97706';
  return '#dc2626';
}

/**
 * Leaflet station-readiness map (client-only; loaded via next/dynamic with
 * ssr:false). Circle markers are colored green ≥80% / amber 50–79% / red
 * <50%; clicking a marker shows station, readiness, cadre and top gap.
 */
export function StationReadinessMapInner({ stations }: { stations: DemoStation[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [23.5, 80.5],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 10,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    for (const s of stations) {
      const color = readinessColor(s.readiness);
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 7,
        color: '#ffffff',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:inherit;min-width:180px">` +
          `<div style="font-weight:800;font-size:13px;margin-bottom:2px">${s.name} (${s.code})</div>` +
          `<div style="font-size:12px">Readiness: <strong style="color:${color}">${s.readiness}%</strong></div>` +
          `<div style="font-size:12px">Cadre: <strong>${s.cadre}</strong></div>` +
          `<div style="font-size:12px">Top gap: <strong>${s.topGap ?? '—'}</strong></div>` +
          `<div style="font-size:11px;color:#64748b;margin-top:2px">Demo data • updated Aug 2026</div>` +
          `</div>`
      );
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [stations]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label={`Interactive map of ${stations.length} demo IMD radar stations colored by readiness`}
      className="relative z-0 h-[380px] w-full select-none rounded-xl outline-none sm:h-[440px]"
    />
  );
}
