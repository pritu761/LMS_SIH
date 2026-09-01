'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Layers,
  Sparkles,
  MapPin,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Settings2,
  RefreshCw,
  Eye,
  Radio,
  Zap,
  Globe,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import {
  RadarMetadata,
  RadarFrame,
  RadarLayerSettings,
  BasemapType,
  RadarColorScheme,
} from '@/types/weather';
import { fetchRadarMetadata } from '@/lib/weatherService';
import { MOCK_RADAR_HOTSPOTS } from '@/lib/mockRadarData';
import { RadarTimelineControls } from './RadarTimelineControls';
import { RadarDbzLegend } from './RadarDbzLegend';

// Dynamic import with zero SSR error guarantee
const LeafletRadarContainer = dynamic(
  () => import('./LeafletRadarContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-950 text-slate-400 relative overflow-hidden rounded-2xl border border-slate-800">
        {/* Radar Scanner Animation Loading Screen */}
        <div className="relative w-48 h-48 rounded-full border border-amber-500/20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute w-32 h-32 rounded-full border border-amber-400/20" />
          <div className="absolute w-16 h-16 rounded-full border border-amber-400/30" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-ping" />
          
          {/* Sweeping Beam */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-transparent to-transparent animate-spin origin-center pointer-events-none"
            style={{ animationDuration: '3s' }}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-mono text-amber-300">
          <Radio className="w-4 h-4 animate-pulse text-amber-400" />
          <span>INITIALIZING DOPPLER RADAR ENGINE...</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-mono">Mounting Slippy GIS Canvas & Tile Layers</p>
      </div>
    ),
  }
);

export interface WeatherRadarMapProps {
  center?: [number, number]; // [lat, lon]
  zoom?: number;
  selectedLocationName?: string;
  currentDbz?: number;
  metadata?: RadarMetadata | null;
  onSelectLocation?: (lat: number, lon: number, name?: string) => void;
  className?: string;
  showControls?: boolean;
  showLegend?: boolean;
  showLayerMenu?: boolean;
  initialSettings?: Partial<RadarLayerSettings>;
}

export const PRESET_REGIONS: { name: string; center: [number, number]; zoom: number }[] = [
  { name: 'India (National)', center: [22.5937, 78.9629], zoom: 5 },
  { name: 'Delhi NCR', center: [28.6139, 77.2090], zoom: 8 },
  { name: 'Mumbai / Konkan', center: [19.0760, 72.8777], zoom: 8 },
  { name: 'Bengaluru / South', center: [12.9716, 77.5946], zoom: 8 },
  { name: 'Kolkata / Bay of Bengal', center: [22.5726, 88.3639], zoom: 8 },
  { name: 'Chennai / Coromandel', center: [13.0827, 80.2707], zoom: 8 },
  { name: 'London / UK', center: [51.5074, -0.1278], zoom: 7 },
  { name: 'New York / US East', center: [40.7128, -74.0060], zoom: 7 },
  { name: 'Tokyo / East Asia', center: [35.6762, 139.6503], zoom: 7 },
];

