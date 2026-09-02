// Capacity Connect - Competency Mapping & Gap Analysis Engine
// IMD & MoES "Mission Mausam" Domain-Aware Intelligence Service

import {
  initialUsers,
  initialCourses,
  initialCompetencies,
  initialCadres,
  MockCourse,
  MockUser,
  MockCadreBenchmark,
  MockCompetency,
} from '@/lib/mockData';

export interface CompetencyScoreBreakdown {
  competencyId: string;
  competencyName: string;
  courseRequiredProficiency: number;
  trainerProficiency: number;
  weight: number;
  matchRatio: number; // 0.0 to 1.0 (capped)
  status: 'EXCEEDS' | 'MATCHES' | 'DEFICIENT' | 'MISSING';
}

export interface TrainerMatchResult {
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  avatarUrl: string;
  headline: string;
  organization: string;
  overallScore: number; // 0.0 to 100.0%
  rank: number;
  components: {
    skillOverlapScore: number; // 0.0 to 100.0 (55% weight)
    skillOverlapWeighted: number; // contribution to total (out of 55)
    historicalRatingScore: number; // 0.0 to 100.0 (30% weight)
    historicalRatingWeighted: number; // contribution to total (out of 30)
    coursesDeliveredScore: number; // 0.0 to 100.0 (15% weight)
    coursesDeliveredWeighted: number; // contribution to total (out of 15)
  };
  metrics: {
    rawSkillOverlapPercentage: number;
    rawHistoricalRating: number; // e.g. 4.85 / 5.0
    rawCoursesDelivered: number; // e.g. 8 courses
  };
  competencyBreakdown: CompetencyScoreBreakdown[];
  recommendationTier: 'HIGHLY_RECOMMENDED' | 'QUALIFIED' | 'NEEDS_UPSKILLING' | 'UNSUITABLE';
}

export interface CourseMatchResponse {
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  requiredCompetenciesCount: number;
  evaluatedTrainersCount: number;
  matches: TrainerMatchResult[];
  algorithmWeights: {
    skillOverlap: number; // 0.55
    historicalRating: number; // 0.30
    coursesDelivered: number; // 0.15
  };
  generatedAt: string;
}

export interface TraineeGapItem {
  competencyId: string;
  competencyName: string;
  code: string;
  currentProficiency: number; // 0 to 5
  benchmarkProficiency: number; // 1 to 5
  gapDelta: number; // current - benchmark (negative if deficient)
  importance: 'CRITICAL' | 'HIGH' | 'CORE';
  status: 'EXCEEDS' | 'MATCHES' | 'DEFICIENT' | 'MISSING';
  recommendedCourse?: {
    id: string;
    code: string;
    title: string;
    level: string;
    durationHours: number;
  };
  recommendedTrainer?: {
    id: string;
    name: string;
    rating: number;
    organization: string;
    matchScore: number;
  };
}

export interface TraineeGapAnalysisResponse {
  userId: string;
  userName: string;
  userEmail: string;
  designation: string;
  cadreTrack: string;
  cadreBenchmarkName: string;
  cadreBenchmarkDuration: string;
  readinessScore: number; // 0.0 to 100.0%
  criticalGapsCount: number;
  moderateGapsCount: number;
  satisfiedCount: number;
  totalCompetenciesEvaluated: number;
  gaps: TraineeGapItem[];
  suggestedAction: string;
  generatedAt: string;
}

/**
 * Weights configuration as mandated by system architecture
 */
export const ALGORITHM_WEIGHTS = {
  SKILL_OVERLAP: 0.55,
  HISTORICAL_RATING: 0.30,
  COURSES_DELIVERED: 0.15,
  skillOverlap: 0.55,
  historicalRating: 0.30,
  coursesDelivered: 0.15,
};

/**
 * Calculates the competency skill overlap score (55% weight component of trainer matching).
 * Compares trainer proficiency levels against course requirements with weighted scoring.
 * @param courseCompetencies - Array of required competencies for the course
 * @param trainerCompetencies - Array of trainer's competency proficiencies
 * @returns Object containing normalized score (0-1) and detailed breakdown per competency
 */
