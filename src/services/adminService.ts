import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { toCsv } from '@/lib/csv';
import { generateTempPassword } from '@/lib/mailer';
import { notifyUser } from '@/lib/notify';
import { sanitizeOptional, sanitizeText } from '@/lib/sanitize';
import type {
  AdminCertificate,
  AdminStation,
  ApprovalItem,
  ApprovalList,
  AuditEntry,
  AuditList,
  BulkConfirmResult,
  BulkJobView,
  BulkPreview,
  ReportTable,
  StationSummary,
} from './adminTypes';

// ============================================================================
// Admin dashboard data access (Phase 1.5). All entry points assume the caller
// already passed requireAdminSession. Every mutation writes an append-only
// audit row (the app layer never UPDATEs or DELETEs AuditLog).
// ============================================================================

export const APPROVAL_SLA_HOURS = 48;

export interface AuditInput {
  actorId: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ip?: string | null;
  diff?: unknown;
  metadata?: unknown;
}

/** Append-only audit write. There is intentionally no update/delete helper. */
export async function logAudit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      ipAddress: input.ip ?? null,
      diff: (input.diff ?? {}) as object,
      metadata: (input.metadata ?? {}) as object,
    },
  });
}

function slaHours(since: Date, now: number): number {
  return Math.max(0, Math.floor((now - since.getTime()) / 3600000));
}

function toApprovalItem(
  u: {
    id: string;
    email: string;
    role: string;
    cadre: string | null;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    profile: { fullName: string } | null;
    station: { name: string } | null;
    reviewedBy: { profile: { fullName: string } | null; email: string } | null;
  },
  now: number
): ApprovalItem {
  const sla = slaHours(u.createdAt, now);
  return {
    id: u.id,
    name: u.profile?.fullName ?? u.email,
    email: u.email,
    role: u.role,
    cadre: u.cadre,
    station: u.station?.name ?? null,
    submittedAt: u.createdAt.toISOString(),
    slaHrs: sla,
    breached: u.status === 'PENDING' && sla > APPROVAL_SLA_HOURS,
    status: u.status,
    reviewedAt: u.reviewedAt ? u.reviewedAt.toISOString() : null,
    reviewerName: u.reviewedBy ? (u.reviewedBy.profile?.fullName ?? u.reviewedBy.email) : null,
  };
}

