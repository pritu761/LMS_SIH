export type RadarBand = 'S-Band' | 'C-Band' | 'X-Band';

export type RadarRegion =
  | 'Northern Himalayas'
  | 'Bay of Bengal Coast'
  | 'Arabian Sea Coast'
  | 'Central & Plains'
  | 'Northeast India'
  | 'Island Outposts';

export type RadarStatus = 'ONLINE' | 'STREAMING' | 'NOWCASTING' | 'CALIBRATING';

export type HydrometeorClass =
  | 'Light Rain / Drizzle'
  | 'Moderate Stratiform Rain'
  | 'Heavy Convective Rain'
  | 'Severe Squall Line'
  | 'Tropical Cyclone Spiral Band'
  | 'Hail Core / Graupel'
  | 'Wet Snow / Melting Layer'
  | 'Clear Air / Marine Boundary';

export type PolarimetricProduct = 'Z' | 'V' | 'ZDR' | 'CC' | 'KDP';

export interface RadarNode {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  region: RadarRegion;
  lat: number;
  lng: number;
  elevationM: number;
  band: RadarBand;
  frequencyGhz: string;
  peakPowerKw: number;
  antennaDiameterM: number;
  beamWidthDeg: number;
  maxRangeKm: number;
  prfHz: number;
  vMaxMs: number;
  operatingMode: string;
  status: RadarStatus;
  latencyMs: number;
  uptimePercent: number;
  noiseFloorDbm: number;
  calibrationOffsetDb: number;
  reflectivityDbz: number;
  zdrDb: number;
  correlationCoeff: number;
  kdpDegKm: number;
  velocityMs: number;
  azimuthDeg: number;
  elevationDeg: number;
  hydrometeorType: HydrometeorClass;
  traineesConnected: number;
  lastScanTime: string;
  scanStrategy: string;
}

export interface RadarNetworkSummary {
  totalNodes: number;
  onlineNodes: number;
  streamingNodes: number;
  nowcastingAlerts: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  nationalCoverageSqKm: number;
  telemetryThroughputMbPerSec: number;
  activeTraineeObservers: number;
  lastSyncTimestamp: string;
}

export interface DiagnosticResult {
  nodeId: string;
  testName: string;
  passed: boolean;
  timestamp: string;
  details: {
    snrDb: number;
    nyquistDealiased: boolean;
    txPowerKw: number;
    zdrBiasDb: number;
    azimuthAlignmentErrorDeg: number;
    waveguideLossDb: number;
  };
  log: string[];
}
