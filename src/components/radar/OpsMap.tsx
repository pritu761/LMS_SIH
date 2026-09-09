'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fieldValue, productById, stepFor } from '@/lib/radarProducts';
import type { OpsStation, RadarProductId, StormTrack, WeatherAlert } from '@/services/radarTypes';

export interface OpsMapProps {
  stations: OpsStation[];
  tracks: StormTrack[];
  alerts: WeatherAlert[];
  product: RadarProductId;
  showStations: boolean;
  ringMode: 'none' | 'selected' | 'all';
  showTracks: boolean;
  showAlerts: boolean;
  selectedStationId: string | null;
  onStationSelect: (id: string | null) => void;
  selectedAlertId: string | null;
  onAlertSelect: (id: string | null) => void;
  /** 0..1 training-step emphasis for simulated overlays. */
  simIntensity?: number;
  /** RainViewer tile template with {z}/{x}/{y} (reflectivity product). */
  tileTemplate?: string | null;
  className?: string;
}

const BAND_COLOR: Record<string, string> = {
  'S-Band': '#c59b48',
  'C-Band': '#38bdf8',
  'X-Band': '#a78bfa',
};

const SEVERITY_STYLE: Record<string, { color: string; fill: string }> = {
  RED: { color: '#dc2626', fill: 'rgba(220,38,38,0.18)' },
  ORANGE: { color: '#ea580c', fill: 'rgba(234,88,12,0.15)' },
  YELLOW: { color: '#ca8a04', fill: 'rgba(202,138,4,0.13)' },
};