export async function getApprovals(): Promise<ApprovalList> {
  const now = Date.now();
  const [pending, recent] = await Promise.all([
    prisma.user.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        profile: { select: { fullName: true } },
        station: { select: { name: true } },
        reviewedBy: { include: { profile: { select: { fullName: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { reviewedAt: { not: null } },
      orderBy: { reviewedAt: 'desc' },
      take: 20,
      include: {
        profile: { select: { fullName: true } },
        station: { select: { name: true } },
        reviewedBy: { include: { profile: { select: { fullName: true } } } },
      },
    }),
  ]);
  const pendingItems = pending.map((u) => toApprovalItem(u, now));
  return {
    pending: pendingItems,
    pendingCount: pendingItems.length,
    breachedCount: pendingItems.filter((p) => p.breached).length,
    recent: recent.map((u) => toApprovalItem(u, now)),
  };
}

export type ReviewAction = 'approve' | 'reject' | 'info';

export interface ReviewInput {
  action: ReviewAction;
  reason?: string;
  message?: string;
  role?: 'TRAINEE' | 'TRAINER' | 'ADMIN';
}

export async function reviewRegistration(
  adminId: string,
  ip: string | null,
  userId: string,
  input: ReviewInput
): Promise<{ status: string; tempPassword: string | null; mailSent: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { select: { fullName: true } }, station: { select: { name: true } } },
  });
  if (!user) {
    const e = new Error('Registration not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'REGISTRATION_NOT_FOUND';
    throw e;
  }
  if (user.status !== 'PENDING') {
    const e = new Error(`Already ${user.status.toLowerCase()} — only pending registrations can be reviewed.`) as Error & { status?: number; code?: string };
    e.status = 409;
    e.code = 'ALREADY_REVIEWED';
    throw e;
  }
  if (input.action === 'reject' && !input.reason?.trim()) {
    const e = new Error('A rejection reason is mandatory.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'REASON_REQUIRED';
    throw e;
  }

  const name = user.profile?.fullName ?? user.email;

  if (input.action === 'info') {
    const cleanMessage = sanitizeOptional(input.message);
    await prisma.auditLog.create({
      data: { actorId: adminId, actorRole: 'ADMIN', action: 'INFO_REQUESTED', entityType: 'User', entityId: user.id, ipAddress: ip, diff: {}, metadata: { message: cleanMessage } },
    });
    const mail = await notifyUser({
      userId: user.id,
      type: 'REGISTRATION_INFO_REQUESTED',
      title: 'More information needed for your registration',
      body: cleanMessage ?? 'An administrator requested additional details to verify your registration. Please update your profile and reply to the helpdesk.',
      link: '/auth/pending',
      email: { subject: 'CapacityConnect registration: more information needed', text: `Dear ${name},\n\n${cleanMessage ?? 'Please provide additional details to verify your registration.'}\n\n— CapacityConnect administration` },
    });
    return { status: 'PENDING', tempPassword: null, mailSent: mail.emailed };
  }

  if (input.action === 'reject') {
    const reason = sanitizeText(input.reason ?? '', 2000);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { status: 'REJECTED', rejectionReason: reason, reviewedAt: new Date(), reviewedById: adminId },
      }),
      prisma.auditLog.create({
        data: { actorId: adminId, actorRole: 'ADMIN', action: 'USER_REJECTED', entityType: 'User', entityId: user.id, ipAddress: ip, diff: { before: { status: 'PENDING' }, after: { status: 'REJECTED', reason } }, metadata: {} },
      }),
    ]);
    const mail = await notifyUser({
      userId: user.id,
      type: 'REGISTRATION_REJECTED',
      title: 'Registration decision: not approved',
      body: `Your CapacityConnect registration was not approved. Reason: ${reason}`,
      link: '/auth/login',
      email: { subject: 'CapacityConnect registration decision', text: `Dear ${name},\n\nYour registration was not approved.\nReason: ${reason}\n\n— CapacityConnect administration` },
    });
    return { status: 'REJECTED', tempPassword: null, mailSent: mail.emailed };
  }

  // approve
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const roleChanged = input.role !== undefined && input.role !== user.role;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'APPROVED',
        isVerified: true,
        passwordHash,
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedById: adminId,
        ...(roleChanged && input.role ? { role: input.role } : {}),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'USER_APPROVED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip,
        diff: { before: { status: 'PENDING', role: user.role }, after: { status: 'APPROVED', role: roleChanged && input.role ? input.role : user.role } },
        metadata: { tempPasswordIssued: true },
      },
    }),
    ...(roleChanged && input.role
      ? [
          prisma.auditLog.create({
            data: { actorId: adminId, actorRole: 'ADMIN', action: 'ROLE_CHANGED', entityType: 'User', entityId: user.id, ipAddress: ip, diff: { before: { role: user.role }, after: { role: input.role } }, metadata: {} },
          }),
        ]
      : []),
  ]);
  const mail = await notifyUser({
    userId: user.id,
    type: 'REGISTRATION_APPROVED',
    title: 'Registration approved — welcome to CapacityConnect',
    body: `Your account is approved${roleChanged ? ` with role ${input.role}` : ''}. Temporary password: ${tempPassword} — sign in and change it immediately.`,
    link: '/auth/login',
    email: {
      subject: 'Welcome to CapacityConnect — registration approved',
      text: `Dear ${name},\n\nYour CapacityConnect registration is approved.\nSign in at the portal with this temporary password: ${tempPassword}\nPlease change it immediately after signing in.\n\n— CapacityConnect administration`,
    },
  });
  return { status: 'APPROVED', tempPassword, mailSent: mail.emailed };
}

/** Escalate an SLA-breached registration: alert every active admin. */
export async function escalateApproval(adminId: string, ip: string | null, userId: string): Promise<{ alerted: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { select: { fullName: true } } },
  });
  if (!user || user.status !== 'PENDING') {
    const e = new Error('Only pending registrations can be escalated.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'REGISTRATION_NOT_FOUND';
    throw e;
  }
  const sla = slaHours(user.createdAt, Date.now());
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN', status: 'APPROVED' }, select: { id: true } });
  const others = admins.filter((a) => a.id !== adminId);
  for (const a of others) {
    await notifyUser({
      userId: a.id,
      type: 'SLA_BREACH',
      title: `SLA breach: ${user.profile?.fullName ?? user.email} waiting ${sla}h`,
      body: `Registration ${user.email} has been pending ${sla}h (SLA ${APPROVAL_SLA_HOURS}h). Immediate review required.`,
      link: '/admin/approvals',
      email: { subject: `SLA breach: registration pending ${sla}h`, text: `Registration ${user.email} has been pending ${sla}h (SLA ${APPROVAL_SLA_HOURS}h). Please review in the admin approval queue.` },
    });
  }
  await logAudit({
    actorId: adminId,
    actorRole: 'ADMIN',
    action: 'SLA_ESCALATED',
    entityType: 'User',
    entityId: user.id,
    ip,
    diff: {},
    metadata: { slaHrs: sla, alerted: others.length },
  });
  return { alerted: others.length };
}

// ---------------------------------------------------------------------------
// Audit log (read-only; writes happen inside mutations above/below)
// ---------------------------------------------------------------------------

export interface AuditFilters {
  action?: string;
  actor?: string;
  entityType?: string;
  from?: Date;
  to?: Date;
}

