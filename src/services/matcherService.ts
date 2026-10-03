import prisma from '@/lib/prisma';
import { notifyUser } from '@/lib/notify';
import { logAudit } from './adminService';
import {
  DEFAULT_WEIGHTS,
  outOfPolicyKeys,
  type BacktestResult,
  type MatcherConstraints,
  type MatcherCohortOption,
  type MatcherRunResult,
  type MatcherWeights,
  type RankedTrainer,
} from './matcherTypes';

// ============================================================================
// 55/30/15 trainer–cohort matcher (Phase 2.1). Pure scoring + persistence.
// All data is live: trainer competencies (UserCompetency → domainCode),
// ratings, delivered counts, availability, cohort membership and track
// domains. Missing ratings use a documented neutral prior (50); missing
// domain skills score 0 (visible as gap areas, never silently dropped).
// ============================================================================

const NEUTRAL_RATING_SCORE = 50;
const EXPERIENCE_CAP = 15;
const GAP_CUT = 60;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

interface TrainerRow {
  id: string;
  name: string;
  rating: number | null;
  cohortsDelivered: number;
  availability: string;
  station: string | null;
  region: string | null;
  domainScores: Map<string, number>;
}

async function loadTrainers(): Promise<TrainerRow[]> {
  const rows = await prisma.user.findMany({
    where: { role: 'TRAINER', status: 'APPROVED' },
    include: {
      profile: { select: { fullName: true } },
      station: { select: { name: true, region: true } },
      competencies: { include: { competency: { select: { domainCode: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((t) => {
    const domainScores = new Map<string, number>();
    for (const uc of t.competencies) {
      const d = uc.competency.domainCode;
      if (!d) continue;
      const pct = Math.max(0, Math.min(100, (uc.proficiencyLevel / 5) * 100));
      const prev = domainScores.get(d);
      if (prev === undefined || pct > prev) domainScores.set(d, pct);
    }
    return {
      id: t.id,
      name: t.profile?.fullName ?? t.email,
      rating: t.rating,
      cohortsDelivered: t.cohortsDelivered,
      availability: t.availability,
      station: t.station?.name ?? null,
      region: t.station?.region ?? null,
      domainScores,
    };
  });
}

interface CohortContext {
  id: string;
  code: string;
  name: string;
  trackCode: string | null;
  domains: string[];
  memberCount: number;
  prevCode: string | null;
  prevTrainerIds: string[];
}

async function loadCohortContext(cohortId: string): Promise<CohortContext> {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { track: { select: { code: true, domains: true } }, members: { select: { userId: true } } },
  });
  if (!cohort) {
    const e = new Error('Cohort not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'COHORT_NOT_FOUND';
    throw e;
  }
  const domains = toStringArray(cohort.track?.domains);
  // Previous cohort of the same track by start date (consecutive-allocation check).
  let prevCode: string | null = null;
  let prevTrainerIds: string[] = [];
  if (cohort.trackId) {
    const prev = await prisma.cohort.findFirst({
      where: { trackId: cohort.trackId, id: { not: cohort.id }, startDate: { lt: cohort.startDate } },
      orderBy: { startDate: 'desc' },
      include: { trainerCohorts: { select: { trainerId: true, override: true, overrideTrainerId: true } } },
    });
    if (prev) {
      prevCode = prev.code;
      prevTrainerIds = prev.trainerCohorts.map((a) => (a.override && a.overrideTrainerId ? a.overrideTrainerId : a.trainerId));
    }
  }
  return {
    id: cohort.id,
    code: cohort.code,
    name: cohort.name,
    trackCode: cohort.track?.code ?? null,
    domains,
    memberCount: cohort.members.length,
    prevCode,
    prevTrainerIds,
  };
}

/** Total active-trainee load per trainer (for the max-trainees constraint). */
async function loadTrainerLoads(): Promise<Map<string, number>> {
  const allocs = await prisma.trainerCohort.findMany({
    where: { cohort: { status: 'ACTIVE' } },
    include: { cohort: { include: { members: { select: { userId: true } } } } },
  });
  const loads = new Map<string, number>();
  for (const a of allocs) {
    const id = a.override && a.overrideTrainerId ? a.overrideTrainerId : a.trainerId;
    loads.set(id, (loads.get(id) ?? 0) + a.cohort.members.length);
  }
  return loads;
}

export function scoreTrainer(
  t: TrainerRow,
  domains: string[],
  weights: MatcherWeights,
  ctx: { memberCount: number; maxTrainees: number; loads: Map<string, number>; avoidConsecutive: boolean; prevCode: string | null; prevTrainerIds: string[]; regionPref: string; excludeOnLeave: boolean }
): Omit<RankedTrainer, 'rank'> {
  const overlap =
    domains.length === 0 ? 0 : domains.reduce((n, d) => n + (t.domainScores.get(d) ?? 0), 0) / domains.length;
  const ratingScore = t.rating === null || t.rating === undefined ? NEUTRAL_RATING_SCORE : Math.max(0, Math.min(100, (t.rating / 5) * 100));
  const expScore = Math.min(t.cohortsDelivered, EXPERIENCE_CAP) / EXPERIENCE_CAP * 100;
  const skillPts = (weights.skill * overlap) / 100;
  const ratingPts = (weights.rating * ratingScore) / 100;
  const expPts = (weights.experience * expScore) / 100;
  const composite = Math.round((skillPts + ratingPts + expPts) * 10) / 10;

  const scored = domains.map((d) => ({ domain: d, score: Math.round(t.domainScores.get(d) ?? 0) })).sort((a, b) => b.score - a.score);
  const bestMatched = scored.filter((s) => s.score >= GAP_CUT).slice(0, 3).map((s) => `${s.domain} (${s.score})`);
  const gaps = scored.filter((s) => s.score < GAP_CUT).map((s) => `${s.domain} (${s.score})`);
  if (t.rating === null || t.rating === undefined) gaps.push('No past-performance rating (neutral 50 applied)');

  const violations: string[] = [];
  let excluded = false;
  if (t.availability !== 'AVAILABLE') {
    if (ctx.excludeOnLeave) {
      excluded = true;
    } else {
      violations.push(`On leave (${t.availability}) — included by override of the leave filter`);
    }
  }
  const load = ctx.loads.get(t.id) ?? 0;
  if (load + ctx.memberCount > ctx.maxTrainees) {
    violations.push(`Load ${load}+${ctx.memberCount} exceeds max ${ctx.maxTrainees} trainees`);
  }
  if (ctx.avoidConsecutive && ctx.prevCode && ctx.prevTrainerIds.includes(t.id)) {
    violations.push(`Allocated to previous cohort ${ctx.prevCode} (consecutive rule)`);
  }
  if (ctx.regionPref !== 'ANY') {
    if (t.region && t.region !== ctx.regionPref) violations.push(`Station region ${t.region} ≠ preferred ${ctx.regionPref}`);
    if (!t.region) violations.push('Station region unknown — preference unverifiable');
  }

  const badge = excluded ? 'EXCLUDED' : composite >= 75 ? 'BEST_MATCH' : composite >= 60 ? 'GOOD_FIT' : 'STRETCH';

  return {
    trainerId: t.id,
    name: t.name,
    initials: initialsOf(t.name),
    station: t.station,
    region: t.region,
    skillOverlapPct: Math.round(overlap * 10) / 10,
    rating: t.rating,
    unrated: t.rating === null || t.rating === undefined,
    cohortsDelivered: t.cohortsDelivered,
    availability: t.availability,
    composite,
    contributions: {
      skill: Math.round(skillPts * 10) / 10,
      rating: Math.round(ratingPts * 10) / 10,
      experience: Math.round(expPts * 10) / 10,
    },
    badge,
    bestMatched,
    gaps,
    violations,
    excluded,
  };
}

export async function rankTrainers(cohortId: string, weights: MatcherWeights, constraints: MatcherConstraints): Promise<{ ctx: CohortContext; ranked: RankedTrainer[] }> {
  const [ctx, trainers, loads] = await Promise.all([loadCohortContext(cohortId), loadTrainers(), loadTrainerLoads()]);
  const scored = trainers.map((t) =>
    scoreTrainer(t, ctx.domains, weights, {
      memberCount: ctx.memberCount,
      maxTrainees: constraints.maxTrainees,
      loads,
      avoidConsecutive: constraints.avoidConsecutive,
      prevCode: ctx.prevCode,
      prevTrainerIds: ctx.prevTrainerIds,
      regionPref: constraints.regionPref,
      excludeOnLeave: constraints.excludeOnLeave,
    })
  );
  scored.sort((a, b) => {
    if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
    return b.composite - a.composite;
  });
  let rank = 0;
  const ranked = scored.map((s) => {
    if (!s.excluded) rank += 1;
    return { ...s, rank: s.excluded ? 0 : rank };
  });
  return { ctx, ranked };
}

/** Run + persist a MatcherRun and audit MATCHER_RUN. */
export async function runMatcher(
  adminId: string,
  ip: string | null,
  cohortId: string,
  weights: MatcherWeights,
  constraints: MatcherConstraints,
  pinUsed: boolean
): Promise<MatcherRunResult> {
  const { ctx, ranked } = await rankTrainers(cohortId, weights, constraints);
  const outOfPolicy = outOfPolicyKeys(weights);
  const run = await prisma.matcherRun.create({
    data: {
      cohortId,
      createdById: adminId,
      weights: { ...weights },
      constraints: { ...constraints },
      results: ranked.map((r) => ({
        rank: r.rank,
        trainerId: r.trainerId,
        trainer: r.name,
        skillOverlapPct: r.skillOverlapPct,
        rating: r.rating,
        cohortsDelivered: r.cohortsDelivered,
        composite: r.composite,
        badge: r.badge,
        violations: r.violations,
        excluded: r.excluded,
      })),
      notes: outOfPolicy.length > 0 ? `Out-of-policy weights (${outOfPolicy.join(', ')}) with super-admin PIN.` : 'Policy-band weights.',
    },
  });
  await logAudit({
    actorId: adminId,
    actorRole: 'ADMIN',
    action: 'MATCHER_RUN',
    entityType: 'MatcherRun',
    entityId: run.id,
    ip,
    diff: {},
    metadata: { cohort: ctx.code, weights, constraints, outOfPolicy, pinUsed, topPick: ranked.find((r) => !r.excluded)?.name ?? null },
  });
  return {
    runId: run.id,
    cohortId,
    cohortCode: ctx.code,
    weights,
    outOfPolicy,
    pinUsed,
    constraints,
    results: ranked,
    computedAt: new Date().toISOString(),
  };
}

export interface OverrideInput {
  cohortId: string;
  recommendedTrainerId: string;
  alternateTrainerId: string;
  justification: string;
  weights: MatcherWeights;
}

/** Record an admin override of the recommendation (audited, append-only history). */
export async function overrideRecommendation(adminId: string, ip: string | null, input: OverrideInput) {
  if (input.recommendedTrainerId === input.alternateTrainerId) {
    const e = new Error('Alternate must differ from the recommended trainer.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'SAME_TRAINER';
    throw e;
  }
  if (!input.justification.trim()) {
    const e = new Error('Override justification is mandatory.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'JUSTIFICATION_REQUIRED';
    throw e;
  }
  const trainers = await loadTrainers();
  const recommended = trainers.find((t) => t.id === input.recommendedTrainerId);
  const alternate = trainers.find((t) => t.id === input.alternateTrainerId);
  if (!recommended || !alternate) {
    const e = new Error('Unknown trainer id.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'TRAINER_NOT_FOUND';
    throw e;
  }
  const ctx = await loadCohortContext(input.cohortId);
  const loads = await loadTrainerLoads();
  const base = { memberCount: ctx.memberCount, maxTrainees: 25, loads, avoidConsecutive: false, prevCode: null, prevTrainerIds: [], regionPref: 'ANY', excludeOnLeave: false };
  const recScore = scoreTrainer(recommended, ctx.domains, input.weights, { ...base, prevCode: ctx.prevCode, prevTrainerIds: ctx.prevTrainerIds });
  const altScore = scoreTrainer(alternate, ctx.domains, input.weights, { ...base, prevCode: ctx.prevCode, prevTrainerIds: ctx.prevTrainerIds });

  const allocation = await prisma.trainerCohort.upsert({
    where: { trainerId_cohortId: { trainerId: alternate.id, cohortId: ctx.id } },
    update: {
      matchScore: altScore.composite,
      skillOverlapPct: altScore.skillOverlapPct,
      ratingScore: alternate.rating === null ? 50 : Math.round(((alternate.rating / 5) * 100) * 10) / 10,
      experienceScore: Math.round((Math.min(alternate.cohortsDelivered, 15) / 15) * 100 * 10) / 10,
      componentScores: { skill: altScore.contributions.skill, rating: altScore.contributions.rating, experience: altScore.contributions.experience, weights: { skill: input.weights.skill, rating: input.weights.rating, experience: input.weights.experience } },
      recommendationBadge: altScore.badge === 'EXCLUDED' ? 'STRETCH' : altScore.badge,
      bestMatchedDomains: altScore.bestMatched,
      gapAreas: altScore.gaps,
      override: true,
      overrideTrainerId: alternate.id,
      overrideJustification: input.justification.trim(),
    },
    create: {
      trainerId: alternate.id,
      cohortId: ctx.id,
      matchScore: altScore.composite,
      skillOverlapPct: altScore.skillOverlapPct,
      ratingScore: alternate.rating === null ? 50 : Math.round(((alternate.rating / 5) * 100) * 10) / 10,
      experienceScore: Math.round((Math.min(alternate.cohortsDelivered, 15) / 15) * 100 * 10) / 10,
      componentScores: { skill: altScore.contributions.skill, rating: altScore.contributions.rating, experience: altScore.contributions.experience, weights: { skill: input.weights.skill, rating: input.weights.rating, experience: input.weights.experience } },
      recommendationBadge: altScore.badge === 'EXCLUDED' ? 'STRETCH' : altScore.badge,
      bestMatchedDomains: altScore.bestMatched,
      gapAreas: altScore.gaps,
      override: true,
      overrideTrainerId: alternate.id,
      overrideJustification: input.justification.trim(),
    },
  });
  await logAudit({
    actorId: adminId,
    actorRole: 'ADMIN',
    action: 'OVERRIDE_CREATED',
    entityType: 'TrainerCohort',
    entityId: allocation.id,
    ip,
    diff: {
      before: { recommended: recommended.name, score: recScore.composite },
      after: { allocated: alternate.name, score: altScore.composite, justification: input.justification.trim() },
    },
    metadata: { cohort: ctx.code, weights: input.weights },
  });
  await notifyUser({
    userId: alternate.id,
    type: 'COHORT_ASSIGNED',
    title: `Cohort assigned: ${ctx.code}`,
    body: `You were allocated to ${ctx.name} by admin override (match score ${altScore.composite}). Justification on file.`,
    link: '/trainer',
  });
  return {
    allocationId: allocation.id,
    cohortCode: ctx.code,
    recommended: { name: recommended.name, score: recScore.composite },
    allocated: { name: alternate.name, score: altScore.composite },
  };
}

/** Backtest: same cohort, active weights vs default 55/30/15. */
export async function backtestCohort(cohortId: string, weights: MatcherWeights) {
  const def = DEFAULT_WEIGHTS;
  const [custom, baseline] = await Promise.all([
    rankTrainers(cohortId, weights, { maxTrainees: 25, avoidConsecutive: true, regionPref: 'ANY', excludeOnLeave: true }),
    rankTrainers(cohortId, def, { maxTrainees: 25, avoidConsecutive: true, regionPref: 'ANY', excludeOnLeave: true }),
  ]);
  const eligible = (r: RankedTrainer[]) => r.filter((x) => !x.excluded);
  const cTop = eligible(custom.ranked);
  const dTop = eligible(baseline.ranked);
  const topC = cTop[0] ?? null;
  const topD = dTop[0] ?? null;
  const orderC = cTop.map((r) => r.trainerId);
  const orderD = dTop.map((r) => r.trainerId);
  let swaps = 0;
  for (let i = 0; i < orderC.length; i++) {
    for (let j = i + 1; j < orderC.length; j++) {
      const a = orderC[i];
      const b = orderC[j];
      if (orderD.indexOf(a) > orderD.indexOf(b)) swaps += 1;
    }
  }
  const deltaTop = topC && topD ? Math.round((topC.composite - topD.composite) * 10) / 10 : null;
  const verdict =
    !topC || !topD
      ? 'No eligible trainers to compare.'
      : topC.trainerId === topD.trainerId
        ? `Same top pick (${topC.name}) under both configurations — weights change margins, not the winner.`
        : `Under the active weights, ${topC.name} would top ${custom.ctx.code} at ${topC.composite} vs ${topD.composite} for ${topD.name} under default 55/30/15 (Δ ${deltaTop !== null && deltaTop > 0 ? '+' : ''}${deltaTop}).`;
  return {
    cohortId,
    cohortCode: custom.ctx.code,
    active: {
      weights,
      label: 'Active configuration',
      topPick: topC?.name ?? null,
      topScore: topC?.composite ?? null,
      topThree: cTop.slice(0, 3).map((r) => `${r.name} (${r.composite})`),
    },
    def: {
      weights: def,
      label: 'Default 55/30/15',
      topPick: topD?.name ?? null,
      topScore: topD?.composite ?? null,
      topThree: dTop.slice(0, 3).map((r) => `${r.name} (${r.composite})`),
    },
    deltaTop,
    rankSwaps: swaps,
    verdict,
  };
}

/** Cohort options for the simulator selectors (recent first). */
export async function getMatcherCohorts(): Promise<MatcherCohortOption[]> {
  const cohorts = await prisma.cohort.findMany({
    orderBy: { startDate: 'desc' },
    take: 24,
    include: { track: { select: { code: true, domains: true } }, members: { select: { userId: true } } },
  });
  return cohorts.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    trackCode: c.track?.code ?? null,
    domains: toStringArray(c.track?.domains),
    memberCount: c.members.length,
    startDate: c.startDate.toISOString(),
    status: c.status,
  }));
}
