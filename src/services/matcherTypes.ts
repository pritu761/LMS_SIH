// ============================================================================
// 55/30/15 matcher shared types + policy constants (Phase 2.1). CLIENT-SAFE.
// Composite = (skill×overlap + rating×ratingScore + exp×experienceScore)/100.
//
// Policy model:
// - Sliders are hard-bounded to 10–70 each and must sum to 100.
// - The POLICY BAND is narrower (competency-first governance). Running
//   outside the band requires super-admin PIN confirmation and is flagged
//   in the audit trail (pinUsed + outOfPolicy).
// ============================================================================

export interface MatcherWeights {
  skill: number;
  rating: number;
  experience: number;
}

export const DEFAULT_WEIGHTS: MatcherWeights = { skill: 55, rating: 30, experience: 15 };

export const SLIDER_MIN = 10;
export const SLIDER_MAX = 70;

/** Governance policy band (narrower than the slider bounds). */
export const POLICY_BANDS: Record<keyof MatcherWeights, [number, number]> = {
  skill: [45, 65],
  rating: [20, 40],
  experience: [10, 25],
};

export function weightsSumTo100(w: MatcherWeights): boolean {
  return w.skill + w.rating + w.experience === 100;
}

export function outOfPolicyKeys(w: MatcherWeights): Array<keyof MatcherWeights> {
  return (Object.keys(POLICY_BANDS) as Array<keyof MatcherWeights>).filter((k) => {
    const [lo, hi] = POLICY_BANDS[k];
    return w[k] < lo || w[k] > hi;
  });
}

export interface MatcherConstraints {
  maxTrainees: number;
  avoidConsecutive: boolean;
  regionPref: string;
  excludeOnLeave: boolean;
}

export const DEFAULT_CONSTRAINTS: MatcherConstraints = {
  maxTrainees: 25,
  avoidConsecutive: true,
  regionPref: 'ANY',
  excludeOnLeave: true,
};

export interface RankedTrainer {
  rank: number;
  trainerId: string;
  name: string;
  initials: string;
  station: string | null;
  region: string | null;
  skillOverlapPct: number;
  rating: number | null;
  unrated: boolean;
  cohortsDelivered: number;
  availability: string;
  composite: number;
  contributions: { skill: number; rating: number; experience: number };
  badge: 'BEST_MATCH' | 'GOOD_FIT' | 'STRETCH' | 'EXCLUDED';
  bestMatched: string[];
  gaps: string[];
  violations: string[];
  excluded: boolean;
}

export interface MatcherRunResult {
  runId: string;
  cohortId: string;
  cohortCode: string;
  weights: MatcherWeights;
  outOfPolicy: Array<keyof MatcherWeights>;
  pinUsed: boolean;
  constraints: MatcherConstraints;
  results: RankedTrainer[];
  computedAt: string;
}

export interface MatcherCohortOption {
  id: string;
  code: string;
  name: string;
  trackCode: string | null;
  domains: string[];
  memberCount: number;
  startDate: string;
  status: string;
}

export interface BacktestComparison {
  weights: MatcherWeights;
  label: string;
  topPick: string | null;
  topScore: number | null;
  topThree: string[];
}

export interface BacktestResult {
  cohortId: string;
  cohortCode: string;
  active: BacktestComparison;
  def: BacktestComparison;
  deltaTop: number | null;
  rankSwaps: number;
  verdict: string;
}