export async function getAudit(filters: AuditFilters, page: number, limit: number): Promise<AuditList> {
  const where: { action?: string; entityType?: string; createdAt?: { gte?: Date; lte?: Date }; actorId?: string } = {};
  if (filters.action) where.action = filters.action;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }
  if (filters.actor) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: filters.actor, mode: 'insensitive' } },
          { profile: { fullName: { contains: filters.actor, mode: 'insensitive' } } },
        ],
      },
      select: { id: true },
    });
    where.actorId = users.length === 1 ? users[0].id : '__none__';
    if (users.length !== 1 && users.length > 0) {
      delete where.actorId;
      where.actorId = { in: users.map((u) => u.id) } as unknown as string;
    }
    if (users.length === 0) where.actorId = '__none__';
  }
  const [total, rows, actions, entityTypes] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { actor: { include: { profile: { select: { fullName: true } } } } },
    }),
    prisma.auditLog.groupBy({ by: ['action'], _count: { action: true }, orderBy: { action: 'asc' } }),
    prisma.auditLog.groupBy({ by: ['entityType'], _count: { entityType: true }, orderBy: { entityType: 'asc' } }),
  ]);
  return {
    entries: rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      actorName: r.actor ? (r.actor.profile?.fullName ?? r.actor.email) : 'System',
      actorRole: r.actorRole,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      ipAddress: r.ipAddress,
      diff: r.diff ?? {},
    })),
    total,
    page,
    limit,
    actions: actions.map((a) => a.action),
    entityTypes: entityTypes.map((e) => e.entityType),
  };
}

// ---------------------------------------------------------------------------
// Stations
// ---------------------------------------------------------------------------

export async function getStations(): Promise<{ stations: AdminStation[]; summary: StationSummary }> {
  const rows = await prisma.station.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
  const stations: AdminStation[] = rows.map((s) => ({
    code: s.code,
    name: s.name,
    city: s.city,
    state: s.state,
    region: s.region,
    lat: s.latitude,
    lng: s.longitude,
    radarType: s.radarType,
    readiness: Math.round(s.readinessPct),
    cadre: s.cadreCount,
    topGap: s.topGapDomain,
    updated: s.lastSurveyAt ? s.lastSurveyAt.toISOString() : null,
  }));
  const avg = stations.length === 0 ? 0 : Math.round(stations.reduce((n, s) => n + s.readiness, 0) / stations.length);
  const byRegion = new Map<string, { sum: number; n: number; atRisk: number }>();
  for (const s of stations) {
    const cur = byRegion.get(s.region) ?? { sum: 0, n: 0, atRisk: 0 };
    cur.sum += s.readiness;
    cur.n += 1;
    if (s.readiness < 60) cur.atRisk += 1;
    byRegion.set(s.region, cur);
  }
  const regions: StationSummary['byRegion'] = [];
  byRegion.forEach((v, region) => {
    regions.push({ region, avg: Math.round(v.sum / Math.max(1, v.n)), count: v.n, atRisk: v.atRisk });
  });
  regions.sort((a, b) => a.region.localeCompare(b.region));
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const certsThisMonth = await prisma.certificate.count({ where: { issuedAt: { gte: monthStart } } });
  return {
    stations,
    summary: {
      nationalAvg: avg,
      atRisk: stations.filter((s) => s.readiness < 60).length,
      total: stations.length,
      certsThisMonth,
      byRegion: regions,
    },
  };
}

// ---------------------------------------------------------------------------
// Bulk operations (two-step: validate → confirm)
// ---------------------------------------------------------------------------

export type BulkKind = 'OFFICER_ROSTER' | 'STATION_DATA' | 'BATCH_ASSIGNMENT';

export const BULK_COLUMNS: Record<BulkKind, string[]> = {
  OFFICER_ROSTER: ['email', 'fullName', 'role', 'cadre', 'stationCode', 'employeeCode', 'phone'],
  STATION_DATA: ['stationCode', 'readinessPct', 'cadreCount', 'topGapDomain'],
  BATCH_ASSIGNMENT: ['email', 'cohortCode'],
};

const VALID_DOMAINS = ['RAD-NOWCAST', 'NWP', 'HPC', 'DISASTER-OPS', 'SYNOPTIC', 'COMMS'];

export interface BulkRowError {
  row: number;
  field: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateBulkRows(
  type: BulkKind,
  rows: string[][]
): Promise<{ columns: string[]; totalRows: number; validRows: unknown[]; errors: BulkRowError[] }> {
  const expected = BULK_COLUMNS[type].map((c) => c.toLowerCase());
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = expected.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    const e = new Error(`Missing columns: ${missing.join(', ')}. Download the template.`) as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'CSV_BAD_HEADER';
    throw e;
  }
  const idx = (name: string) => header.indexOf(name);
  const get = (cells: string[], name: string) => (cells[idx(name)] ?? '').trim();
  const validRows: unknown[] = [];
  const errors: BulkRowError[] = [];
  const seenEmails = new Set<string>();

