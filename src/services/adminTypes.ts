// ============================================================================
// Admin dashboard shared types (Phase 1.5). CLIENT-SAFE: no Node-only imports.
// ============================================================================

export interface ApprovalItem {
  id: string;
  name: string;
  email: string;
  role: string;
  cadre: string | null;
  station: string | null;
  submittedAt: string;
  slaHrs: number;
  breached: boolean;
  status: string;
  reviewedAt: string | null;
  reviewerName: string | null;
}

export interface ApprovalList {
  pending: ApprovalItem[];
  pendingCount: number;
  breachedCount: number;
  recent: ApprovalItem[];
}

export interface AuditEntry {
  id: string;
  createdAt: string;
  actorName: string;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  diff: unknown;
}

export interface AuditList {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  actions: string[];
  entityTypes: string[];
}

export interface AdminStation {
  code: string;
  name: string;
  city: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  radarType: string;
  readiness: number;
  cadre: number;
  topGap: string | null;
  updated: string | null;
}

export interface RegionSummary {
  region: string;
  avg: number;
  count: number;
  atRisk: number;
}

export interface StationSummary {
  nationalAvg: number;
  atRisk: number;
  total: number;
  certsThisMonth: number;
  byRegion: RegionSummary[];
}

export interface BulkJobView {
  id: string;
  type: string;
  status: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdAt: string;
  hasErrors: boolean;
}

export interface BulkPreview {
  jobId: string;
  type: string;
  fileName: string;
  columns: string[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface BulkConfirmResult {
  jobId: string;
  status: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface ReportInfo {
  id: string;
  name: string;
  description: string;
}

export const REPORTS: ReportInfo[] = [
  { id: 'readiness-station', name: 'Readiness by Station', description: 'Readiness %, cadre strength and top gap per radar station.' },
  { id: 'readiness-cadre', name: 'Readiness by Cadre', description: 'Headcount, mean readiness and mean gap per cadre.' },
  { id: 'readiness-domain', name: 'Readiness by Domain', description: 'Mean score vs required per competency domain.' },
  { id: 'certification-rate', name: 'Certification Completion Rate', description: 'Certificates issued per month with trainee-base rate.' },
  { id: 'trainer-effectiveness', name: 'Trainer Effectiveness', description: 'Cohorts, trainees, readiness and ratings per trainer.' },
  { id: 'gap-trend', name: 'Gap Trend Over Time', description: 'Weekly average assessment performance per cohort (12 weeks).' },
];

export interface ReportTable {
  title: string;
  generatedAt: string;
  columns: string[];
  rows: string[][];
  note?: string;
}

export interface AdminCertificate {
  id: string;
  holderName: string;
  holderEmail: string;
  moduleTitle: string;
  trackCode: string | null;
  issuedAt: string;
  verificationId: string;
  status: string;
  score: number | null;
}
