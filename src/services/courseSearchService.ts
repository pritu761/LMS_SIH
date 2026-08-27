import { initialCourses, MockCourse, initialCadres } from '@/lib/mockData';
import { prisma } from '@/lib/prisma';

export interface CourseSearchResult {
  course: MockCourse;
  score: number;
  matchedHighlights: string[];
  relevanceReason?: string;
}

export interface CourseSearchFilters {
  query?: string;
  category?: string;
  cadreTrack?: string;
  level?: string;
  maxDuration?: number;
  trainerName?: string;
  competencyCode?: string;
}

/**
 * Normalizes text for robust multi-keyword matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Fetch all available courses from Prisma DB with fallback to mock data
 */
export async function getAllCourses(): Promise<MockCourse[]> {
  try {
    const dbCourses = await prisma.course.findMany({
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
        competencies: {
          include: {
            competency: true,
          },
        },
        materials: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        assessments: true,
      },
    });

    if (dbCourses && dbCourses.length > 0) {
      // Map Prisma courses to MockCourse format for consistent UI handling
      const mappedDbCourses: MockCourse[] = dbCourses.map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        slug: c.slug,
        description: c.description,
        category: c.category,
        cadreTrack: (c.code.includes('DRSTC')
          ? 'DRSTC'
          : c.code.includes('FTC')
          ? 'FTC'
          : c.code.includes('IMTC')
          ? 'IMTC'
          : 'MODULAR') as 'DRSTC' | 'FTC' | 'IMTC' | 'MODULAR',
        level: c.level,
        durationHours: c.durationHours,
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        status: c.status as 'PUBLISHED' | 'DRAFT',
        trainerId: c.trainerId,
        trainerName: c.trainer?.profile?.fullName || 'Faculty Specialist',
        trainerRating: 4.9,
        trainerSpecialization: c.trainer?.profile?.headline || 'IMD Senior Specialist',
        competencies: c.competencies.map((cc) => ({
          competencyId: cc.competencyId,
          competencyName: cc.competency.name,
          requiredProficiency: cc.requiredProficiency,
          weight: cc.weight,
        })),
        materials: c.materials.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          type: m.type as 'VIDEO' | 'PDF' | 'PPT' | 'DOC',
          url: m.url,
          downloadUrl: m.downloadUrl || undefined,
          durationSeconds: m.durationSeconds || 0,
          fileSize: m.fileSize || '10 MB',
          sortOrder: m.sortOrder,
          isPreview: m.isPreview,
        })),
        assessmentId: c.assessments[0]?.id || `assess-${c.id}`,
      }));

      // Combine with mock courses (dedup by code or id)
      const existingCodes = new Set(mappedDbCourses.map((c) => c.code.toLowerCase()));
      const combined = [...mappedDbCourses];

      for (const mock of initialCourses) {
        if (!existingCodes.has(mock.code.toLowerCase())) {
          combined.push(mock);
          existingCodes.add(mock.code.toLowerCase());
        }
      }

      return combined;
    }
  } catch (error) {
    // If DB is offline or table empty, gracefully fall back to mock data
  }

  return initialCourses;
}

/**
 * Intelligent course search algorithm with relevance scoring and highlight extraction
 */