  if (type === 'OFFICER_ROSTER') {
    const existing = await prisma.user.findMany({ select: { email: true } });
    const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));
    const stations = await prisma.station.findMany({ select: { code: true } });
    const stationCodes = new Set(stations.map((s) => s.code.toUpperCase()));
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const line = r + 1;
      const email = get(cells, 'email').toLowerCase();
      const fullName = get(cells, 'fullname');
      const role = get(cells, 'role').toUpperCase();
      const cadre = get(cells, 'cadre');
      const stationCode = get(cells, 'stationcode').toUpperCase();
      const fail = (field: string, message: string) => errors.push({ row: line, field, message });
      let ok = true;
      if (!EMAIL_RE.test(email)) {
        fail('email', 'Invalid email format.');
        ok = false;
      } else if (existingEmails.has(email) || seenEmails.has(email)) {
        fail('email', 'Duplicate email (already registered or repeated in file).');
        ok = false;
      }
      if (fullName.length < 2) {
        fail('fullName', 'Full name is required.');
        ok = false;
      }
      if (role !== 'TRAINEE' && role !== 'TRAINER' && role !== 'ADMIN') {
        fail('role', 'Role must be TRAINEE, TRAINER or ADMIN.');
        ok = false;
      }
      if (!cadre) {
        fail('cadre', 'Cadre is required.');
        ok = false;
      }
      if (!stationCodes.has(stationCode)) {
        fail('stationCode', `Unknown station code "${get(cells, 'stationcode')}".`);
        ok = false;
      }
      if (ok) {
        seenEmails.add(email);
        validRows.push({ email, fullName, role, cadre, stationCode, employeeCode: get(cells, 'employeecode') || null, phone: get(cells, 'phone') || null });
      }
    }
  } else if (type === 'STATION_DATA') {
    const stations = await prisma.station.findMany({ select: { code: true } });
    const stationCodes = new Set(stations.map((s) => s.code.toUpperCase()));
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const line = r + 1;
      const code = get(cells, 'stationcode').toUpperCase();
      const readiness = Number(get(cells, 'readinesspct'));
      const cadre = Number(get(cells, 'cadrecount'));
      const topGap = get(cells, 'topgapdomain').toUpperCase();
      const fail = (field: string, message: string) => errors.push({ row: line, field, message });
      let ok = true;
      if (!stationCodes.has(code)) {
        fail('stationCode', `Unknown station code "${get(cells, 'stationcode')}".`);
        ok = false;
      }
      if (!Number.isFinite(readiness) || readiness < 0 || readiness > 100) {
        fail('readinessPct', 'Must be a number 0–100.');
        ok = false;
      }
      if (!Number.isInteger(cadre) || cadre < 0 || cadre > 10000) {
        fail('cadreCount', 'Must be a non-negative integer.');
        ok = false;
      }
      if (topGap && !VALID_DOMAINS.includes(topGap)) {
        fail('topGapDomain', `Must be one of ${VALID_DOMAINS.join(', ')}.`);
        ok = false;
      }
      if (ok) validRows.push({ stationCode: code, readinessPct: readiness, cadreCount: cadre, topGapDomain: topGap || null });
    }
  } else {
    const users = await prisma.user.findMany({ select: { email: true } });
    const userEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const cohorts = await prisma.cohort.findMany({ select: { code: true } });
    const cohortCodes = new Set(cohorts.map((c) => c.code.toUpperCase()));
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const line = r + 1;
      const email = get(cells, 'email').toLowerCase();
      const cohortCode = get(cells, 'cohortcode').toUpperCase();
      const fail = (field: string, message: string) => errors.push({ row: line, field, message });
      let ok = true;
      if (!userEmails.has(email)) {
        fail('email', 'No registered user with this email.');
        ok = false;
      }
      if (!cohortCodes.has(cohortCode)) {
        fail('cohortCode', `Unknown cohort code "${get(cells, 'cohortcode')}".`);
        ok = false;
      }
      if (ok) validRows.push({ email, cohortCode });
    }
  }

  return { columns: BULK_COLUMNS[type], totalRows: rows.length - 1, validRows, errors };
}

/** Distinct spreadsheet rows carrying at least one error (failed ROWS, not entries). */
function distinctErrorRows(errors: BulkRowError[]): number {
  const seen: Record<number, boolean> = {};
  let n = 0;
  for (const e of errors) {
    if (!seen[e.row]) {
      seen[e.row] = true;
      n += 1;
    }
  }
  return n;
}

