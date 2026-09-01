'use strict';
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Crosshair,
  Loader2,
  X,
  Globe2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { Coordinates } from '@/types/weather';
import { fetchLocationCoordinates } from '@/lib/weatherService';
import { PRESET_LOCATIONS } from '@/lib/mockWeatherData';

export interface WeatherSearchBarProps {
  onLocationSelect: (location: Coordinates) => void;
  currentLocation?: Coordinates | null;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const POPULAR_PRESETS: Array<{ name: string; admin1?: string; country: string; lat: number; lon: number }> = [
  { name: 'New Delhi', admin1: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', admin1: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'Bengaluru', admin1: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', admin1: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', admin1: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Srinagar', admin1: 'Jammu & Kashmir', country: 'India', lat: 34.0837, lon: 74.7973 },
  { name: 'London', admin1: 'Greater London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', admin1: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
];

export const WeatherSearchBar: React.FC<WeatherSearchBarProps> = ({
  onLocationSelect,
  currentLocation,
  className = '',
  placeholder = 'Search city, state, country, or lat, lon coordinates...',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Coordinates[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced Search Effect
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      try {
        const locations = await fetchLocationCoordinates(trimmed, abortController.signal);
        setResults(locations);
        setIsOpen(true);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Location search error:', err);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (loc: Coordinates) => {
      onLocationSelect(loc);
      setQuery(loc.name ? `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}` : `${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)}`);
      setIsOpen(false);
      setResults([]);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    },
    [onLocationSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        // Direct parse if available
        const coordMatch = query.trim().match(/^\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*$/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lon = parseFloat(coordMatch[2]);
          if (!isNaN(lat) && !isNaN(lon)) {
            handleSelect({
              lat,
              lon,
              name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
              country: 'Coordinate Target',
            });
          }
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setTimeout(() => setGeoError(null), 4000);
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const geoTarget: Coordinates = {
          lat: latitude,
          lon: longitude,
          name: 'My GPS Location',
          country: 'Local Device',
        };
        handleSelect(geoTarget);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setGeoError(msg);
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Bar Input Container */}
      <div className="relative flex items-center w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:border-amber-500/50 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl shadow-lg transition-all duration-200">
        <div className="pl-3.5 pr-2 text-slate-400">
          <Search className="w-4 h-4 text-amber-400/90" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-2.5 pr-20 text-sm text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        <div className="absolute right-2 flex items-center space-x-1.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin mr-1" />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleGeolocation}
            disabled={isLocating}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
              isLocating
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-amber-300'
            }`}
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {/* Geolocation error notification */}
      {geoError && (
        <div className="absolute top-full left-0 right-0 mt-1.5 px-3 py-1.5 bg-red-900/90 border border-red-700/80 rounded-lg text-xs text-red-200 z-50 shadow-lg animate-fadeIn">
          {geoError}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800 animate-fadeIn">
          {results.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Matching Locations</span>
                <span className="text-[10px] text-slate-500">{results.length} found</span>
              </div>
              {results.map((loc, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${loc.lat}-${loc.lon}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-start space-x-3 transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 text-white'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <MapPin
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isSelected ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-100 truncate">
                          {loc.name || 'Unnamed Location'}
                        </span>
                        {loc.country && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {loc.country}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        {loc.admin1 && <span>{loc.admin1}</span>}
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°E
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="px-4 py-6 text-center text-slate-400 text-xs">
              <Globe2 className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="font-medium text-slate-300">No locations found for &ldquo;{query}&rdquo;</p>
              <p className="text-slate-500 mt-1">
                Try searching for a major city, state, or direct coordinate format (e.g. 28.61, 77.20)
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Preset Location Chips */}
      <div className="mt-2 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1 flex-shrink-0 mr-0.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick:</span>
        </span>
        {POPULAR_PRESETS.map((preset) => {
          const isCurrent =
            currentLocation &&
            Math.abs(currentLocation.lat - preset.lat) < 0.1 &&
            Math.abs(currentLocation.lon - preset.lon) < 0.1;

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                handleSelect({
                  lat: preset.lat,
                  lon: preset.lon,
                  name: preset.name,
                  admin1: preset.admin1,
                  country: preset.country,
                })
              }
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherSearchBar;