export async function searchCourses(filters: CourseSearchFilters): Promise<CourseSearchResult[]> {
  const courses = await getAllCourses();
  const rawQuery = filters.query?.trim() || '';
  const queryTokens = tokenize(rawQuery);

  const results: CourseSearchResult[] = [];

  for (const course of courses) {
    let score = 0;
    const highlights: string[] = [];

    // Filter by cadre track if specified
    if (filters.cadreTrack && filters.cadreTrack !== 'ALL') {
      if (course.cadreTrack !== filters.cadreTrack) {
        continue;
      }
    }

    // Filter by max duration
    if (filters.maxDuration && course.durationHours > filters.maxDuration) {
      continue;
    }

    // Filter by category
    if (filters.category && filters.category !== 'ALL') {
      if (!course.category.toLowerCase().includes(filters.category.toLowerCase())) {
        continue;
      }
    }

    if (queryTokens.length === 0) {
      // No query: return all matching filter criteria with baseline score
      results.push({
        course,
        score: 1.0,
        matchedHighlights: [course.category, `${course.durationHours} hours`, course.cadreTrack],
        relevanceReason: `${course.cadreTrack} Track Module • ${course.level}`,
      });
      continue;
    }

    const titleTokens = tokenize(course.title);
    const codeTokens = tokenize(course.code);
    const descTokens = tokenize(course.description);
    const trainerTokens = tokenize(course.trainerName + ' ' + course.trainerSpecialization);
    const compTokens = tokenize(course.competencies.map((c) => c.competencyName).join(' '));
    const matTokens = tokenize(course.materials.map((m) => m.title + ' ' + m.description).join(' '));

    // Synonym mapping for meteorology domain
    const synonymMap: Record<string, string[]> = {
      radar: ['radar', 'doppler', 'dwr', 'nowcasting', 'reflectivity', 'zdr', 'polarimetric', 'cyclone'],
      nwp: ['nwp', 'modelling', 'modeling', 'numerical', 'pratyush', 'hpc', 'supercomputer', 'wrf', 'gfs', 'cfl'],
      hpc: ['hpc', 'supercomputer', 'parallel', 'mpi', 'openmp', 'pratyush', 'mihir', 'gpu', 'cluster'],
      ai: ['ai', 'ml', 'machine', 'learning', 'neural', 'deep', 'graphcast', 'convlstm', 'precipitation', 'physics-informed'],
      cyclone: ['cyclone', 'tropical', 'storm', 'depression', 'nowcasting', 'dwr', 'radar', 'synoptic', 'warning'],
      satellite: ['satellite', 'insat', 'remote', 'sensing', 'sounder', 'radiance', '3ds', 'infrared'],
      synoptic: ['synoptic', 'chart', 'metar', 'wmo', 'frontal', 'isobars', 'monsoon'],
      beginner: ['beginner', 'foundational', 'inductee', 'imtc', 'basics'],
      advanced: ['advanced', 'expert', 'drstc', 'masterclass', 'specialized'],
    };

    // Calculate match score across fields
    let directHit = false;

    // Check exact code match
    if (rawQuery.toLowerCase().includes(course.code.toLowerCase()) || course.code.toLowerCase().includes(rawQuery.toLowerCase())) {
      score += 50;
      highlights.push(`Direct Code Match: ${course.code}`);
      directHit = true;
    }

    // Check query tokens
    for (const token of queryTokens) {
      // Title match (High Weight)
      if (titleTokens.includes(token)) {
        score += 25;
        highlights.push(`Topic in Title: "${token}"`);
      } else if (titleTokens.some((t) => t.includes(token) || token.includes(t))) {
        score += 15;
      }

      // Code match
      if (codeTokens.includes(token)) {
        score += 20;
      }

      // Competency match (High Weight)
      if (compTokens.includes(token)) {
        score += 18;
        highlights.push(`Target Competency: "${token}"`);
      }

      // Trainer match
      if (trainerTokens.includes(token)) {
        score += 15;
        highlights.push(`Instructor: ${course.trainerName}`);
      }

      // Materials/Syllabus match
      if (matTokens.includes(token)) {
        score += 12;
        highlights.push(`Curriculum Material match`);
      }

      // Description match
      if (descTokens.includes(token)) {
        score += 8;
      }

      // Cadre track match
      if (course.cadreTrack.toLowerCase() === token) {
        score += 20;
        highlights.push(`${course.cadreTrack} Track`);
      }

      // Domain synonyms check
      for (const [key, syns] of Object.entries(synonymMap)) {
        if (token === key || syns.includes(token)) {
          const matchesCourseDomain =
            titleTokens.some((t) => syns.includes(t)) ||
            compTokens.some((t) => syns.includes(t)) ||
            descTokens.some((t) => syns.includes(t));

          if (matchesCourseDomain) {
            score += 10;
            highlights.push(`Domain Match: ${key.toUpperCase()}`);
          }
        }
      }
    }

    if (score > 0 || directHit) {
      const uniqueHighlights = Array.from(new Set(highlights)).slice(0, 3);
      results.push({
        course,
        score,
        matchedHighlights: uniqueHighlights,
        relevanceReason:
          uniqueHighlights.length > 0
            ? uniqueHighlights.join(' • ')
            : `${course.cadreTrack} Track • ${course.durationHours}h`,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get detailed course information with curriculum and assessment data
 */
export async function getCourseDetails(courseIdOrCode: string): Promise<MockCourse | null> {
  const courses = await getAllCourses();
  const normalized = courseIdOrCode.toLowerCase().trim();

  return (
    courses.find(
      (c) =>
        c.id.toLowerCase() === normalized ||
        c.code.toLowerCase() === normalized ||
        c.slug.toLowerCase() === normalized
    ) || null
  );
}
