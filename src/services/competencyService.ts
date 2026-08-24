// Capacity Connect - Competency Mapping Engine
// Algorithmic matching service calculating weighted trainer-course compatibility

import { initialUsers, initialCourses, initialCompetencies, MockCourse, MockUser } from '@/lib/mockData';

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
 * Calculate the Competency Skill Overlap score (55% weight)
 * Compares required course competency proficiencies against trainer proficiencies
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

    // Find trainer's competency record
    const trainerComp = trainerCompetencies.find(
      (c) => c.competencyId === req.competencyId || c.competencyName.toLowerCase() === req.competencyName.toLowerCase()
    );

    const trainerProficiency = trainerComp ? trainerComp.proficiencyLevel : 0;
    const requiredProficiency = req.requiredProficiency || 3;

    // Calculate match ratio (capped at 1.0 so surplus in one skill doesn't overcompensate missing ones)
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
 * Calculate Normalized Historical Rating score (30% weight)
 * Normalizes 1.0 - 5.0 star ratings to [0.0, 1.0].
 * Default baseline for new approved trainers without reviews is 3.8 / 5.0 (0.76).
 */
export function calculateRatingScore(historicalRating?: number): number {
  if (historicalRating === undefined || historicalRating === null || historicalRating <= 0) {
    return 0.75; // Neutral baseline for newly approved trainers
  }
  // Clamp between 0.0 and 5.0
  const clamped = Math.min(Math.max(historicalRating, 0), 5.0);
  return clamped / 5.0;
}

/**
 * Calculate Normalized Course Delivery Volume score (15% weight)
 * Scaled metric where 10+ completed courses delivered achieves full 1.0 score.
 */
export function calculateDeliveryVolumeScore(coursesDeliveredCount: number): number {
  const targetThreshold = 10.0;
  return Math.min(Math.max(coursesDeliveredCount, 0) / targetThreshold, 1.0);
}

/**
 * Categorize into recommendation tiers
 */
function getRecommendationTier(overallScore: number): TrainerMatchResult['recommendationTier'] {
  if (overallScore >= 85.0) return 'HIGHLY_RECOMMENDED';
  if (overallScore >= 70.0) return 'QUALIFIED';
  if (overallScore >= 50.0) return 'NEEDS_UPSKILLING';
  return 'UNSUITABLE';
}

/**
 * Core Service: Query and return ranked trainers for any given course ID
 */
export async function matchTrainersForCourse(
  courseId: string,
  candidateTrainerIds?: string[]
): Promise<CourseMatchResponse> {
  // 1. Fetch course details
  const course = initialCourses.find((c) => c.id === courseId) || initialCourses[0];

  // 2. Fetch all approved trainers
  let trainers = initialUsers.filter((u) => u.role === 'TRAINER' && u.status === 'APPROVED');
  if (candidateTrainerIds && candidateTrainerIds.length > 0) {
    trainers = trainers.filter((t) => candidateTrainerIds.includes(t.id));
  }

  // 3. Evaluate each trainer through the 55/30/15 weighted model
  const matchResults: TrainerMatchResult[] = trainers.map((trainer) => {
    // 3.1 Skill Overlap Component (55%)
    const { score: skillOverlapRatio, breakdown } = calculateSkillOverlap(
      course.competencies,
      trainer.competencies
    );
    const skillOverlapScore = skillOverlapRatio * 100;
    const skillOverlapWeighted = skillOverlapScore * ALGORITHM_WEIGHTS.SKILL_OVERLAP;

    // 3.2 Historical Rating Component (30%)
    // Compute trainer's historical rating or use mock property
    const rawRating = trainer.id === 'user-trainer-1' ? 4.85 : trainer.id === 'user-trainer-2' ? 4.92 : 4.2;
    const ratingRatio = calculateRatingScore(rawRating);
    const historicalRatingScore = ratingRatio * 100;
    const historicalRatingWeighted = historicalRatingScore * ALGORITHM_WEIGHTS.HISTORICAL_RATING;

    // 3.3 Past Courses Delivered Component (15%)
    const rawCoursesDelivered = trainer.id === 'user-trainer-1' ? 12 : trainer.id === 'user-trainer-2' ? 7 : 2;
    const deliveryRatio = calculateDeliveryVolumeScore(rawCoursesDelivered);
    const coursesDeliveredScore = deliveryRatio * 100;
    const coursesDeliveredWeighted = coursesDeliveredScore * ALGORITHM_WEIGHTS.COURSES_DELIVERED;

    // 3.4 Overall Final Weighted Score
    const overallScore = Math.round((skillOverlapWeighted + historicalRatingWeighted + coursesDeliveredWeighted) * 10) / 10;

    return {
      trainerId: trainer.id,
      trainerName: trainer.profile.fullName,
      trainerEmail: trainer.email,
      avatarUrl: trainer.profile.avatarUrl,
      headline: trainer.profile.headline,
      organization: trainer.profile.organization,
      overallScore,
      rank: 1, // Will be set after sorting
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

  // 4. Sort descending by overall compatibility score
  matchResults.sort((a, b) => b.overallScore - a.overallScore);

  // 5. Assign ordinal ranks
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
