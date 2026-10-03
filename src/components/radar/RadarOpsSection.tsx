'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlaskConical, Layers, GraduationCap, Map as MapIcon } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import { AlertsPanel } from './AlertsPanel';
import { CaseTrainingPanel, TrainingLoginGate } from './CaseTrainingPanel';
import { AnnotateCanvas } from './AnnotateCanvas';
import { MOCK_RADAR_HOTSPOTS } from '@/lib/mockRadarData';
import { fetchRadarMetadata, getRadarTileUrl } from '@/lib/weatherService';
import type { OpsStation, RadarProductId, StormTrack, WeatherAlert } from '@/services/radarTypes';

// Leaflet touches `window` at import — client-only like the main scope.
const OpsMap = dynamic(() => import('./OpsMap').then((m) => m.OpsMap), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" aria-label="Loading operations map" className="flex h-[420px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 sm:h-[520px] dark:bg-white/5">
      <MapIcon className="h-8 w-8 animate-pulse text-[#c59b48]" aria-hidden="true" />
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">Loading operations map…</p>
    </div>
  ),
});

interface MeResponse {
  user?: { role?: string; fullName?: string };
}

const TRACKS: StormTrack[] = MOCK_RADAR_HOTSPOTS.map((h) => ({
  id: h.id,
  name: h.name,
  lat: h.lat,
  lon: h.lon,
  radiusKm: h.radiusKm,
  peakDbz: h.peakDbz,
  velocityKmh: h.velocityKmH,
  headingDeg: h.headingDeg,
  precipitationType: h.precipitationType,
}));

/**
 * Operations & training layer (Phase 2.3): product selector, ops map
 * (stations, rings, tracks, warnings, dual-pol products), live alerts,
 * case-based training mode (login) and trainer annotations. Additive —
 * the existing scope/HUD/timeline above are untouched.
 */