export function calculateSkillOverlap(
  courseCompetencies: MockCourse['competencies'],
  trainerCompetencies: MockUser['competencies']
): { score: number; breakdown: CompetencyScoreBreakdown[] } {
  if (!courseCompetencies || courseCompetencies.length === 0) {
    return { score: 1.0, breakdown: [] };
  }

  let totalWeight = 0;
  let weightedMatchSum = 0;

  const breakdown: CompetencyScoreBreakdown[] = courseCompetencies.map((req) => {
    const weight = req.weight || 1.0;
    totalWeight += weight;

    const trainerComp = trainerCompetencies.find(
      (c) => c.competencyId === req.competencyId || c.competencyName.toLowerCase() === req.competencyName.toLowerCase()
    );

    const trainerProficiency = trainerComp ? trainerComp.proficiencyLevel : 0;
    const requiredProficiency = req.requiredProficiency || 3;

    const rawRatio = trainerProficiency / requiredProficiency;
    const matchRatio = Math.min(rawRatio, 1.0);

    weightedMatchSum += matchRatio * weight;

    let status: CompetencyScoreBreakdown['status'] = 'MISSING';
    if (trainerProficiency === 0) {
      status = 'MISSING';
    } else if (trainerProficiency > requiredProficiency) {
      status = 'EXCEEDS';
    } else if (trainerProficiency === requiredProficiency) {
      status = 'MATCHES';
    } else {
      status = 'DEFICIENT';
    }

    return {
      competencyId: req.competencyId,
      competencyName: req.competencyName,
      courseRequiredProficiency: requiredProficiency,
      trainerProficiency,
      weight,
      matchRatio: Math.round(matchRatio * 100) / 100,
      status,
    };
  });

  const normalizedScore = totalWeight > 0 ? weightedMatchSum / totalWeight : 0;
  return { score: normalizedScore, breakdown };
}

/**
 * Calculates normalized historical rating score (30% weight component of trainer matching).
 * Normalizes 0-5 star rating to 0-1 scale with 0.75 default for missing ratings.
 * @param historicalRating - Average trainer rating (0-5 scale)
 * @returns Normalized score between 0 and 1
 */
export function calculateRatingScore(historicalRating?: number): number {
  if (historicalRating === undefined || historicalRating === null || historicalRating <= 0) {
    return 0.75;
  }
  const clamped = Math.min(Math.max(historicalRating, 0), 5.0);
  return clamped / 5.0;
}

/**
 * Calculates normalized course delivery volume score (15% weight component of trainer matching).
 * Normalizes number of courses delivered against a target threshold of 10 courses.
 * @param coursesDeliveredCount - Total number of courses delivered by trainer
 * @returns Normalized score between 0 and 1 (capped at 1.0 for >=10 courses)
 */
export function calculateDeliveryVolumeScore(coursesDeliveredCount: number): number {
  const targetThreshold = 10.0;
  return Math.min(Math.max(coursesDeliveredCount, 0) / targetThreshold, 1.0);
}

/**
 * Categorizes overall trainer match score into recommendation tiers.
 * @param overallScore - Overall trainer match score (0-100)
 * @returns Recommendation tier classification
 */
function getRecommendationTier(overallScore: number): TrainerMatchResult['recommendationTier'] {
  if (overallScore >= 85.0) return 'HIGHLY_RECOMMENDED';
  if (overallScore >= 70.0) return 'QUALIFIED';
  if (overallScore >= 50.0) return 'NEEDS_UPSKILLING';
  return 'UNSUITABLE';
}

/**
 * Core service: queries and returns ranked trainers for a given course ID.
 * Implements weighted scoring algorithm: 55% skill overlap, 30% rating, 15% delivery volume.
 * @param courseId - Unique identifier of the course
 * @param candidateTrainerIds - Optional array of trainer IDs to filter evaluation
 * @returns Promise resolving to CourseMatchResponse with ranked trainer matches
 */