export async function createBulkJob(adminId: string, type: BulkKind, fileName: string, preview: { totalRows: number; validRows: unknown[]; errors: BulkRowError[] }): Promise<BulkPreview> {
  const errorRows = distinctErrorRows(preview.errors);
  const job = await prisma.bulkImportJob.create({
    data: {
      type,
      status: 'QUEUED',
      fileName,
      totalRows: preview.totalRows,
      successRows: 0,
      failedRows: errorRows,
      errors: preview.errors.slice(0, 200) as object,
      payload: { validRows: preview.validRows } as object,
      createdBy: { connect: { id: adminId } },
    },
  });
  return {
    jobId: job.id,
    type,
    fileName,
    columns: BULK_COLUMNS[type],
    totalRows: preview.totalRows,
    validRows: preview.validRows.length,
    errorRows,
    errors: preview.errors.slice(0, 50),
  };
}

interface RosterRow {
  email: string;
  fullName: string;
  role: string;
  cadre: string;
  stationCode: string;
  employeeCode: string | null;
  phone: string | null;
}

export async function confirmBulkJob(adminId: string, ip: string | null, jobId: string): Promise<BulkConfirmResult> {
  const job = await prisma.bulkImportJob.findUnique({ where: { id: jobId } });
  if (!job) {
    const e = new Error('Bulk job not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'JOB_NOT_FOUND';
    throw e;
  }
  if (job.status !== 'QUEUED') {
    const e = new Error(`Job already ${job.status.toLowerCase()} — only queued jobs can be confirmed.`) as Error & { status?: number; code?: string };
    e.status = 409;
    e.code = 'JOB_NOT_QUEUED';
    throw e;
  }
  await prisma.bulkImportJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } });
  const payload = (job.payload ?? {}) as { validRows?: unknown[] };
  const rows = Array.isArray(payload.validRows) ? payload.validRows : [];
  const storedErrors: BulkRowError[] = Array.isArray(job.errors)
    ? (job.errors as unknown[]).filter(
        (e): e is BulkRowError =>
          typeof e === 'object' && e !== null && typeof (e as BulkRowError).row === 'number'
      )
    : [];
  let success = 0;

  try {
    if (job.type === 'OFFICER_ROSTER') {
      const stations = await prisma.station.findMany({ select: { id: true, code: true } });
      const stationByCode = new Map(stations.map((s) => [s.code.toUpperCase(), s.id]));
      for (const raw of rows) {
        const r = raw as RosterRow;
        try {
          const dup = await prisma.user.findUnique({ where: { email: r.email } });
          if (dup) throw new Error(`Duplicate email ${r.email} (registered after validation).`);
          const temp = generateTempPassword();
          const created = await prisma.user.create({
            data: {
              email: r.email,
              passwordHash: await bcrypt.hash(temp, 10),
              role: r.role as 'TRAINEE' | 'TRAINER' | 'ADMIN',
              status: 'PENDING',
              cadre: sanitizeText(r.cadre, 120),
              employeeCode: r.employeeCode,
              stationId: stationByCode.get(r.stationCode) ?? null,
              profile: { create: { fullName: sanitizeText(r.fullName, 120), phone: r.phone, organization: 'India Meteorological Department (IMD)' } },
            },
          });
          await notifyUser({
            userId: created.id,
            type: 'SYSTEM',
            title: 'Welcome to CapacityConnect — complete your registration',
            body: `Your officer account was bulk-imported. Sign in with temporary password ${temp} and await admin approval.`,
            link: '/auth/login',
            email: {
              subject: 'CapacityConnect invite — officer account created',
              text: `Dear ${r.fullName},\n\nAn officer account was created for you on CapacityConnect.\nTemporary password: ${temp}\nSign in and await admin approval.\n\n— CapacityConnect administration`,
            },
          });
          success += 1;
        } catch (e) {
          storedErrors.push({ row: 0, field: 'import', message: `${r.email}: ${e instanceof Error ? e.message : 'Import failed.'}` });
        }
      }
    } else if (job.type === 'STATION_DATA') {
      for (const raw of rows) {
        const r = raw as { stationCode: string; readinessPct: number; cadreCount: number; topGapDomain: string | null };
        try {
          await prisma.station.update({
            where: { code: r.stationCode },
            data: { readinessPct: r.readinessPct, cadreCount: r.cadreCount, topGapDomain: r.topGapDomain, lastSurveyAt: new Date() },
          });
          success += 1;
        } catch (e) {
          storedErrors.push({ row: 0, field: 'import', message: `${r.stationCode}: ${e instanceof Error ? e.message : 'Import failed.'}` });
        }
      }
    } else {
      const users = await prisma.user.findMany({ select: { id: true, email: true } });
      const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u.id]));
      const cohorts = await prisma.cohort.findMany({ select: { id: true, code: true } });
      const cohortByCode = new Map(cohorts.map((c) => [c.code.toUpperCase(), c.id]));
      for (const raw of rows) {
        const r = raw as { email: string; cohortCode: string };
        try {
          const userId = userByEmail.get(r.email);
          const cohortId = cohortByCode.get(r.cohortCode);
          if (!userId || !cohortId) throw new Error('User or cohort vanished after validation.');
          await prisma.cohortMember.upsert({
            where: { cohortId_userId: { cohortId, userId } },
            update: {},
            create: { cohortId, userId },
          });
          success += 1;
        } catch (e) {
          storedErrors.push({ row: 0, field: 'import', message: `${r.email} → ${r.cohortCode}: ${e instanceof Error ? e.message : 'Import failed.'}` });
        }
      }
    }
  } finally {
    const failed = distinctErrorRows(storedErrors);
    const status = failed === 0 ? 'DONE' : success === 0 ? 'FAILED' : 'PARTIAL';
    const errorCsv = failed === 0 ? null : toCsv(['row', 'field', 'message'], storedErrors.map((e) => [String(e.row), e.field, e.message]));
    await prisma.bulkImportJob.update({
      where: { id: jobId },
      data: { status, successRows: success, failedRows: failed, errors: storedErrors.slice(0, 500) as object, errorCsv },
    });
    await logAudit({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'BULK_IMPORTED',
      entityType: 'BulkImportJob',
      entityId: jobId,
      ip,
      diff: { before: { status: 'QUEUED' }, after: { status, success, failed } },
      metadata: { type: job.type, fileName: job.fileName },
    });
  }

  const updated = await prisma.bulkImportJob.findUnique({ where: { id: jobId } });
  return {
    jobId,
    status: updated?.status ?? 'DONE',
    totalRows: job.totalRows,
    successRows: success,
    failedRows: distinctErrorRows(storedErrors),
    errors: storedErrors.slice(0, 50),
  };
}

