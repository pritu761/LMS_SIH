import { searchCourses, getAllCourses, CourseSearchResult } from '@/services/courseSearchService';
import { MockCourse, initialCadres, initialCompetencies } from '@/lib/mockData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  matchedCourses?: MockCourse[];
  suggestedQueries?: string[];
  intent?: string;
}

export interface ChatEngineResponse {
  reply: string;
  matchedCourses: MockCourse[];
  suggestedQueries: string[];
  intent: string;
}

/**
 * Intelligent domain intent analyzer & response generator for LMS courses
 */
export async function generateCourseChatResponse(
  userQuery: string,
  history: Array<{ role: string; content: string }> = [],
  userRole?: string
): Promise<ChatEngineResponse> {
  const cleanQuery = userQuery.trim().toLowerCase();

  // 1. Check for Greetings / Identity queries
  if (
    cleanQuery === 'hi' ||
    cleanQuery === 'hello' ||
    cleanQuery === 'hey' ||
    cleanQuery.startsWith('hi ') ||
    cleanQuery.startsWith('hello ') ||
    cleanQuery === 'who are you' ||
    cleanQuery.includes('what can you do')
  ) {
    const allCourses = await getAllCourses();
    return {
      reply: `👋 **Namaste! I am the Capacity Connect AI Course Navigator** for the Indian Meteorological Department & Ministry of Earth Sciences.

I can help you explore and enroll in specialized training modules across all cadre tracks:
- 🌪️ **Radar & Convective Nowcasting** (FTC Track)
- 🖥️ **Earth-System Modelling & Supercomputing (Pratyush HPC)** (DRSTC Track)
- 🛰️ **Satellite Remote Sensing & INSAT-3DS Sounder Analytics** (IMTC Track)
- 🤖 **Physics-Informed AI/ML Nowcasting Masterclasses** (Modular Track)

How can I assist your upskilling journey today? You can type any topic, faculty name, or select a prompt below.`,
      matchedCourses: allCourses.slice(0, 3),
      suggestedQueries: [
        'Show all courses',
        'Show me Doppler Radar courses',
        'Find HPC & Numerical Modelling modules',
        'What AI/ML courses are available?',
        'Courses by Prof. Vikramaditya Sen',
      ],
      intent: 'GREETING',
    };
  }

  // 2. Check for "Show all courses" / Catalog Intent
  if (
    cleanQuery === 'show all courses' ||
    cleanQuery === 'all courses' ||
    cleanQuery === 'show courses' ||
    cleanQuery === 'list courses' ||
    cleanQuery === 'browse courses' ||
    cleanQuery === 'course catalog' ||
    cleanQuery === 'view courses' ||
    cleanQuery.includes('all course')
  ) {
    const allCourses = await getAllCourses();
    return {
      reply: `📚 **Capacity Connect National Meteorological Curriculum**:

Here is the complete roster of specialized modules across all 4 cadre tracks (**DRSTC, FTC, IMTC, and Modular AI**):

- 🌟 **DRSTC Track**: Inductee Scientist High-Performance Numerical Modelling & Supercomputing
- 🌪️ **FTC Track**: Forecasters Training Course on Doppler Weather Radar (DWR) & Nowcasting
- 🛰️ **IMTC Track**: Intermediate Synoptic Observation, INSAT-3DS & Surface Stations
- 🤖 **Modular Track**: Physics-Informed Neural Networks (PINNs) & Deep Learning Masterclasses

Select any module below to inspect the syllabus, preview video lessons, or take the timed assessment:`,
      matchedCourses: allCourses,
      suggestedQueries: [
        'Find Doppler Radar courses',
        'Earth-System HPC Modelling on Pratyush',
        'AI/ML Precipitation Nowcasting',
        'Courses by Prof. Vikramaditya Sen',
      ],
      intent: 'ALL_COURSES',
    };
  }

  // 2. Check for Certification / Cadre Benchmark FAQs
  if (
    cleanQuery.includes('certificate') ||
    cleanQuery.includes('certification') ||
    cleanQuery.includes('wmo') ||
    cleanQuery.includes('cadre') ||
    cleanQuery.includes('drstc') && cleanQuery.includes('track')
  ) {
    const allCourses = await getAllCourses();
    return {
      reply: `📜 **WMO & Capacity Connect Certification Standards**:

All training curricula on Capacity Connect adhere to **WMO-258 BIP-M (Basic Instruction Package for Meteorologists)** guidelines.

**How to Earn Your Sovereign Certificate**:
1. Complete all video lectures and technical slide decks in your curriculum track (100% progress).
2. Pass the proctored, timed **Assessment Exam** with $\\ge 70\\%$ score.
3. Automatically unlock and download your digitally signed **NISG & MoES Accredited Competency Certificate** with QR verification.

Here are the certified flagship modules available for immediate enrollment:`,
      matchedCourses: allCourses,
      suggestedQueries: [
        'DRSTC Inductee modules',
        'Forecasters FTC certification',
        'Take assessment practice exam',
        'Modular AI/ML certificate',
      ],
      intent: 'CERTIFICATION_INFO',
    };
  }

  // 3. Check for Comparison Intent (e.g. "compare DRSTC-101 and IMTC-301")
  if (cleanQuery.includes('compare') || cleanQuery.includes('difference between') || cleanQuery.includes(' vs ')) {
    const allCourses = await getAllCourses();
    const matches = allCourses.filter((c) =>
      cleanQuery.includes(c.code.toLowerCase()) ||
      cleanQuery.includes(c.cadreTrack.toLowerCase()) ||
      cleanQuery.includes(c.title.toLowerCase().split(':')[0].toLowerCase())
    );

    if (matches.length >= 2) {
      const c1 = matches[0];
      const c2 = matches[1];

      return {
        reply: `⚖️ **Curriculum Comparison: ${c1.code} vs ${c2.code}**

| Feature | **${c1.code}** | **${c2.code}** |
| :--- | :--- | :--- |
| **Title** | ${c1.title} | ${c2.title} |
| **Cadre Track** | \`${c1.cadreTrack}\` | \`${c2.cadreTrack}\` |
| **Target Level** | ${c1.level} | ${c2.level} |
| **Duration** | **${c1.durationHours} Hours** | **${c2.durationHours} Hours** |
| **Lead Faculty** | ${c1.trainerName} (${c1.trainerRating} ★) | ${c2.trainerName} (${c2.trainerRating} ★) |
| **Core Focus** | ${(c1.competencies || []).map((c) => c.competencyName?.split('&')[0] || '').filter(Boolean).join(', ') || 'Domain Fundamentals'} | ${(c2.competencies || []).map((c) => c.competencyName?.split('&')[0] || '').filter(Boolean).join(', ') || 'Domain Fundamentals'} |
| **Materials** | ${(c1.materials || []).length} Lectures & Reference Guides | ${(c2.materials || []).length} Lectures & Handbooks |

💡 **Recommendation**: If your focus is high-performance modelling, select **${c1.code}**; for operational nowcasting or synoptic observation, choose **${c2.code}**.`,
        matchedCourses: [c1, c2],
        suggestedQueries: [
          `View syllabus for ${c1.code}`,
          `View syllabus for ${c2.code}`,
          'Show all modular courses',
        ],
        intent: 'COURSE_COMPARISON',
      };
    }
  }

  // 4. Check for Faculty / Instructor specific inquiry
  if (
    cleanQuery.includes('trainer') ||
    cleanQuery.includes('faculty') ||
    cleanQuery.includes('professor') ||
    cleanQuery.includes('dr.') ||
    cleanQuery.includes('taught by') ||
    cleanQuery.includes('sen') ||
    cleanQuery.includes('roy') ||
    cleanQuery.includes('rao')
  ) {
    const searchResults = await searchCourses({ query: userQuery });
    const matched = searchResults.map((r) => r.course);

    if (matched.length > 0) {
      const topTrainer = matched[0].trainerName;
      return {
        reply: `👨‍🏫 **Faculty Profile & Course Offerings for ${topTrainer}**:

${matched[0].trainerSpecialization}

Here are the specialized curriculum modules led by ${topTrainer}:
${matched
  .map(
    (c) =>
      `- **[${c.code}] ${c.title}** (${c.durationHours} hrs) • Rating: **${c.trainerRating} / 5.0 ★**`
  )
  .join('\n')}

Click below to explore syllabus breakdown, preview video lectures, or start learning:`,
        matchedCourses: matched,
        suggestedQueries: [
          'Show courses by Dr. Ananya Roy',
          'Show courses by Dr. Rameshwar Rao',
          'Show courses by Prof. Vikramaditya Sen',
        ],
        intent: 'INSTRUCTOR_SEARCH',
      };
    }
  }

  // 5. Check for Duration / Short Course filters
  if (
    cleanQuery.includes('short') ||
    cleanQuery.includes('quick') ||
    cleanQuery.includes('under 15') ||
    cleanQuery.includes('less than 15') ||
    cleanQuery.includes('hours')
  ) {
    const searchResults = await searchCourses({ query: userQuery, maxDuration: 18 });
    const matched = searchResults.map((r) => r.course);

    return {
      reply: `⏱️ **Short & High-Impact Modular Courses**:

Here are intensive training modules designed for in-service forecasters with rapid completion timelines:`,
      matchedCourses: matched.length > 0 ? matched : (await getAllCourses()).slice(0, 2),
      suggestedQueries: [
        'AI/ML Nowcasting course (14 hrs)',
        'Doppler Radar course (18.5 hrs)',
        'Full 24-hr DRSTC Flagship',
      ],
      intent: 'DURATION_FILTER',
    };
  }

  // 6. General Semantic & Multi-keyword Search
  const searchResults = await searchCourses({ query: userQuery });
  const matched = searchResults.map((r) => r.course);

  if (matched.length > 0) {
    const topResult = searchResults[0];
    const matchCount = matched.length;

    let responseSummary = `🔍 Found **${matchCount} matching ${matchCount === 1 ? 'course' : 'courses'}** for your query: *"**${userQuery}**"*\n\n`;

    // Highlight key match rationale
    if (topResult.matchedHighlights.length > 0) {
      responseSummary += `🎯 **Best Match:** **${topResult.course.code}** — ${topResult.course.title}\n`;
      responseSummary += `📌 *Why this matches:* ${topResult.matchedHighlights.join(' • ')}\n\n`;
    }

    responseSummary += `Explore the module details below or click any card to start streaming lectures and reviewing reference slide decks:`;

    return {
      reply: responseSummary,
      matchedCourses: matched,
      suggestedQueries: [
        `What is covered in ${matched[0].code}?`,
        'Compare with other cadre modules',
        'Show passing score & exam details',
        'Find more courses in this category',
      ],
      intent: 'COURSE_SEARCH',
    };
  }

  // 7. Fallback when no direct match is found
  const fallbackCourses = await getAllCourses();
  return {
    reply: `🤔 I couldn't find an exact match for *"**${userQuery}**"*, but here is our full national meteorological curriculum across all four core tracks (DRSTC, FTC, IMTC, and Modular AI).

You can also search by specific terms like:
- **"Radar"** for S/C/X-band Dual-Polarimetric nowcasting
- **"NWP"** for Earth-System HPC numerical simulations
- **"Satellite"** for INSAT-3DS sounder and atmospheric motion vectors
- **"AI"** for GraphCast and physics-informed neural networks`,
    matchedCourses: fallbackCourses,
    suggestedQueries: [
      'Show Doppler Weather Radar course',
      'Show Earth-System HPC Modelling',
      'Show Physics-Informed AI/ML Nowcasting',
      'Show Synoptic Meteorology & INSAT-3DS',
    ],
    intent: 'FALLBACK_SEARCH',
  };
}
