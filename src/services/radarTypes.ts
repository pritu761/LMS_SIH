// ============================================================================
// Radar ops shared types (Phase 2.3). CLIENT-SAFE.
// Products other than Z are SIMULATED training overlays synthesized from the
// storm-cell model (documented in the UI) — only Z uses live mosaic tiles.
// ============================================================================

export type RadarProductId = 'Z' | 'V' | 'ZDR' | 'KDP' | 'CC' | 'ET';

export interface ProductStep {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface RadarProduct {
  id: RadarProductId;
  name: string;
  unit: string;
  live: boolean;
  description: string;
  interpretation: string;
  steps: ProductStep[];
}

export interface OpsStation {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  band: string;
  maxRangeKm: number;
  reflectivityDbz: number | null;
  status: string;
}

export interface StormTrack {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  peakDbz: number;
  velocityKmh: number;
  headingDeg: number;
  precipitationType: string;
}

export type AlertSeverity = 'RED' | 'ORANGE' | 'YELLOW';

export interface WeatherAlert {
  id: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  severity: AlertSeverity;
  phenomenon: string;
  validFrom: string;
  validTo: string;
  description: string;
}

export interface CaseStep {
  t: number;
  label: string;
  note: string;
}

export interface CaseQuestion {
  atStep: number;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TrainingCase {
  id: string;
  code: string;
  title: string;
  description: string;
  phenomenon: string | null;
  competencyTag: string | null;
  timesteps: CaseStep[];
  questions: CaseQuestion[];
  bestScore: number | null;
  bestTotal: number | null;
  attempts: number;
}

export interface AnnotationShape {
  tool: 'free' | 'rect' | 'circle' | 'arrow';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface SharedStudy {
  id: string;
  caseCode: string;
  caseTitle: string;
  authorName: string;
  cohortCode: string | null;
  frameT: number;
  note: string;
  drawing: { shapes: AnnotationShape[] };
  createdAt: string;
}