/** Destination point from heading + distance (haversine). */
function destPoint(lat: number, lng: number, headingDeg: number, km: number): [number, number] {
  const R = 6371;
  const br = (headingDeg * Math.PI) / 180;
  const d = km / R;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Operations map: 38 clickable station markers, 150/250/500 km coverage
 * rings, storm-cell track arrows (heading + speed), warning polygons and
 * per-product layers (live Z tiles; V/ZDR/KDP/CC/ET as labeled simulated
 * training overlays) with a cursor readout (coordinates + model value).
 */
export function OpsMap({
  stations,
  tracks,
  alerts,
  product,
  showStations,
  ringMode,
  showTracks,
  showAlerts,
  selectedStationId,
  onStationSelect,
  selectedAlertId,
  onAlertSelect,
  simIntensity = 1,
  tileTemplate = null,
  className = '',
}: OpsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ stations: L.LayerGroup | null; rings: L.LayerGroup | null; tracks: L.LayerGroup | null; alerts: L.LayerGroup | null; product: L.LayerGroup | null }>({
    stations: null,
    rings: null,
    tracks: null,
    alerts: null,
    product: null,
  });
  const selectRef = useRef(onStationSelect);
  selectRef.current = onStationSelect;
  const alertSelectRef = useRef(onAlertSelect);
  alertSelectRef.current = onAlertSelect;
  const [cursor, setCursor] = useState<{ x: number; y: number; w: number; lat: number; lng: number } | null>(null);

  // 1. init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [23.5, 80.5],
      zoom: 5,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 12,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    layersRef.current = {
      stations: L.layerGroup().addTo(map),
      rings: L.layerGroup().addTo(map),
      tracks: L.layerGroup().addTo(map),
      alerts: L.layerGroup().addTo(map),
      product: L.layerGroup().addTo(map),
    };
    const onMove = (e: L.LeafletMouseEvent) => {
      const point = map.latLngToContainerPoint(e.latlng);
      const size = map.getSize();
      setCursor({ x: point.x, y: point.y, w: size.x, lat: e.latlng.lat, lng: e.latlng.lng });
    };
    const onOut = () => setCursor(null);
    map.on('mousemove', onMove);
    map.on('mouseout', onOut);
    mapRef.current = map;
    return () => {
      map.off('mousemove', onMove);
      map.off('mouseout', onOut);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. stations
  useEffect(() => {
    const group = layersRef.current.stations;
    if (!group) return;
    group.clearLayers();
    if (!showStations) return;
    for (const s of stations) {
      const color = BAND_COLOR[s.band] ?? '#c59b48';
      const selected = s.id === selectedStationId;
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: selected ? 9 : 6,
        color: '#ffffff',
        weight: selected ? 2.5 : 1.5,
        fillColor: color,
        fillOpacity: 0.95,
      });
      marker.bindTooltip(`${esc(s.city)} • ${esc(s.band)}`, { direction: 'top', offset: [0, -8] });
      marker.bindPopup(
        `<div style="font-family:inherit;min-width:190px">` +
          `<div style="font-weight:800;font-size:13px">${esc(s.name)}</div>` +
          `<div style="font-size:12px">${esc(s.city)}, ${esc(s.state)} • ${esc(s.band)}</div>` +
          `<div style="font-size:12px">Range: <strong>${s.maxRangeKm} km</strong> • Status: <strong>${esc(s.status)}</strong></div>` +
          `<div style="font-size:12px">Latest: <strong>${s.reflectivityDbz === null ? '—' : `${s.reflectivityDbz} dBZ`}</strong></div>` +
          `</div>`
      );
      marker.on('click', () => selectRef.current(s.id));
      group.addLayer(marker);
    }
  }, [stations, showStations, selectedStationId]);

  // 3. coverage rings 150/250/500 km
  useEffect(() => {
    const group = layersRef.current.rings;
    if (!group) return;
    group.clearLayers();
    if (ringMode === 'none') return;
    const list = ringMode === 'all' ? stations : stations.filter((s) => s.id === selectedStationId);
    const rings: Array<{ r: number; color: string; dash: string }> = [
      { r: 150000, color: 'rgba(197,155,72,0.55)', dash: '2,3' },
      { r: 250000, color: 'rgba(197,155,72,0.35)', dash: '5,5' },
      { r: 500000, color: 'rgba(197,155,72,0.2)', dash: '8,7' },
    ];
    for (const s of list) {
      for (const ring of rings) {
        group.addLayer(
          L.circle([s.lat, s.lng], { radius: ring.r, color: ring.color, weight: 1.2, dashArray: ring.dash, fill: false, interactive: false })
        );
      }
    }
  }, [stations, ringMode, selectedStationId]);

  // 4. storm tracks (heading + speed arrows)
  useEffect(() => {
    const group = layersRef.current.tracks;
    if (!group) return;
    group.clearLayers();
    if (!showTracks) return;
    for (const t of tracks) {
      const head = destPoint(t.lat, t.lon, t.headingDeg, t.velocityKmh * 1.5);
      group.addLayer(L.polyline([[t.lat, t.lon], head], { color: '#f43f5e', weight: 2, dashArray: '6,4' }));
      group.addLayer(L.circleMarker(head, { radius: 5, color: '#fff', weight: 1.5, fillColor: '#f43f5e', fillOpacity: 1 }));
      const label = L.marker(head, {
        icon: L.divIcon({
          className: 'track-label',
          html: `<div style="background:rgba(11,30,54,.9);color:#fff;font:700 10px/1.5 system-ui;padding:1px 7px;border-radius:999px;white-space:nowrap;border:1px solid #f43f5e">${esc(t.name)} • ${t.velocityKmh} km/h • ${t.peakDbz} dBZ</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      });
      group.addLayer(label);
    }
  }, [tracks, showTracks]);

  // 5. alert polygons (approximate bounding boxes)
  useEffect(() => {
    const group = layersRef.current.alerts;
    if (!group) return;
    group.clearLayers();
    if (!showAlerts) return;
    for (const a of alerts) {
      const dLat = a.radiusKm / 111;
      const dLng = a.radiusKm / (111 * Math.cos((a.lat * Math.PI) / 180));
      const style = SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.YELLOW;
      const rect = L.rectangle(
        [
          [a.lat - dLat, a.lng - dLng],
          [a.lat + dLat, a.lng + dLng],
        ],
        { color: a.id === selectedAlertId ? '#0b1e36' : style.color, weight: a.id === selectedAlertId ? 3 : 2, fillColor: style.color, fillOpacity: 0.22 }
      );
      rect.bindPopup(
        `<div style="font-family:inherit;min-width:200px">` +
          `<div style="font-weight:800;font-size:13px;color:${style.color}">${a.severity} ALERT — ${esc(a.district)}</div>` +
          `<div style="font-size:12px;font-weight:700">${esc(a.phenomenon)}</div>` +
          `<div style="font-size:11px;color:#475569">Valid ${new Date(a.validFrom).toLocaleString('en-IN')} → ${new Date(a.validTo).toLocaleString('en-IN')}</div>` +
          `<div style="font-size:12px;margin-top:4px">${esc(a.description)}</div>` +
          `</div>`
      );
      rect.on('click', () => alertSelectRef.current(a.id));
      group.addLayer(rect);
    }
  }, [alerts, showAlerts, selectedAlertId]);

  // 6. product layer: live Z tiles, simulated vectors otherwise
  useEffect(() => {
    const group = layersRef.current.product;
    if (!group) return;
    group.clearLayers();
    const k = 0.65 + 0.55 * simIntensity;
    if (product === 'Z') {
      if (tileTemplate) {
        group.addLayer(L.tileLayer(tileTemplate, { maxZoom: 12, maxNativeZoom: 7, opacity: 0.8, zIndex: 50 }));
      }
      return;
    }
    if (tileTemplate) {
      group.addLayer(L.tileLayer(tileTemplate, { maxZoom: 12, maxNativeZoom: 7, opacity: 0.22, zIndex: 40 }));
    }
    for (const t of tracks) {
      if (product === 'V') {
        // Rotational couplet: opposing arrows through the cell.
        const p1 = destPoint(t.lat, t.lon, t.headingDeg + 90, t.velocityKmh * 0.8 * k);
        const p2 = destPoint(t.lat, t.lon, t.headingDeg - 90, t.velocityKmh * 0.8 * k);
        group.addLayer(L.polyline([[t.lat, t.lon], p1], { color: '#16a34a', weight: 3 }));
        group.addLayer(L.polyline([[t.lat, t.lon], p2], { color: '#dc2626', weight: 3 }));
        group.addLayer(
          L.marker([t.lat, t.lon], {
            icon: L.divIcon({ className: 'prod-tag', html: `<div style="background:rgba(11,30,54,.9);color:#fff;font:700 10px system-ui;padding:1px 7px;border-radius:999px;white-space:nowrap">V couplet ±${Math.min(48, Math.round(8 + t.peakDbz * 0.7))} m/s</div>`, iconSize: [0, 0] }),
            interactive: false,
            keyboard: false,
          })
        );
      } else if (product === 'ZDR') {
        group.addLayer(L.circle([t.lat, t.lon], { radius: 55000 * k, color: '#f59e0b', weight: 2, dashArray: '4,4', fillColor: '#f59e0b', fillOpacity: 0.25 }));
        group.addLayer(
          L.marker([t.lat, t.lon], {
            icon: L.divIcon({ className: 'prod-tag', html: `<div style="background:rgba(11,30,54,.9);color:#fcd34d;font:700 10px system-ui;padding:1px 7px;border-radius:999px;white-space:nowrap">ZDR column ~${(0.4 + 4.2 * 0.8).toFixed(1)} dB</div>`, iconSize: [0, 0] }),
            interactive: false,
            keyboard: false,
          })
        );
      } else if (product === 'KDP') {
        group.addLayer(L.circle([t.lat, t.lon], { radius: 38000 * k, color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.4 }));
      } else if (product === 'CC') {
        if (t.peakDbz >= 55) {
          group.addLayer(L.circleMarker([t.lat, t.lon], { radius: 10, color: '#fff', weight: 2, fillColor: '#dc2626', fillOpacity: 1 }));
          group.addLayer(
            L.marker([t.lat, t.lon], {
              icon: L.divIcon({ className: 'prod-tag', html: `<div style="background:rgba(11,30,54,.9);color:#fca5a5;font:700 10px system-ui;padding:1px 7px;border-radius:999px;white-space:nowrap;transform:translateY(-20px)">low-CC core ~0.72</div>`, iconSize: [0, 0] }),
              interactive: false,
              keyboard: false,
            })
          );
        } else {
          group.addLayer(L.circle([t.lat, t.lon], { radius: 60000 * k, color: '#16a34a', weight: 1.5, dashArray: '3,4', fill: false }));
        }
      } else if (product === 'ET') {
        const tops = 3.5 + t.peakDbz / 7.5;
        group.addLayer(L.circle([t.lat, t.lon], { radius: 70000 * k, color: '#0ea5e9', weight: 2, fill: false }));
        group.addLayer(
          L.marker([t.lat, t.lon], {
            icon: L.divIcon({ className: 'prod-tag', html: `<div style="background:rgba(11,30,54,.9);color:#7dd3fc;font:700 10px system-ui;padding:1px 7px;border-radius:999px;white-space:nowrap">ET ~${tops.toFixed(1)} km</div>`, iconSize: [0, 0] }),
            interactive: false,
            keyboard: false,
          })
        );
      }
    }
  }, [product, tileTemplate, tracks, simIntensity]);

  const prod = productById(product);
  const cursorValue = cursor ? fieldValue(product, cursor.lat, cursor.lng, tracks) : null;
  const stepIdx = cursorValue === null ? -1 : stepFor(prod, cursorValue);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label="Operations radar map: stations, coverage, storm tracks, warnings and dual-pol products"
        className={`relative z-0 h-[420px] w-full select-none rounded-xl outline-none sm:h-[520px] ${className}`}
      />
      {!prod.live && (
        <span className="absolute left-3 top-3 z-[500] rounded-lg bg-[#0b1e36]/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
          Simulated {prod.id} overlay — training
        </span>
      )}
      {cursor && cursorValue !== null && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-[500] w-[168px] rounded-xl border border-slate-700 bg-slate-950/92 px-3 py-2 text-[11px] shadow-xl"
          style={{ left: cursor.x + 14 > cursor.w - 184 ? Math.max(8, cursor.x - 182) : cursor.x + 14, top: Math.max(cursor.y - 10, 8) }}
        >
          <p className="font-mono text-slate-500">
            {cursor.lat.toFixed(2)}°, {cursor.lng.toFixed(2)}°
          </p>
          <p className="mt-0.5 font-mono text-sm font-black text-white">
            {cursorValue}
            {prod.unit ? ` ${prod.unit}` : ''} <span className="text-[#dfb76c]">{prod.id}</span>
          </p>
          <p className="text-slate-500">
            {stepIdx >= 0 ? prod.steps[stepIdx].label : ''} {!prod.live && '• model value'}
          </p>
        </div>
      )}
    </div>
  );
}
