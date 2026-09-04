'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RadarFrame,
  RadarLayerSettings,
  BasemapType,
  RadarColorScheme,
} from '@/types/weather';
import { BASEMAP_CONFIGS, getRadarTileUrl } from '@/lib/weatherService';
import { MOCK_RADAR_HOTSPOTS, RadarHotspot } from '@/lib/mockRadarData';

export interface LeafletRadarContainerProps {
  center: [number, number]; // [lat, lon]
  zoom?: number;
  selectedLocationName?: string;
  host: string;
  frames: RadarFrame[];
  currentFrameIndex: number;
  settings: RadarLayerSettings;
  onSelectLocation?: (lat: number, lon: number) => void;
  className?: string;
  activeHotspots?: RadarHotspot[];
  onZoomChange?: (zoom: number) => void;
}

export function LeafletRadarContainer({
  center,
  zoom = 6,
  selectedLocationName,
  host,
  frames,
  currentFrameIndex,
  settings,
  onSelectLocation,
  className = '',
  activeHotspots = MOCK_RADAR_HOTSPOTS,
  onZoomChange,
}: LeafletRadarContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayersMapRef = useRef<Map<number, L.TileLayer>>(new Map());
  const markerRef = useRef<L.Marker | null>(null);
  const rangeRingsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const stormCellsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Keep latest callbacks in ref
  const onSelectLocationRef = useRef(onSelectLocation);
  onSelectLocationRef.current = onSelectLocation;

  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [center[0], center[1]],
      zoom: zoom,
      zoomControl: false,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 18,
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
      maxBoundsViscosity: 0.8,
    });

    // Custom positioned zoom control in bottom-right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Click handler to select coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectLocationRef.current) {
        onSelectLocationRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    map.on('zoomend', () => {
      if (onZoomChangeRef.current) {
        onZoomChangeRef.current(map.getZoom());
      }
    });

    // Create layer groups for range rings and storm cells
    rangeRingsLayerGroupRef.current = L.layerGroup().addTo(map);
    stormCellsLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Add ResizeObserver to auto-invalidate size when container flexes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
      basemapLayerRef.current = null;
      radarLayersMapRef.current.clear();
      rangeRingsLayerGroupRef.current = null;
      stormCellsLayerGroupRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Manage Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
    }

    const basemapConfig = BASEMAP_CONFIGS[settings.basemap] || BASEMAP_CONFIGS.dark;
    const basemapLayer = L.tileLayer(basemapConfig.url, {
      attribution: basemapConfig.attribution,
      subdomains: basemapConfig.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: basemapConfig.maxZoom || 19,
      zIndex: 1,
    }).addTo(map);

    basemapLayerRef.current = basemapLayer;
  }, [settings.basemap]);

  // 3. Manage Radar Tile Layers (Dual & Multi-Layer Flicker-Free Tile Cache)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !host || frames.length === 0) return;

    const layerMap = radarLayersMapRef.current;

    // Create or update tile layers for each frame
    frames.forEach((frame, idx) => {
      const tileUrl = getRadarTileUrl(
        host,
        frame.path,
        18, // Leaflet maxZoom template parameter
        0,
        0,
        settings.colorScheme,
        settings.smooth,
        settings.snow,
        settings.tileSize
      ).replace('/18/0/0/', '/{z}/{x}/{y}/');

      let layer = layerMap.get(idx);

      if (!layer) {
        // Create new TileLayer with maxNativeZoom: 7 for smooth upscaling
        layer = L.tileLayer(tileUrl, {
          maxZoom: 18,
          maxNativeZoom: 7,
          opacity: idx === currentFrameIndex ? settings.opacity : 0,
          zIndex: 100 + idx,
        }).addTo(map);
        layerMap.set(idx, layer);
      } else {
        // Update URL if scheme or settings changed
        layer.setUrl(tileUrl);
        layer.setOpacity(idx === currentFrameIndex ? settings.opacity : 0);
      }
    });

    // Cleanup layers that are no longer in frames array
    layerMap.forEach((layer, idx) => {
      if (idx >= frames.length) {
        map.removeLayer(layer);
        layerMap.delete(idx);
      }
    });
  }, [
    host,
    frames,
    settings.colorScheme,
    settings.smooth,
    settings.snow,
    settings.tileSize,
  ]);

  // 4. Instant Frame Switching with Opacity Transitions (0ms network flicker)
  useEffect(() => {
    const layerMap = radarLayersMapRef.current;
    layerMap.forEach((layer, idx) => {
      if (idx === currentFrameIndex) {
        layer.setOpacity(settings.opacity);
      } else {
        layer.setOpacity(0);
      }
    });
  }, [currentFrameIndex, settings.opacity]);

  // 5. Update Center / FlyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const latDiff = Math.abs(currentCenter.lat - center[0]);
    const lonDiff = Math.abs(currentCenter.lng - center[1]);

    if (latDiff > 0.001 || lonDiff > 0.001) {
      map.flyTo([center[0], center[1]], zoom, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [center[0], center[1], zoom]);

  // 6. Update Active Location Pin / Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const locationTitle = selectedLocationName || `${center[0].toFixed(2)}°, ${center[1].toFixed(2)}°`;

    // Create custom pulsating SVG marker icon
    const customIcon = L.divIcon({
      className: 'radar-location-pin-container',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
          <div class="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping"></div>
          <div class="absolute w-6 h-6 rounded-full bg-amber-500/50"></div>
          <div class="relative w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)]"></div>
          <div class="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 border border-amber-400/40 text-amber-300 text-[11px] font-mono px-2 py-0.5 rounded shadow-lg backdrop-blur-sm pointer-events-none transition-all duration-200">
            ${locationTitle}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker([center[0], center[1]], {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([center[0], center[1]]);
      markerRef.current.setIcon(customIcon);
    }
  }, [center[0], center[1], selectedLocationName]);

  // 7. Render Concentric Range Rings Overlay
  useEffect(() => {
    const group = rangeRingsLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!settings.showRangeRings) return;

    // Concentric nautical/metric range rings (50km, 100km, 200km)
    const ringRadiiMeters = [50000, 100000, 200000];
    const ringColors = ['rgba(197, 155, 72, 0.4)', 'rgba(197, 155, 72, 0.3)', 'rgba(197, 155, 72, 0.2)'];
    const ringLabels = ['50 km', '100 km', '200 km'];

    ringRadiiMeters.forEach((radius, idx) => {
      const circle = L.circle([center[0], center[1]], {
        radius,
        color: ringColors[idx],
        weight: 1.2,
        dashArray: '4, 6',
        fill: false,
        interactive: false,
      });
      group.addLayer(circle);
    });
  }, [center[0], center[1], settings.showRangeRings]);

  // 8. Render Storm Hotspots & Convective Cells Overlay
  useEffect(() => {
    const group = stormCellsLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!settings.showStormCells || !activeHotspots || activeHotspots.length === 0) return;

    activeHotspots.forEach((hotspot) => {
      // Cell radius circle
      const cellCircle = L.circle([hotspot.lat, hotspot.lon], {
        radius: hotspot.radiusKm * 1000,
        color: hotspot.peakDbz >= 50 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.5)',
        fillColor: hotspot.peakDbz >= 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)',
        fillOpacity: 0.2,
        weight: 1.5,
        dashArray: '3, 5',
      });

      // Convective core marker
      const stormIcon = L.divIcon({
        className: 'storm-hotspot-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <div class="absolute w-6 h-6 rounded-full ${
              hotspot.peakDbz >= 50 ? 'bg-red-500/40' : 'bg-amber-500/40'
            } animate-ping"></div>
            <div class="w-4 h-4 rounded-full ${
              hotspot.peakDbz >= 50 ? 'bg-red-600' : 'bg-amber-600'
            } border border-white text-[9px] font-bold text-white flex items-center justify-center shadow-md">
              ⚡
            </div>
            <div class="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border border-red-500/50 text-white text-[10px] font-sans px-2 py-1 rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div class="font-bold text-red-400">${hotspot.name}</div>
              <div class="text-slate-300 font-mono text-[9px]">${hotspot.peakDbz} dBZ • ${hotspot.precipitationType}</div>
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([hotspot.lat, hotspot.lon], { icon: stormIcon });
      marker.on('click', () => {
        if (onSelectLocationRef.current) {
          onSelectLocationRef.current(hotspot.lat, hotspot.lon);
        }
      });

      group.addLayer(cellCircle);
      group.addLayer(marker);
    });
  }, [activeHotspots, settings.showStormCells]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full min-h-[280px] relative z-0 outline-none select-none ${className}`}
      tabIndex={0}
      aria-label="Interactive Weather Radar Map"
    />
  );
}

export default LeafletRadarContainer;
