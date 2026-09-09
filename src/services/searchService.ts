import prisma from '@/lib/prisma';
import { REPORTS } from './adminTypes';

// ============================================================================
// Global search (Phase 3.2): one debounced query across modules,
// competencies, trainers, stations, assessments, reports and (admin-only)
// users. RBAC is applied per group BEFORE matching — a role can never
// receive rows from a forbidden group. Every hit carries a stable
// deep-link URL valid for the caller's role.
// ============================================================================

export type SearchRole = 'TRAINEE' | 'TRAINER' | 'ADMIN';

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  meta?: string;
}

export interface SearchGroup {
  type: 'modules' | 'competencies' | 'trainers' | 'stations' | 'assessments' | 'reports' | 'users';
  label: string;
  items: SearchHit[];
}

const PER_GROUP = 5;
const MAX_TOTAL = 30;

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

/** Exact/prefix matches first, then alphabetical. Mutates nothing. */
function rank<T>(items: T[], score: (item: T) => number, label: (item: T) => string): T[] {
  return [...items].sort((a, b) => score(b) - score(a) || label(a).localeCompare(label(b)));
}

function matchScore(text: string, q: string): number {
  const t = text.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

export async function globalSearch(role: SearchRole, rawQuery: string): Promise<{ groups: SearchGroup[]; total: number }> {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 2) return { groups: [], total: 0 };
  const groups: SearchGroup[] = [];
  let remaining = MAX_TOTAL;

  const take = <T>(items: T[]): T[] => {
    const slice = items.slice(0, Math.min(PER_GROUP, remaining));
    remaining -= slice.length;
    return slice;
  };

  // Modules (published; all roles → public catalog track page).
  if (remaining > 0) {
    const mods = await prisma.trainingModule.findMany({
      where: { isPublished: true },
      select: { code: true, title: true, description: true, track: { select: { code: true } } },
      take: 200,
    });
    const hits = rank(
      mods.filter((m) => includes(m.title, q) || includes(m.description, q) || includes(m.code, q)),
      (m) => Math.max(matchScore(m.title, q), matchScore(m.code, q)),
      (m) => m.title
    );
    const items = take(hits).map((m) => ({
      id: m.code,
      title: m.title,
      subtitle: `${m.code} • ${m.track.code} track`,
      url: `/catalog/${m.track.code}`,
      meta: m.code,
    }));
    if (items.length > 0) groups.push({ type: 'modules', label: 'Modules', items });
  }

  // Competencies (all roles; role-appropriate destination).
  if (remaining > 0) {
    const comps = await prisma.competency.findMany({ take: 200 });
    const hits = rank(
      comps.filter((c) => includes(c.name, q) || includes(c.code, q) || includes(c.domainCode ?? '', q) || includes(c.wmoCode ?? '', q)),
      (c) => Math.max(matchScore(c.name, q), matchScore(c.code, q)),
      (c) => c.name
    );
    const urlFor =
      role === 'ADMIN' ? '/admin/competency' : role === 'TRAINER' ? '/trainer/analytics' : '/trainee#competency';
    const items = take(hits).map((c) => ({
      id: c.code,
      title: c.name,
      subtitle: `${c.code}${c.domainCode ? ` • ${c.domainCode}` : ''}${c.wmoCode ? ` • ${c.wmoCode}` : ''}`,
      url: urlFor,
      meta: c.domainCode ?? undefined,
    }));
    if (items.length > 0) groups.push({ type: 'competencies', label: 'Competencies', items });
  }

  // Trainers (approved; all roles → public directory anchors).
  if (remaining > 0) {
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER', status: 'APPROVED' },
      include: { profile: { select: { fullName: true, headline: true } } },
      take: 100,
    });
    const hits = rank(
      trainers.filter((t) => {
        const name = t.profile?.fullName ?? t.email;
        return includes(name, q) || includes(t.specialization ?? '', q) || includes(t.email, q);
      }),
      (t) => matchScore(t.profile?.fullName ?? t.email, q),
      (t) => t.profile?.fullName ?? t.email
    );
    const items = take(hits).map((t) => ({
      id: t.id,
      title: t.profile?.fullName ?? t.email,
      subtitle: t.specialization ?? t.profile?.headline ?? 'IMD Faculty',
      url: `/trainers#${t.id}`,
      meta: t.rating !== null && t.rating !== undefined ? `★ ${Number(t.rating).toFixed(1)}` : undefined,
    }));
    if (items.length > 0) groups.push({ type: 'trainers', label: 'Trainers', items });
  }

  // Stations (metadata is non-sensitive; all roles).
  if (remaining > 0) {
    const stations = await prisma.station.findMany({ where: { isActive: true }, take: 100 });
    const hits = rank(
      stations.filter((s) => includes(s.name, q) || includes(s.code, q) || includes(s.city, q) || includes(s.region, q) || includes(s.state, q)),
      (s) => Math.max(matchScore(s.name, q), matchScore(s.code, q)),
      (s) => s.name
    );
    const urlFor = role === 'ADMIN' ? '/admin/stations' : '/radar#operations';
    const items = take(hits).map((s) => ({
      id: s.code,
      title: `${s.name} (${s.code})`,
      subtitle: `${s.city}, ${s.state} • ${s.region} • readiness ${Math.round(s.readinessPct)}%`,
      url: urlFor,
      meta: s.region,
    }));
    if (items.length > 0) groups.push({ type: 'stations', label: 'Stations', items });
  }

  // Assessments (published for trainees; all for staff → exam player).
  if (remaining > 0) {
    const assessments = await prisma.assessment.findMany({
      where: role === 'TRAINEE' ? { isPublished: true } : {},
      select: { id: true, title: true, type: true, isPublished: true },
      take: 100,
    });
    const hits = rank(
      assessments.filter((a) => includes(a.title, q) || includes(a.type, q)),
      (a) => matchScore(a.title, q),
      (a) => a.title
    );
    const items = take(hits).map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: `${a.type}${a.isPublished ? '' : ' • unpublished'}`,
      url: `/exam/${a.id}`,
    }));
    if (items.length > 0) groups.push({ type: 'assessments', label: 'Assessments', items });
  }

  // Reports (governance → ADMIN only).
  if (remaining > 0 && role === 'ADMIN') {
    const hits = rank(
      REPORTS.filter((r) => includes(r.name, q) || includes(r.description, q)),
      (r) => matchScore(r.name, q),
      (r) => r.name
    );
    const items = take(hits).map((r) => ({
      id: r.id,
      title: r.name,
      subtitle: r.description,
      url: '/admin/reports',
    }));
    if (items.length > 0) groups.push({ type: 'reports', label: 'Reports', items });
  }

  // Users (ADMIN only; safe fields — never credentials).
  if (remaining > 0 && role === 'ADMIN') {
    const users = await prisma.user.findMany({
      include: { profile: { select: { fullName: true } } },
      take: 200,
    });
    const hits = rank(
      users.filter((u) => {
        const name = u.profile?.fullName ?? '';
        return includes(name, q) || includes(u.email, q) || includes(u.role, q) || includes(u.cadre ?? '', q);
      }),
      (u) => Math.max(matchScore(u.profile?.fullName ?? '', q), matchScore(u.email, q)),
      (u) => u.profile?.fullName ?? u.email
    );
    const items = take(hits).map((u) => ({
      id: u.id,
      title: u.profile?.fullName ?? u.email,
      subtitle: `${u.email} • ${u.role} • ${u.status}`,
      url: '/admin/users',
      meta: u.role,
    }));
    if (items.length > 0) groups.push({ type: 'users', label: 'Users (admin)', items });
  }

  return { groups, total: groups.reduce((n, g) => n + g.items.length, 0) };
}