export async function listBulkJobs(): Promise<BulkJobView[]> {
  const rows = await prisma.bulkImportJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return rows.map((j) => ({
    id: j.id,
    type: j.type,
    status: j.status,
    fileName: j.fileName,
    totalRows: j.totalRows,
    successRows: j.successRows,
    failedRows: j.failedRows,
    createdAt: j.createdAt.toISOString(),
    hasErrors: j.failedRows > 0,
  }));
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function monthLabel(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function buildReport(id: string, from?: Date, to?: Date): Promise<ReportTable> {
  const generatedAt = new Date().toISOString();
  if (id === 'readiness-station') {
    const { stations } = await getStations();
    return {
      title: 'Readiness by Station',
      generatedAt,
      columns: ['code', 'station', 'state', 'region', 'readiness_pct', 'cadre', 'top_gap'],
      rows: stations.map((s) => [s.code, s.name, s.state, s.region, String(s.readiness), String(s.cadre), s.topGap ?? '']),
      note: 'Snapshot of current station readiness.',
    };
  }
  if (id === 'readiness-cadre') {
    const users = await prisma.user.findMany({
      where: { role: { in: ['TRAINEE', 'TRAINER'] }, status: 'APPROVED' },
      select: { id: true, cadre: true },
    });
    const scores = await prisma.competencyScore.findMany({ where: { userId: { in: users.map((u) => u.id) } } });
    const byUser = new Map<string, { sum: number; gap: number; n: number }>();
    for (const s of scores) {
      if (s.requiredScore <= 0) continue;
      const cur = byUser.get(s.userId) ?? { sum: 0, gap: 0, n: 0 };
      cur.sum += s.score;
      cur.gap += Math.max(0, ((s.requiredScore - s.score) / s.requiredScore) * 100);
      cur.n += 1;
      byUser.set(s.userId, cur);
    }
    const byCadre = new Map<string, { members: number; readiness: number; gap: number }>();
    for (const u of users) {
      const cadre = u.cadre ?? 'Unspecified';
      const cur = byCadre.get(cadre) ?? { members: 0, readiness: 0, gap: 0 };
      cur.members += 1;
      const agg = byUser.get(u.id);
      if (agg && agg.n > 0) {
        cur.readiness += agg.sum / agg.n;
        cur.gap += agg.gap / agg.n;
      }
      byCadre.set(cadre, cur);
    }
    const rows: string[][] = [];
    byCadre.forEach((v, cadre) => {
      rows.push([cadre, String(v.members), (v.readiness / Math.max(1, v.members)).toFixed(1), (v.gap / Math.max(1, v.members)).toFixed(1)]);
    });
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    return { title: 'Readiness by Cadre', generatedAt, columns: ['cadre', 'members', 'avg_readiness', 'avg_gap_pct'], rows, note: 'Snapshot; members without scores contribute 0 to averages.' };
  }
  if (id === 'readiness-domain') {
    const scores = await prisma.competencyScore.findMany();
    const byDomain = new Map<string, { sum: number; req: number; n: number; members: Set<string> }>();
    for (const s of scores) {
      const cur = byDomain.get(s.domain) ?? { sum: 0, req: 0, n: 0, members: new Set<string>() };
      cur.sum += s.score;
      cur.req += s.requiredScore;
      cur.n += 1;
      cur.members.add(s.userId);
      byDomain.set(s.domain, cur);
    }
    const rows: string[][] = [];
    byDomain.forEach((v, domain) => {
      const avg = v.sum / Math.max(1, v.n);
      const req = v.req / Math.max(1, v.n);
      rows.push([domain, avg.toFixed(1), req.toFixed(1), Math.max(0, req - avg).toFixed(1), String(v.members.size)]);
    });
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    return { title: 'Readiness by Domain', generatedAt, columns: ['domain', 'avg_score', 'avg_required', 'avg_gap_points', 'members'], rows, note: 'Snapshot across all scored trainees.' };
  }
  if (id === 'certification-rate') {
    const end = to ?? new Date();
    const start = from ?? new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1));
    const [certs, trainees] = await Promise.all([
      prisma.certificate.findMany({ where: { issuedAt: { gte: start, lte: end } }, select: { issuedAt: true } }),
      prisma.user.findMany({ where: { role: 'TRAINEE', createdAt: { lte: end } }, select: { createdAt: true } }),
    ]);
    const byMonth = new Map<string, number>();
    for (const c of certs) {
      const k = monthLabel(c.issuedAt);
      byMonth.set(k, (byMonth.get(k) ?? 0) + 1);
    }
    const months: string[] = [];
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (cursor <= end) {
      months.push(monthLabel(cursor));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    const rows = months.map((m) => {
      const issued = byMonth.get(m) ?? 0;
      const base = trainees.filter((t) => monthLabel(t.createdAt) <= m).length;
      const rate = base === 0 ? '0.0' : ((issued / base) * 100).toFixed(1);
      return [m, String(issued), String(base), rate];
    });
    return { title: 'Certification Completion Rate (monthly)', generatedAt, columns: ['month', 'certificates_issued', 'trainee_base', 'rate_pct'], rows, note: 'Rate = certificates issued ÷ cumulative registered trainees that month.' };
  }
  if (id === 'trainer-effectiveness') {
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER', status: 'APPROVED' },
      include: { profile: { select: { fullName: true } } },
    });
    const rows: string[][] = [];
    for (const t of trainers) {
      const allocs = await prisma.trainerCohort.findMany({ where: { trainerId: t.id }, include: { cohort: { include: { members: { select: { userId: true } } } } } });
      const memberIds = new Set<string>();
      allocs.forEach((a) => a.cohort.members.forEach((m) => memberIds.add(m.userId)));
      const idList: string[] = [];
      memberIds.forEach((v) => idList.push(v));
      const scores = idList.length === 0 ? [] : await prisma.competencyScore.findMany({ where: { userId: { in: idList } }, select: { score: true } });
      const readiness = scores.length === 0 ? '0.0' : (scores.reduce((n, s) => n + s.score, 0) / scores.length).toFixed(1);
      const best = allocs.reduce((m, a) => Math.max(m, a.matchScore), 0);
      rows.push([
        t.profile?.fullName ?? t.email,
        t.email,
        String(allocs.length),
        String(memberIds.size),
        readiness,
        t.rating !== null && t.rating !== undefined ? Number(t.rating).toFixed(1) : '',
        best > 0 ? best.toFixed(1) : '',
      ]);
    }
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    return { title: 'Trainer Effectiveness Report', generatedAt, columns: ['trainer', 'email', 'cohorts', 'trainees', 'avg_member_readiness', 'rating', 'best_match_score'], rows, note: 'Snapshot; longitudinal improvement needs repeated scoring cycles.' };
  }
  if (id === 'gap-trend') {
    const cohorts = await prisma.cohort.findMany({ include: { members: { select: { userId: true } } } });
    const monday = new Date();
    monday.setUTCHours(0, 0, 0, 0);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const weeks: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(monday);
      d.setUTCDate(d.getUTCDate() - i * 7);
      weeks.push(d.toISOString().slice(0, 10));
    }
    const start = new Date(weeks[0]);
    const [subs, attempts] = await Promise.all([
      prisma.assessmentSubmission.findMany({
        where: { status: { in: ['SUBMITTED', 'GRADED'] }, submittedAt: { gte: start } },
        select: { percentage: true, submittedAt: true, userId: true },
      }),
      prisma.examAttempt.findMany({
        where: { status: 'GRADED', submittedAt: { gte: start }, percentage: { not: null } },
        select: { percentage: true, submittedAt: true, userId: true },
      }),
    ]);
    const memberOf = new Map<string, string>();
    for (const c of cohorts) for (const m of c.members) if (!memberOf.has(m.userId)) memberOf.set(m.userId, c.code);
    const cell = new Map<string, { sum: number; n: number }>();
    const push = (userId: string, at: Date | null, pct: number | null) => {
      if (!at || pct === null) return;
      const code = memberOf.get(userId);
      if (!code) return;
      const copy = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
      copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7));
      const key = `${code}|${copy.toISOString().slice(0, 10)}`;
      const cur = cell.get(key) ?? { sum: 0, n: 0 };
      cur.sum += pct;
      cur.n += 1;
      cell.set(key, cur);
    };
    for (const s of subs) push(s.userId, s.submittedAt, s.percentage);
    for (const a of attempts) push(a.userId, a.submittedAt, a.percentage);
    const seenCodes = new Set<string>();
    const codes: string[] = [];
    for (const c of cohorts) {
      if (!seenCodes.has(c.code)) {
        seenCodes.add(c.code);
        codes.push(c.code);
      }
    }
    codes.sort();
    const rows = codes.map((code) => {
      const cols = weeks.map((w) => {
        const c = cell.get(`${code}|${w}`);
        return c && c.n > 0 ? (c.sum / c.n).toFixed(1) : '';
      });
      return [code, ...cols];
    });
    return {
      title: 'Gap Trend Over Time (per cohort)',
      generatedAt,
      columns: ['cohort', ...weeks.map((w) => `w_${w.slice(5)}`)],
      rows,
      note: 'Weekly mean assessment % per cohort (readiness proxy; blank = no attempts). True gap trends need repeated competency snapshots.',
    };
  }
  const e = new Error(`Unknown report "${id}".`) as Error & { status?: number; code?: string };
  e.status = 404;
  e.code = 'REPORT_NOT_FOUND';
  throw e;
}

