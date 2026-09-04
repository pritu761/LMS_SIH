'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Satellite,
  Compass,
  MapPin,
  CloudRain,
  Zap,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Eye,
  Navigation,
  Globe2,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  Coordinates,
  WeatherData,
  RadarMetadata,
  WeatherUnitsPreference,
} from '@/types/weather';
import {
  fetchLocationCoordinates,
  fetchWeatherForecast,
  fetchRadarMetadata,
} from '@/lib/weatherService';
import { ALL_38_DOPPLER_NODES } from '@/lib/radarNetworkData';
import { RadarNode } from '@/types/radar';
import { WeatherRadarMap } from './WeatherRadarMap';
import { WeatherSearchBar } from './WeatherSearchBar';
import { WeatherMetricsHud } from './WeatherMetricsHud';
import { HourlyNowcastStrip } from './HourlyNowcastStrip';
import { MultiDayForecast } from './MultiDayForecast';
import { StormSeverityIndicator } from './StormSeverityIndicator';

const DEFAULT_COORDINATES: Coordinates = {
  lat: 28.6139,
  lon: 77.209,
  name: 'New Delhi',
  admin1: 'Delhi NCR',
  country: 'India',
};

const DEFAULT_UNITS: WeatherUnitsPreference = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  pressure: 'hPa',
};