export function RadarOpsSection() {
  const [stations, setStations] = useState<OpsStation[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [alertsMeta, setAlertsMeta] = useState({ updatedAt: new Date().toISOString(), source: 'mock' });
  const [role, setRole] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [cohorts, setCohorts] = useState<Array<{ id: string; code: string }>>([]);
  const [tileTemplate, setTileTemplate] = useState<string | null>(null);

  const [product, setProduct] = useState<RadarProductId>('Z');
  const [showStations, setShowStations] = useState(true);
  const [ringMode, setRingMode] = useState<'none' | 'selected' | 'all'>('selected');
  const [showTracks, setShowTracks] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [trainingMode, setTrainingMode] = useState(false);
  const [caseStep, setCaseStep] = useState(0);
  const [caseSteps, setCaseSteps] = useState(1);

  useEffect(() => {
    fetch('/api/radar/stations')
      .then(async (r) => {
        const b = (await r.json()) as { success: boolean; data?: { stations: OpsStation[] } };
        if (b.success && b.data) setStations(b.data.stations);
      })
      .catch(() => {});
    fetch('/api/radar/alerts')
      .then(async (r) => {
        const b = (await r.json()) as { success: boolean; data?: { alerts: WeatherAlert[]; updatedAt: string; source: string } };
        if (b.success && b.data) {
          setAlerts(b.data.alerts);
          setAlertsMeta({ updatedAt: b.data.updatedAt, source: b.data.source });
        }
      })
      .catch(() => {});
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return;
        const b = (await r.json()) as MeResponse;
        setRole(b.user?.role ?? null);
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
    fetchRadarMetadata()
      .then((meta) => {
        const frames = [...(meta.past ?? []), ...(meta.nowcast ?? [])];
        const host = (meta as unknown as { host?: string }).host;
        const latest = meta.past && meta.past.length > 0 ? meta.past[meta.past.length - 1] : frames[0];
        if (host && latest) {
          setTileTemplate(getRadarTileUrl(host, latest.path, 18, 0, 0, 2, true, true, 256).replace('/18/0/0/', '/{z}/{x}/{y}/'));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (role === 'TRAINER' || role === 'ADMIN') {
      fetch('/api/trainer/cohorts')
        .then(async (r) => {
          const b = (await r.json()) as { success: boolean; data?: { cohorts: Array<{ id: string; code: string }> } };
          if (b.success && b.data) setCohorts(b.data.cohorts);
        })
        .catch(() => {});
    }
  }, [role]);

  const onCaseStep = useCallback((_step: number, total: number) => {
    setCaseStep(_step);
    setCaseSteps(Math.max(1, total));
  }, []);

  const simIntensity = useMemo(() => (caseSteps <= 1 ? 1 : caseStep / (caseSteps - 1)), [caseStep, caseSteps]);
  const isTrainer = role === 'TRAINER' || role === 'ADMIN';
  const loggedIn = role !== null;

  return (
    <section id="operations" aria-labelledby="ops-heading" className="mt-8 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 id="ops-heading" className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
            <Layers className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
            Operations Layer — Stations, Products & Training
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            38 clickable stations with 150/250/500 km rings • storm tracks • warnings • dual-pol products • guided cases
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={() => setTrainingMode((v) => !v)}
            aria-pressed={trainingMode}
            title={loggedIn ? 'Replay historical severe-weather cases with guided quizzes' : 'Log in to unlock case training'}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
              trainingMode
                ? 'bg-[#c59b48] text-[#0b1e36]'
                : 'border border-[#c59b48]/50 bg-[#c59b48]/10 text-[#9a7224] hover:bg-[#c59b48]/20 dark:text-[#dfb76c]'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            {trainingMode ? 'Exit Training Mode' : 'Switch to Training Mode'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ProductSelector product={product} onChange={setProduct} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <OpsMap
              stations={stations}
              tracks={TRACKS}
              alerts={alerts}
              product={product}
              showStations={showStations}
              ringMode={ringMode}
              showTracks={showTracks}
              showAlerts={showAlerts}
              selectedStationId={selectedStationId}
              onStationSelect={setSelectedStationId}
              selectedAlertId={selectedAlertId}
              onAlertSelect={setSelectedAlertId}
              simIntensity={trainingMode ? simIntensity : 1}
              tileTemplate={tileTemplate}
              className="rounded-none"
            />
            {isTrainer && <AnnotateCanvas cohorts={cohorts} caseId={null} frameT={caseStep} />}
          </div>
          {/* Layer toggles */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300" role="group" aria-label="Map layers">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showStations} onChange={(e) => setShowStations(e.target.checked)} className="h-3.5 w-3.5 accent-[#c59b48]" />
              Stations
            </label>
            <label className="inline-flex items-center gap-1.5">
              Rings
              <select value={ringMode} onChange={(e) => setRingMode(e.target.value as typeof ringMode)} aria-label="Coverage rings" className="rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20">
                <option value="none">Off</option>
                <option value="selected">Selected</option>
                <option value="all">All 38</option>
              </select>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showTracks} onChange={(e) => setShowTracks(e.target.checked)} className="h-3.5 w-3.5 accent-[#c59b48]" />
              Storm tracks
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} className="h-3.5 w-3.5 accent-[#c59b48]" />
              Warnings
            </label>
            {isTrainer && (
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase text-slate-500">
                <FlaskConical className="h-3 w-3" aria-hidden="true" />
                paint tools on map — share to cohort
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AlertsPanel alerts={alerts} selectedId={selectedAlertId} onSelect={setSelectedAlertId} updatedAt={alertsMeta.updatedAt} source={alertsMeta.source} />
          {trainingMode && (
            <div className="rounded-2xl border border-[#c59b48]/40 bg-white p-4 shadow-sm dark:border-[#c59b48]/30 dark:bg-[#0b1e36]/60">
              <h3 className="flex items-center gap-2 font-display text-sm font-extrabold text-[#0b1e36] dark:text-white">
                <GraduationCap className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
                Case training
              </h3>
              <div className="mt-3">
                {!sessionChecked ? (
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" aria-label="Checking session" />
                ) : loggedIn ? (
                  <CaseTrainingPanel onStep={onCaseStep} />
                ) : (
                  <TrainingLoginGate />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