// ---------------------------------------------------------------------------
// Certificates (governance)
// ---------------------------------------------------------------------------

export async function listCertificates(status?: string, q?: string): Promise<AdminCertificate[]> {
  const rows = await prisma.certificate.findMany({
    where: {
      ...(status ? { status: status as 'VALID' | 'REVOKED' | 'EXPIRED' } : {}),
      ...(q
        ? {
            OR: [
              { verificationId: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: { issuedAt: 'desc' },
    take: 200,
    include: {
      user: { include: { profile: { select: { fullName: true } } } },
      module: { select: { title: true, track: { select: { code: true } } } },
    },
  });
  return rows.map((c) => {
    const meta = (c.metadata ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      holderName: c.user.profile?.fullName ?? c.user.email,
      holderEmail: c.user.email,
      moduleTitle: c.module?.title ?? c.title,
      trackCode: c.module?.track.code ?? (typeof meta['trackCode'] === 'string' ? meta['trackCode'] : null),
      issuedAt: c.issuedAt.toISOString(),
      verificationId: c.verificationId,
      status: c.status,
      score: typeof meta['score'] === 'number' ? meta['score'] : null,
    };
  });
}

export async function setCertificateStatus(
  adminId: string,
  ip: string | null,
  id: string,
  status: 'VALID' | 'REVOKED',
  reason?: string
): Promise<AdminCertificate> {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { user: { select: { id: true } } },
  });
  if (!cert) {
    const e = new Error('Certificate not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'CERTIFICATE_NOT_FOUND';
    throw e;
  }
  if (status === 'REVOKED' && !reason?.trim()) {
    const e = new Error('A revocation reason is mandatory.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'REASON_REQUIRED';
    throw e;
  }
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.certificate.update({
      where: { id },
      data: { status, revokedAt: status === 'REVOKED' ? new Date() : null, revokeReason: status === 'REVOKED' ? sanitizeText(reason ?? '', 2000) : null },
    });
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: status === 'REVOKED' ? 'CERT_REVOKED' : 'CERT_REINSTATED',
        entityType: 'Certificate',
        entityId: id,
        ipAddress: ip,
        diff: { before: { status: cert.status }, after: { status, reason: reason ?? null } },
        metadata: {},
      },
    });
    return row;
  });
  void updated;
  const cleanReason = status === 'REVOKED' ? sanitizeText(reason ?? '', 2000) : null;
  await notifyUser({
    userId: cert.user.id,
    type: status === 'REVOKED' ? 'CERTIFICATE_REVOKED' : 'CERTIFICATE_ISSUED',
    title: status === 'REVOKED' ? 'A certificate was revoked' : 'A certificate was reinstated',
    body: status === 'REVOKED' ? `Reason: ${cleanReason}` : 'Your certificate is valid again.',
    link: '/trainee',
    email: {
      subject: status === 'REVOKED' ? 'CapacityConnect certificate revoked' : 'CapacityConnect certificate reinstated',
      text: status === 'REVOKED' ? `A certificate on your account was revoked.\nReason: ${cleanReason}` : 'Your certificate is valid again.',
    },
  });
  const rows = await listCertificates();
  const found = rows.find((r) => r.id === id);
  if (!found) throw new Error('Certificate update failed.');
  return found;
}