export function RadarPageContent() {
  // Primary State
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [radarMetadata, setRadarMetadata] = useState<RadarMetadata | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [units, setUnits] = useState<WeatherUnitsPreference>(DEFAULT_UNITS);
  const [selectedStationId, setSelectedStationId] = useState<string | null>('dwr-01');
  const [activeMobileTab, setActiveMobileTab] = useState<'map' | 'hud' | 'stations'>('map');
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  const weatherAbortRef = useRef<AbortController | null>(null);

  // 1. Fetch Radar Metadata on Mount and periodically
  const loadRadarMetadata = useCallback(async () => {
    try {
      setIsLoadingRadar(true);
      const meta = await fetchRadarMetadata();
      setRadarMetadata(meta);
    } catch (err) {
      console.error('Failed to load radar metadata:', err);
    } finally {
      setIsLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    loadRadarMetadata();
    const interval = setInterval(loadRadarMetadata, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [loadRadarMetadata]);

  // 2. Fetch Weather Forecast when coordinates change
  const loadWeatherForecast = useCallback(
    async (coords: Coordinates, signal?: AbortSignal) => {
      try {
        setIsLoadingWeather(true);
        const data = await fetchWeatherForecast(
          coords.lat,
          coords.lon,
          coords.name,
          coords.admin1,
          coords.country,
          signal
        );
        setWeatherData(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Failed to load weather forecast:', err);
        }
      } finally {
        setIsLoadingWeather(false);
      }
    },
    []
  );

  useEffect(() => {
    if (weatherAbortRef.current) {
      weatherAbortRef.current.abort();
    }
    const abort = new AbortController();
    weatherAbortRef.current = abort;

    loadWeatherForecast(coordinates, abort.signal);

    const interval = setInterval(() => {
      loadWeatherForecast(coordinates);
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      abort.abort();
      clearInterval(interval);
    };
  }, [coordinates, loadWeatherForecast]);

  // Handle Location Selected from Search Bar
  const handleLocationSelect = useCallback((newCoords: Coordinates) => {
    setCoordinates(newCoords);
    setSelectedStationId(null);
  }, []);

  // Handle Location Clicked directly on Radar Map
  const handleMapLocationClick = useCallback((lat: number, lon: number, name?: string) => {
    const customCoords: Coordinates = {
      lat,
      lon,
      name: name || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
      country: 'Target Point',
    };
    setCoordinates(customCoords);
    setSelectedStationId(null);
  }, []);

  // Handle Station Clicked from 38 IMD Doppler Radar Network
  const handleStationSelect = useCallback((station: RadarNode) => {
    setSelectedStationId(station.id);
    setCoordinates({
      lat: station.lat,
      lon: station.lng,
      name: station.city || station.name,
      admin1: station.state,
      country: 'India',
    });
  }, []);

  // Manual Full Sync Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadRadarMetadata(), loadWeatherForecast(coordinates)]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070f1a] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#c59b48] selection:text-[#0b1e36]">
      {/* Top Banner / Breadcrumb & Status Bar with Top Clearance for Floating Navbar */}
      <header className="dark-surface relative bg-[#0b1e36] text-white border-b border-[#c59b48]/30 pt-16 sm:pt-20 pb-3 sm:pb-4 px-3 sm:px-6 shadow-xl z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Heading */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[#122c4d] border border-[#c59b48]/50 flex items-center justify-center text-[#c59b48] shadow-lg shadow-[#08172a]/60 shrink-0">
              <Radio className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse text-[#c59b48]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] sm:text-xs font-sans font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE DOPPLER NETWORK
                </span>
                <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                  • WMO RTC Compliant
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Live Weather Radar <span className="text-[#dfb76c] font-normal">& Nowcasting</span>
              </h1>
            </div>
          </div>

          {/* Right Tools: Units toggle, Sync Refresh, IMD Station quick badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Sync Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122c4d]/80 hover:bg-[#122c4d] border border-[#c59b48]/40 hover:border-[#c59b48] text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh radar imagery and weather nowcasts"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#c59b48] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Sync Radar</span>
            </button>

            {/* Quick Unit Temperature Toggle */}
            <div className="flex rounded-xl bg-[#122c4d]/80 p-1 border border-[#c59b48]/30 text-xs">
              <button
                type="button"
                onClick={() => setUnits((u) => ({ ...u, temperature: 'celsius' }))}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  units.temperature === 'celsius'
                    ? 'bg-[#c59b48] gold-ink shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnits((u) => ({ ...u, temperature: 'fahrenheit' }))}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  units.temperature === 'fahrenheit'
                    ? 'bg-[#c59b48] gold-ink shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            {/* Active Radar Frame Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#122c4d]/50 border border-slate-700/60 text-xs font-mono">
              <Satellite className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300">
                Frames:{' '}
                <strong className="text-white">
                  {(radarMetadata?.past?.length || 0) + (radarMetadata?.nowcast?.length || 0)}
                </strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Host: <strong className="text-emerald-400">RainViewer v2</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Selector Navigation (<lg) */}
        <div className="lg:hidden mt-3 pt-2 border-t border-slate-800 flex items-center justify-around text-xs font-semibold font-sans">
          <button
            type="button"
            onClick={() => setActiveMobileTab('map')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeMobileTab === 'map'
                ? 'border-[#c59b48] text-[#c59b48] font-bold bg-[#c59b48]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Radar Map
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('hud')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeMobileTab === 'hud'
                ? 'border-[#c59b48] text-[#c59b48] font-bold bg-[#c59b48]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Weather Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('stations')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeMobileTab === 'stations'
                ? 'border-[#c59b48] text-[#c59b48] font-bold bg-[#c59b48]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            38 IMD Stations
          </button>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Search Bar & Geolocation Bar */}
        <div className="w-full">
          <WeatherSearchBar
            onLocationSelect={handleLocationSelect}
            currentLocation={coordinates}
            className="w-full max-w-4xl mx-auto"
            placeholder="Search any Indian district, global city, coordinates (e.g. 28.61, 77.20), or landmark..."
          />
        </div>

        {/* Primary Desktop Split Screen View (Map on Left / Telemetry HUD on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Doppler Radar Map (7 cols on lg, 8 on xl) */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col space-y-4 ${
              activeMobileTab !== 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/90 shadow-xl dark:shadow-2xl bg-white dark:bg-slate-950">
              <WeatherRadarMap
                center={[coordinates.lat, coordinates.lon]}
                zoom={7}
                selectedLocationName={coordinates.name}
                currentDbz={weatherData?.derivedDbz}
                metadata={radarMetadata}
                onSelectLocation={handleMapLocationClick}
                className="w-full h-[550px] sm:h-[620px] xl:h-[680px]"
                showControls={true}
                showLegend={true}
                showLayerMenu={true}
              />
            </div>

            {/* Quick Overview Note under map */}
            <div className="flex items-center justify-between px-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#c59b48]" />
                <span>
                  Active Target: <strong className="text-slate-900 dark:text-white">{coordinates.name || 'Selected Position'}</strong> ({coordinates.lat.toFixed(3)}°, {coordinates.lon.toFixed(3)}°)
                </span>
              </span>
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
                Click anywhere on the map to inspect localized nowcasts
              </span>
            </div>
          </div>

          {/* Right Column: Live Weather Telemetry & Nowcast HUD (5 cols on lg, 4 on xl) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 flex flex-col space-y-5 ${
              activeMobileTab !== 'hud' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* 1. Storm Severity Risk Gauge */}
            {weatherData?.current && (
              <StormSeverityIndicator
                stormSeverityIndex={weatherData.stormSeverityIndex}
                current={weatherData.current}
                derivedDbz={weatherData.derivedDbz}
                hourly={weatherData.hourly}
                compact={false}
              />
            )}

            {/* 2. Current Conditions & 8-Card Telemetry Grid */}
            <WeatherMetricsHud
              weatherData={weatherData}
              units={units}
              onUnitsChange={setUnits}
              isLoading={isLoadingWeather}
              showLocationHeader={true}
            />

            {/* 3. Hourly Nowcasting Strip */}
            {weatherData?.hourly && weatherData.hourly.length > 0 && (
              <HourlyNowcastStrip
                hourly={weatherData.hourly}
                currentWeather={weatherData.current}
                units={units}
              />
            )}

            {/* 4. 7-Day Synoptic Multi-Day Forecast */}
            {weatherData?.daily && weatherData.daily.length > 0 && (
              <MultiDayForecast daily={weatherData.daily} units={units} />
            )}
          </div>
        </div>

        {/* 38 IMD Doppler Weather Radar Network Quick Carousel */}
        <section
          className={`mt-8 bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-2xl ${
            activeMobileTab !== 'stations' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-[#c59b48]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  National IMD Doppler Radar Network (38 Nodes)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any operational radar station to immediately center the live Doppler scope and synchronize nowcasting telemetry.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                38/38 ONLINE
              </span>
            </div>
          </div>

          {/* Grid of Stations */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {ALL_38_DOPPLER_NODES.map((node) => {
              const isSelected = selectedStationId === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    handleStationSelect(node);
                    if (activeMobileTab === 'stations') {
                      setActiveMobileTab('map');
                    }
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-200 group ${
                    isSelected
                      ? 'bg-[#c59b48]/20 border-[#c59b48] shadow-md ring-1 ring-[#c59b48]'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-[#c59b48]/50 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#9a7224] dark:text-[#dfb76c] border border-slate-200 dark:border-slate-700">
                      {node.band}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#9a7224] dark:group-hover:text-[#dfb76c] transition-colors">
                    {node.city || node.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{node.state}</div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 dark:border-slate-800/60 text-[9px] font-mono text-slate-500 dark:text-slate-400">
                    <span>{node.maxRangeKm} km</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{node.reflectivityDbz || 25} dBZ</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RadarPageContent;