export async function matchTrainersForCourse(
  courseId: string,
  candidateTrainerIds?: string[]
): Promise<CourseMatchResponse> {
  const course = initialCourses.find((c) => c.id === courseId) || initialCourses[0];

  let trainers = initialUsers.filter((u) => u.role === 'TRAINER' && u.status === 'APPROVED');
  if (candidateTrainerIds && candidateTrainerIds.length > 0) {
    trainers = trainers.filter((t) => candidateTrainerIds.includes(t.id));
  }

  const matchResults: TrainerMatchResult[] = trainers.map((trainer) => {
    // 1. Skill Overlap (55%)
    const { score: skillOverlapRatio, breakdown } = calculateSkillOverlap(
      course.competencies,
      trainer.competencies
    );
    const skillOverlapScore = skillOverlapRatio * 100;
    const skillOverlapWeighted = skillOverlapScore * ALGORITHM_WEIGHTS.SKILL_OVERLAP;

    // 2. Historical Rating (30%)
    const rawRating = trainer.id === 'user-trainer-1' ? 4.92 : trainer.id === 'user-trainer-2' ? 4.95 : 4.88;
    const ratingRatio = calculateRatingScore(rawRating);
    const historicalRatingScore = ratingRatio * 100;
    const historicalRatingWeighted = historicalRatingScore * ALGORITHM_WEIGHTS.HISTORICAL_RATING;

    // 3. Courses Delivered (15%)
    const rawCoursesDelivered = trainer.id === 'user-trainer-1' ? 14 : trainer.id === 'user-trainer-2' ? 8 : 10;
    const deliveryRatio = calculateDeliveryVolumeScore(rawCoursesDelivered);
    const coursesDeliveredScore = deliveryRatio * 100;
    const coursesDeliveredWeighted = coursesDeliveredScore * ALGORITHM_WEIGHTS.COURSES_DELIVERED;

    // Total Score
    const overallScore = Math.round((skillOverlapWeighted + historicalRatingWeighted + coursesDeliveredWeighted) * 10) / 10;

    return {
      trainerId: trainer.id,
      trainerName: trainer.profile.fullName,
      trainerEmail: trainer.email,
      avatarUrl: trainer.profile.avatarUrl,
      headline: trainer.profile.headline,
      organization: trainer.profile.organization,
      overallScore,
      rank: 1,
      components: {
        skillOverlapScore: Math.round(skillOverlapScore * 10) / 10,
        skillOverlapWeighted: Math.round(skillOverlapWeighted * 10) / 10,
        historicalRatingScore: Math.round(historicalRatingScore * 10) / 10,
        historicalRatingWeighted: Math.round(historicalRatingWeighted * 10) / 10,
        coursesDeliveredScore: Math.round(coursesDeliveredScore * 10) / 10,
        coursesDeliveredWeighted: Math.round(coursesDeliveredWeighted * 10) / 10,
      },
      metrics: {
        rawSkillOverlapPercentage: Math.round(skillOverlapRatio * 100),
        rawHistoricalRating: rawRating,
        rawCoursesDelivered,
      },
      competencyBreakdown: breakdown,
      recommendationTier: getRecommendationTier(overallScore),
    };
  });

  matchResults.sort((a, b) => b.overallScore - a.overallScore);
  matchResults.forEach((result, idx) => {
    result.rank = idx + 1;
  });

  return {
    courseId: course.id,
    courseTitle: course.title,
    courseCategory: course.category,
    requiredCompetenciesCount: course.competencies.length,
    evaluatedTrainersCount: matchResults.length,
    matches: matchResults,
    algorithmWeights: ALGORITHM_WEIGHTS,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Trainee competency gap analysis engine.
 * Evaluates user's current skills against IMD cadre benchmark requirements,
 * identifying gaps and recommending optimal courses and trainers for upskilling.
 * @param userId - Unique identifier of the trainee user
 * @param targetCadreCode - Optional target cadre code (defaults to user's current track)
 * @returns Promise resolving to TraineeGapAnalysisResponse with readiness score and gap remediation plan
 */
export async function analyzeTraineeCompetencyGap(
  userId: string,
  targetCadreCode?: string
): Promise<TraineeGapAnalysisResponse> {
  const user = initialUsers.find((u) => u.id === userId) || initialUsers.find((u) => u.role === 'TRAINEE') || initialUsers[4];

  // Resolve Cadre
  const cadreCode = targetCadreCode || user.cadreTrack || 'DRSTC';
  const cadre = initialCadres.find((c) => c.code === cadreCode) || initialCadres[0];

  let totalScorePoints = 0;
  let maxPossiblePoints = 0;
  let criticalGaps = 0;
  let moderateGaps = 0;
  let satisfied = 0;

  const gaps: TraineeGapItem[] = cadre.requiredCompetencies.map((req) => {
    const userComp = user.competencies.find(
      (c) => c.competencyId === req.competencyId || c.code === req.code
    );

    const currentProficiency = userComp ? userComp.proficiencyLevel : 0;
    const benchmarkProficiency = req.benchmarkLevel;
    const gapDelta = currentProficiency - benchmarkProficiency;

    // Weight points based on importance
    const weightMultiplier = req.importance === 'CRITICAL' ? 1.5 : req.importance === 'HIGH' ? 1.2 : 1.0;
    maxPossiblePoints += benchmarkProficiency * weightMultiplier;
    totalScorePoints += Math.min(currentProficiency, benchmarkProficiency) * weightMultiplier;

    let status: TraineeGapItem['status'] = 'MISSING';
    if (currentProficiency === 0) {
      status = 'MISSING';
      if (req.importance === 'CRITICAL') criticalGaps++;
      else moderateGaps++;
    } else if (currentProficiency >= benchmarkProficiency) {
      status = currentProficiency > benchmarkProficiency ? 'EXCEEDS' : 'MATCHES';
      satisfied++;
    } else {
      status = 'DEFICIENT';
      if (req.importance === 'CRITICAL' || gapDelta <= -2) criticalGaps++;
      else moderateGaps++;
    }

    // Find best-fit course mapped to this competency
    const matchingCourse = initialCourses.find((c) =>
      c.competencies.some((cc) => cc.competencyId === req.competencyId || cc.competencyName.toLowerCase().includes(req.competencyName.toLowerCase().slice(0, 8)))
    ) || initialCourses[0];

    // Find best-fit trainer for this competency
    const matchingTrainer = initialUsers.find((u) =>
      u.role === 'TRAINER' &&
      u.competencies.some((uc) => (uc.competencyId === req.competencyId || uc.code === req.code) && uc.proficiencyLevel >= 4)
    ) || initialUsers[1];

    return {
      competencyId: req.competencyId,
      competencyName: req.competencyName,
      code: req.code,
      currentProficiency,
      benchmarkProficiency,
      gapDelta,
      importance: req.importance,
      status,
      recommendedCourse: {
        id: matchingCourse.id,
        code: matchingCourse.code,
        title: matchingCourse.title,
        level: matchingCourse.level,
        durationHours: matchingCourse.durationHours,
      },
      recommendedTrainer: {
        id: matchingTrainer.id,
        name: matchingTrainer.profile.fullName,
        rating: matchingTrainer.id === 'user-trainer-1' ? 4.92 : 4.95,
        organization: matchingTrainer.profile.organization,
        matchScore: matchingTrainer.id === 'user-trainer-1' ? 96.4 : 94.8,
      },
    };
  });

  const readinessScore = Math.round((totalScorePoints / (maxPossiblePoints || 1)) * 100);

  let suggestedAction = 'Proceed with scheduled induction assessments.';
  if (criticalGaps > 0) {
    suggestedAction = `Immediate enrollment required in ${criticalGaps} critical Mission Mausam competency module(s) to meet cadre promotion threshold.`;
  } else if (moderateGaps > 0) {
    suggestedAction = 'Recommended to complete elective radar and AI nowcasting refresher courses.';
  }

  return {
    userId: user.id,
    userName: user.profile.fullName,
    userEmail: user.email,
    designation: user.designation || 'Meteorological Trainee',
    cadreTrack: cadre.code,
    cadreBenchmarkName: cadre.fullName,
    cadreBenchmarkDuration: cadre.duration,
    readinessScore,
    criticalGapsCount: criticalGaps,
    moderateGapsCount: moderateGaps,
    satisfiedCount: satisfied,
    totalCompetenciesEvaluated: cadre.requiredCompetencies.length,
    gaps,
    suggestedAction,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Discovers approved trainers filtered by meteorological domain and search criteria.
 * @param categoryFilter - Optional competency category filter (e.g., 'Radar', 'NWP')
 * @param search - Optional search query to match against trainer name, headline, or competencies
 * @returns Promise resolving to array of filtered MockUser trainer objects
 */
export async function discoverTrainersByDomain(
  categoryFilter?: string,
  search?: string
): Promise<MockUser[]> {
  let trainers = initialUsers.filter((u) => u.role === 'TRAINER' && u.status === 'APPROVED');

  if (categoryFilter && categoryFilter !== 'ALL') {
    trainers = trainers.filter((t) =>
      t.competencies.some((c) => {
        const comp = initialCompetencies.find((ic) => ic.id === c.competencyId || ic.code === c.code);
        return comp && comp.category === categoryFilter;
      })
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    trainers = trainers.filter(
      (t) =>
        t.profile.fullName.toLowerCase().includes(q) ||
        t.profile.headline.toLowerCase().includes(q) ||
        t.profile.organization.toLowerCase().includes(q) ||
        t.competencies.some((c) => c.competencyName.toLowerCase().includes(q))
    );
  }

  return trainers;
}