export function WeatherRadarMap({
  center: propCenter = [22.5937, 78.9629], // Default: India national overview
  zoom: propZoom = 5,
  selectedLocationName,
  currentDbz,
  metadata: propMetadata,
  onSelectLocation,
  className = '',
  showControls = true,
  showLegend = true,
  showLayerMenu = true,
  initialSettings,
}: WeatherRadarMapProps) {
  // State
  const [internalCenter, setInternalCenter] = useState<[number, number]>(propCenter);
  const [internalZoom, setInternalZoom] = useState<number>(propZoom);
  const [radarData, setRadarData] = useState<RadarMetadata | null>(propMetadata || null);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(!propMetadata);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);
  
  // Playback state
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1s per frame (1x)

  // HUD & UI state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const [isGeoLocating, setIsGeoLocating] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layer settings
  const [settings, setSettings] = useState<RadarLayerSettings>({
    basemap: 'dark',
    colorScheme: 2, // Universal Blue
    opacity: 0.85,
    smooth: true,
    snow: true,
    tileSize: 256,
    showRangeRings: true,
    showStormCells: true,
    ...initialSettings,
  });

  // Sync prop center/zoom
  useEffect(() => {
    setInternalCenter(propCenter);
  }, [propCenter[0], propCenter[1]]);

  useEffect(() => {
    setInternalZoom(propZoom);
  }, [propZoom]);

  // Synchronize or fetch radar metadata
  const loadRadarMetadata = useCallback(async () => {
    if (propMetadata) {
      setRadarData(propMetadata);
      setIsOfflineFallback(Boolean(propMetadata.isFallback));
      setIsLoadingRadar(false);
      return;
    }

    try {
      setIsLoadingRadar(true);
      const data = await fetchRadarMetadata();
      setRadarData(data);
      setIsOfflineFallback(Boolean(data.isFallback));
      
      const allFrames = [...data.past, ...data.nowcast];
      if (allFrames.length > 0) {
        // Default to latest past frame
        const latestPastIdx = data.past.length > 0 ? data.past.length - 1 : 0;
        setCurrentFrameIndex(latestPastIdx);
      }
    } catch (err) {
      console.error('Failed to load radar metadata:', err);
    } finally {
      setIsLoadingRadar(false);
    }
  }, [propMetadata]);

  useEffect(() => {
    loadRadarMetadata();
    const interval = setInterval(loadRadarMetadata, 180000); // Refresh every 3 mins
    return () => clearInterval(interval);
  }, [loadRadarMetadata]);

  // Combined frames list (past + nowcast)
  const allFrames: RadarFrame[] = useMemo(() => {
    if (!radarData) return [];
    return [...radarData.past, ...radarData.nowcast];
  }, [radarData]);

  // Animation playback timer loop
  useEffect(() => {
    if (!isPlaying || allFrames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % allFrames.length);
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, allFrames.length]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentFrameIndex((prev) => (prev - 1 + allFrames.length) % (allFrames.length || 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentFrameIndex((prev) => (prev + 1) % (allFrames.length || 1));
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allFrames.length]);

  // Playback control handlers
  const handleTogglePlay = () => setIsPlaying((p) => !p);
  const handleStepForward = () => {
    if (allFrames.length === 0) return;
    setCurrentFrameIndex((prev) => (prev + 1) % allFrames.length);
  };
  const handleStepBackward = () => {
    if (allFrames.length === 0) return;
    setCurrentFrameIndex((prev) => (prev - 1 + allFrames.length) % allFrames.length);
  };
  const handleIndexChange = (index: number) => {
    if (allFrames.length === 0) return;
    setCurrentFrameIndex(Math.max(0, Math.min(index, allFrames.length - 1)));
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // GPS Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeoLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setInternalCenter([lat, lon]);
        setInternalZoom(9);
        onSelectLocation?.(lat, lon, 'My Location');
      },
      (err) => {
        setIsGeoLocating(false);
        console.warn('Geolocation failed:', err);
        alert('Could not determine your GPS location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCoordinate = (lat: number, lon: number) => {
    setInternalCenter([lat, lon]);
    onSelectLocation?.(lat, lon);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none min-h-screen' : ''
      } ${className}`}
    >
      {/* 1. Interactive Leaflet Map Layer */}
      <div className="relative flex-1 w-full h-full">
        {radarData ? (
          <LeafletRadarContainer
            center={internalCenter}
            zoom={internalZoom}
            selectedLocationName={selectedLocationName}
            host={radarData.host}
            frames={allFrames}
            currentFrameIndex={currentFrameIndex}
            settings={settings}
            onSelectLocation={handleSelectCoordinate}
            onZoomChange={setInternalZoom}
            activeHotspots={MOCK_RADAR_HOTSPOTS}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Loading Radar Metadata...
          </div>
        )}

        {/* 2. Top-Left HUD: Region Quick Selector & GPS */}
        <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
          {/* Preset Regions Dropdown */}
          <div className="relative">
            <select
              aria-label="Select Region"
              value=""
              onChange={(e) => {
                const found = PRESET_REGIONS.find((r) => r.name === e.target.value);
                if (found) {
                  setInternalCenter(found.center);
                  setInternalZoom(found.zoom);
                  onSelectLocation?.(found.center[0], found.center[1], found.name);
                }
              }}
              className="bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-xl border border-slate-700/80 shadow-lg backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="" disabled>
                📍 Jump to Region...
              </option>
              {PRESET_REGIONS.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Locate Button */}
          <button
            onClick={handleLocateUser}
            disabled={isGeoLocating}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 p-2 rounded-xl border border-slate-700/80 shadow-lg backdrop-blur-md transition active:scale-95 flex items-center gap-1 text-xs font-medium"
            title="Locate My Position via GPS"
            aria-label="Locate My Position"
          >
            <Navigation className={`w-3.5 h-3.5 ${isGeoLocating ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">My GPS</span>
          </button>

          {/* Offline Fallback Badge */}
          {isOfflineFallback && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono shadow-lg backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulation Mode</span>
            </div>
          )}
        </div>

        {/* 3. Top-Right HUD Action Buttons */}
        <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
          {/* Layer Settings Toggle Button */}
          {showLayerMenu && (
            <button
              onClick={() => setIsLayerMenuOpen((p) => !p)}
              className={`p-2 rounded-xl border shadow-lg backdrop-blur-md transition active:scale-95 ${
                isLayerMenuOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-amber-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
              title="Radar Layer & Map Settings"
              aria-label="Toggle Layer Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Map (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 4. Layer Settings Dropdown Drawer (Floating Modal HUD) */}
        {isLayerMenuOpen && (
          <div className="absolute top-14 right-3 z-[500] w-72 sm:w-80 rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-4 text-white text-xs space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Radar & Map Layers</span>
              </div>
              <button
                onClick={() => setIsLayerMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Basemap Selection */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Basemap Layer
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['dark', 'light', 'voyager', 'osm', 'satellite'] as BasemapType[]).map((bm) => (
                  <button
                    key={bm}
                    onClick={() => setSettings((s) => ({ ...s, basemap: bm }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition ${
                      settings.basemap === bm
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {bm === 'osm' ? 'OpenStreetMap' : bm === 'voyager' ? 'CARTO Voyager' : bm}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme Selection */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Reflectivity Color Scheme
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 2 as RadarColorScheme, name: 'Universal Blue' },
                  { id: 6 as RadarColorScheme, name: 'NEXRAD Classic' },
                  { id: 1 as RadarColorScheme, name: 'Original Rain' },
                  { id: 7 as RadarColorScheme, name: 'Rainbow' },
                ].map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setSettings((s) => ({ ...s, colorScheme: scheme.id }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      settings.colorScheme === scheme.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {scheme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Radar Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>RADAR TILE OPACITY</span>
                <span className="text-amber-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.opacity}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, opacity: parseFloat(e.target.value) }))
                }
                className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Overlay Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Concentric Range Rings (50-200km)</span>
                <input
                  type="checkbox"
                  checked={settings.showRangeRings}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, showRangeRings: e.target.checked }))
                  }
                  className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Convective Storm Cell Overlays</span>
                <input
                  type="checkbox"
                  checked={settings.showStormCells}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, showStormCells: e.target.checked }))
                  }
                  className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Radar Anti-Aliasing (Smooth)</span>
                <input
                  type="checkbox"
                  checked={settings.smooth}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, smooth: e.target.checked }))
                  }
                  className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* 5. Reflectivity dBZ Legend Overlay (Collapsible in Bottom-Left or Top-Left on Mobile) */}
        {showLegend && (
          <div className="absolute bottom-24 sm:bottom-28 left-3 z-[400] max-w-[280px] sm:max-w-xs">
            <RadarDbzLegend
              currentDbz={currentDbz}
              colorScheme={settings.colorScheme}
              compact={true}
            />
          </div>
        )}
      </div>

      {/* 6. Bottom Docked Timeline Playback Controls */}
      {showControls && (
        <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800 z-[400] relative">
          <RadarTimelineControls
            frames={allFrames}
            currentIndex={currentFrameIndex}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onIndexChange={handleIndexChange}
            onTogglePlay={handleTogglePlay}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onSpeedChange={setPlaybackSpeed}
            isOfflineFallback={isOfflineFallback}
            onRefresh={loadRadarMetadata}
          />
        </div>
      )}
    </div>
  );
}

export default WeatherRadarMap;
