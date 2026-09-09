'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RegionDatum {
  region: string;
  avg: number;
  count: number;
  atRisk: number;
  lat: number;
  lng: number;
}

function regionColor(avg: number): string {
  if (avg >= 80) return '#16a34a';
  if (avg >= 60) return '#d97706';
  return '#dc2626';
}

/**
 * Choropleth-style region overlay (client-only): one circle per IMD region,
 * sized by station count and colored by mean readiness — the lightweight
 * alternative to full state-boundary GeoJSON for the governance overview.
 */
export function RegionReadinessMapInner({ regions }: { regions: RegionDatum[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [23.5, 80.5], zoom: 5, minZoom: 4, maxZoom: 10 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    for (const r of regions) {
      const color = regionColor(r.avg);
      L.circle([r.lat, r.lng], {
        radius: 90000 + r.count * 14000,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.22,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:inherit;min-width:170px">` +
            `<div style="font-weight:800;font-size:13px">${r.region} region</div>` +
            `<div style="font-size:12px">Mean readiness: <strong style="color:${color}">${r.avg}%</strong></div>` +
            `<div style="font-size:12px">Stations: <strong>${r.count}</strong> • at risk: <strong>${r.atRisk}</strong></div>` +
            `</div>`
        );
      L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: 'region-label',
          html: `<div style="background:rgba(11,30,54,.88);color:#fff;font:700 11px/1.4 system-ui;padding:2px 8px;border-radius:999px;border:1px solid ${color};white-space:nowrap">${r.region} ${r.avg}%</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [regions]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Region readiness overlay: circles sized by station count, colored by mean readiness"
      className="relative z-0 h-[380px] w-full select-none rounded-xl outline-none sm:h-[440px]"
    />
  );
}
