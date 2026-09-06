import { searchCourses, getAllCourses, CourseSearchResult } from '@/services/courseSearchService';
import { MockCourse, initialAssessments, initialCadres, initialCompetencies } from '@/lib/mockData';

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
 * Resolve a course mentioned in free text (by code, id, or cadre track).
 */
function findCourseByMention(allCourses: MockCourse[], query: string): MockCourse | null {
  const q = query.toLowerCase();
  return (
    allCourses.find((c) => q.includes(c.code.toLowerCase())) ||
    allCourses.find((c) => q.includes(c.id.toLowerCase())) ||
    allCourses.find((c) => q.includes(c.slug.toLowerCase())) ||
    allCourses.find((c) => q.includes(c.cadreTrack.toLowerCase())) ||
    null
  );
}

/** Format material duration seconds into a human label. */
function formatDuration(totalSeconds?: number): string {
  if (!totalSeconds) return '';
  const m = Math.round(totalSeconds / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m} min`;
}

const TRACK_GUIDE: Record<string, string> = {
  DRSTC:
    '**DRSTC — Direct Recruited Scientists Training Course**: flagship induction pathway for newly recruited **Scientist-B** officers. Heavy focus on NWP theory, HPC parallelism on **Pratyush/Mihir**, and data assimilation.',
  FTC:
    '**FTC — Forecasters Training Course**: operational pathway for **in-service RMC forecasters**. Heavy focus on Dual-Pol Doppler radar interpretation, velocity de-aliasing, and cyclone nowcasting.',
  IMTC:
    '***REMOVED***: foundation pathway for **Meteorological Officers & Observers**. Covers synoptic charting, cloud classification, INSAT-3DS interpretation, and WMO METAR coding — the ideal starting point for newcomers.',
  MODULAR:
    '**MODULAR — In-Service Masterclasses**: short, high-impact specializations (AI/ML nowcasting, HPC optimization) for working professionals who need rapid upskilling.',
};

/** Concise domain micro-explainers paired with a catalog search term. */
const DOMAIN_FAQS: Array<{ keys: string[]; title: string; answer: string; searchTerm: string }> = [
  {
    keys: ['doppler', 'dwr', 'reflectivity', 'zdr', 'velocity', 'nyquist', 'polarimetric', 'kdp'],
    title: 'Doppler Weather Radar',
    answer:
      'A **Doppler Weather Radar (DWR)** transmits microwave pulses and measures the frequency shift of echoes from hydrometeors to infer radial wind velocity. **Reflectivity (Z)** reveals precipitation intensity, **Differential Reflectivity (ZDR)** distinguishes rain from hail, and the **Doppler Dilemma** (R_max × V_max = c·λ/8) forces a trade-off between unambiguous range and velocity.',
    searchTerm: 'radar',
  },
  {
    keys: ['nwp', 'numerical weather', 'wrf', 'gfs', 'ncum', 'governing equation', 'primitive equation'],
    title: 'Numerical Weather Prediction (NWP)',
    answer:
      '**NWP** solves the atmosphere\u2019s governing equations (momentum, continuity, thermodynamics) on a 3D grid stepping forward in time. Stability of explicit schemes is governed by the **CFL condition** (u·Δt/Δx ≤ 1), and staggered **Arakawa C-grids** prevent unphysical wave decoupling.',
    searchTerm: 'NWP modelling',
  },
  {
    keys: ['insat', 'satellite', 'radiance', 'sounder', 'remote sensing', 'water vapor', 'infrared channel'],
    title: 'INSAT-3DS & Satellite Remote Sensing',
    answer:
      '**INSAT-3DS** is India\u2019s advanced meteorological satellite carrying an imager and atmospheric sounder. Its **thermal-infrared and water-vapor channels** reveal cloud-top temperature, moisture plumes, and developing convection, while **sounder radiances** are assimilated into NWP models via 4D-Var.',
    searchTerm: 'satellite INSAT',
  },
  {
    keys: ['monsoon', 'southwest monsoon', 'northeast monsoon', 'withdrawal', 'onset'],
    title: 'Indian Monsoon',
    answer:
      'The **southwest monsoon** (June–September) delivers ~75% of India\u2019s annual rainfall, driven by the land–sea thermal contrast and the cross-equatorial Somali Jet. IMD declares **onset over Kerala** using rainfall, wind-field, and OLR criteria; the **northeast monsoon** (Oct–Dec) waters Tamil Nadu and coastal Andhra.',
    searchTerm: 'synoptic monsoon',
  },
  {
    keys: ['cyclone', 'hurricane', 'typhoon', 'depression', 'deep depression', 'landfall', 'eye of'],
    title: 'Tropical Cyclones',
    answer:
      'A **tropical cyclone** is an intense low-pressure vortex fueled by warm (>26.5°C) ocean moisture. IMD grades systems from **Depression → Deep Depression → Cyclonic Storm → Severe/Very Severe/Extremely Severe/Super Cyclonic Storm**. DWR **velocity couplets and eye tracking** plus INSAT imagery drive landfall warnings.',
    searchTerm: 'cyclone',
  },
  {
    keys: ['nowcast', '0-6 hour', '0–6 hour', 'short-range forecast'],
    title: 'Nowcasting',
    answer:
      '**Nowcasting** is 0–6 hour very-short-range forecasting of fast-evolving convection, driven by live **radar extrapolation, satellite rapid-scan, and AI models** (ConvLSTM, GraphCast). It powers severe thunderstorm, hail, and flash-flood warnings issued by RMCs.',
    searchTerm: 'nowcasting',
  },
  {
    keys: ['assimilation', '4d-var', '3d-var', '4dvar', 'data assimil'],
    title: 'Data Assimilation (4D-Var)',
    answer:
      '**Data assimilation** blends observations (radiosonde, satellite radiances, radar) with a short model forecast to produce the best initial state. **4D-Var** improves on 3D-Var by running the tangent-linear and adjoint model inside a time window, so observations are compared at their exact valid times.',
    searchTerm: 'NWP assimilation',
  },
  {
    keys: ['55/30/15', '55 30 15', 'competency mapping', 'competency gap', 'allocation'],
    title: '55/30/15 Competency Engine',
    answer:
      'Capacity Connect maps every learner with a **55/30/15 rule — 55% assessments, 30% course progress, 15% faculty/peer validation** — against WMO benchmark proficiency levels per cadre. Gaps automatically trigger personalized course recommendations on your Trainee dossier.',
    searchTerm: 'competency',
  },
  {
    keys: ['pratyush', 'mihir', 'supercomputer', 'mpi', 'hpc', 'parallel', 'gpu cluster'],
    title: 'Pratyush HPC Supercomputing',
    answer:
      '**Pratyush** (IITM Pune, ~6.8 PetaFLOPS) with sibling system **Mihir** (NCMRWF) powers India\u2019s global ensemble models. Atmospheric codes scale via **MPI domain decomposition** — the main bottleneck being **all-to-all transposes** in spectral transforms — plus GPU acceleration for AI workloads.',
    searchTerm: 'HPC Pratyush',
  },
  {
    keys: ['graphcast', 'convlstm', 'pinn', 'physics-informed', 'neural network', 'deep learning', 'machine learning', ' ai ', 'ai/', '/ai', 'artificial intelligence'],
    title: 'AI/ML for Weather (GraphCast, PINNs)',
    answer:
      'Modern **AI weather models** (DeepMind **GraphCast**, **ConvLSTM**, U-Nets) learn spatiotemporal patterns from decades of reanalysis. **Physics-Informed Neural Networks (PINNs)** add mass-conservation constraints so nowcasts stay sharp instead of blurred — because plain MSE loss averages away extreme rainfall peaks.',
    searchTerm: 'AI nowcasting',
  },
  {
    keys: ['metar', 'synoptic chart', 'isobar', 'buys ballot', 'front'],
    title: 'Synoptic Charts & METAR',
    answer:
      '**Synoptic charts** plot isobars, fronts, and station models at fixed UTC hours to diagnose large-scale systems. **METAR** is the WMO-coded hourly surface observation (wind, visibility, cloud, QNH). In the Northern Hemisphere, winds blow **counter-clockwise around lows** (Buys Ballot\u2019s Law).',
    searchTerm: 'synoptic METAR',
  },
];

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

  // 1b. Courtesy replies (thanks / goodbye / acknowledgement)
  if (/^(thanks|thank you|thankyou|thx|dhanyavad|shukriya|bye|goodbye|good morning|good afternoon|good evening|ok|okay|great|awesome|nice|perfect|cool|done|understood|got it)[!. ]*$/.test(cleanQuery)) {
    const isFarewell = /^(bye|goodbye|good night)/.test(cleanQuery);
    return {
      reply: isFarewell
        ? `👋 **Shubh Ratri! Happy learning.** Your IMD training progress is saved. Come back anytime — ask me about **syllabus details**, **exam patterns**, **certification**, or **enrollment** whenever you need guidance.`
        : `🙏 **You are most welcome!** Glad I could help with your meteorological training journey.\n\nI can also help you with:\n- 📖 **Syllabus details** — e.g. *"What is covered in IMD-FTC-201?"*\n- 📝 **Exam pattern** — e.g. *"Show passing score & exam details"*\n- 🎓 **Enrollment** — e.g. *"How do I enroll?"*\n- 🛰️ **Concepts** — e.g. *"What is Doppler radar?"* or *"Explain the monsoon"*`,
      matchedCourses: [],
      suggestedQueries: [
        'Show all courses',
        'What is covered in IMD-DRSTC-101?',
        'Show passing score & exam details',
        'How do I enroll in a course?',
      ],
      intent: 'COURTESY',
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

  // 2b. Syllabus / curriculum detail ("What is covered in IMD-FTC-201?")
  if (
    cleanQuery.includes('syllabus') ||
    cleanQuery.includes('curriculum') ||
    cleanQuery.includes('syllabi') ||
    cleanQuery.includes('topic') ||
    cleanQuery.includes('module') ||
    cleanQuery.includes('lesson') ||
    cleanQuery.includes('outline') ||
    cleanQuery.includes('content') ||
    cleanQuery.includes('unit') ||
    /what.{0,25}cover/.test(cleanQuery) ||
    /cover(s|ed|ing)? in/.test(cleanQuery) ||
    cleanQuery.includes('learn in')
  ) {
    const allCourses = await getAllCourses();
    const fallbackSearch = await searchCourses({ query: userQuery });
    const target =
      findCourseByMention(allCourses, cleanQuery) ||
      fallbackSearch.map((r) => r.course)[0] ||
      allCourses[0];

    if (target) {
      const materialLines = (target.materials || [])
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((m, i) => {
          const icon = m.type === 'VIDEO' ? '🎬' : m.type === 'PDF' ? '📄' : m.type === 'PPT' ? '📊' : '📝';
          const dur = m.durationSeconds ? ` • ⏱️ ${formatDuration(m.durationSeconds)}` : m.fileSize ? ` • 💾 ${m.fileSize}` : '';
          const preview = m.isPreview ? ' • 👀 *Free preview*' : '';
          return `${i + 1}. ${icon} **[${m.type}] ${m.title}**${dur}${preview}`;
        })
        .join('\n');

      const compLines = (target.competencies || [])
        .map((c) => `- 🧭 **${c.competencyName}** (Required proficiency: Level ${c.requiredProficiency})`)
        .join('\n');

      return {
        reply: `📖 **Syllabus: ${target.code} — ${target.title}**\n\n⏱️ **${target.durationHours} hours** • 📶 **${target.level}** • 👨‍🏫 ${target.trainerName} (${target.trainerRating} ★)\n\n**📚 Learning Materials:**\n${materialLines || 'Materials being curated — check the course page for updates.'}\n\n**🎯 Mapped Competencies:**\n${compLines || 'Domain fundamentals.'}\n\nOpen the course page to stream previews and download handbooks:`,
        matchedCourses: [target],
        suggestedQueries: [
          'Show passing score & exam details',
          'How do I enroll in a course?',
          `Compare ${target.code} with other modules`,
        ],
        intent: 'SYLLABUS_DETAIL',
      };
    }
  }

  // 2c. Exam / assessment pattern ("passing score", "exam details", "attempts")
  if (
    /\b(exams?|assessment|tests?|quiz|passing|marks?|scores?|grades?|attempts?|proctor\w*|timed|evaluation|pattern|question paper)\b/.test(cleanQuery)
  ) {
    const allCourses = await getAllCourses();
    const target = findCourseByMention(allCourses, cleanQuery);

    if (target) {
      const exam = initialAssessments.find(
        (a) => a.courseId === target.id || a.id === target.assessmentId
      );
      if (exam) {
        return {
          reply: `📝 **Exam Pattern: ${target.code} — ${exam.title}**\n\n- ⏱️ **Time limit:** ${exam.timeLimitMinutes} minutes (timed & proctored)\n- 🎯 **Passing score:** ${exam.passingScorePercentage}%\n- 🔢 **Questions:** ${exam.questions.length} timed MCQs\n- 🔁 **Max attempts:** ${exam.maxAttempts}\n- 📜 **On passing:** auto-unlock your NISG & MoES accredited certificate with QR verification\n\n*${exam.description}*\n\nFinish all video + handbook materials first (100% progress), then attempt the exam from the course page:`,
          matchedCourses: [target],
          suggestedQueries: [
            `What is covered in ${target.code}?`,
            'How do I enroll in a course?',
            'Tell me about certification',
          ],
          intent: 'EXAM_INFO',
        };
      }
    }

    // No specific course mentioned — summarize all exam patterns
    const examLines = allCourses
      .map((c) => {
        const exam = initialAssessments.find((a) => a.courseId === c.id || a.id === c.assessmentId);
        return exam
          ? `- **[${c.code}]** ${exam.timeLimitMinutes} min • ${exam.questions.length} MCQs • Pass **${exam.passingScorePercentage}%** • ${exam.maxAttempts} attempts`
          : null;
      })
      .filter(Boolean)
      .join('\n');

    return {
      reply: `📝 **Capacity Connect Assessment System**\n\nAll tracks use **proctored, timed MCQ exams** — score **≥ 70%** to unlock your digitally-signed certificate:\n\n${examLines}\n\nAsk for a specific module (e.g. *"Exam pattern for IMD-MOD-401"*) for full details:`,
      matchedCourses: allCourses,
      suggestedQueries: [
        'Exam pattern for IMD-DRSTC-101',
        'Exam pattern for IMD-FTC-201',
        'Tell me about certification',
      ],
      intent: 'EXAM_INFO',
    };
  }

  // 2d. Enrollment guidance ("How do I enroll?")
  if (
    /\b(enrol\w*|join|register\w*|admission|apply|signup|sign up|get started)\b/.test(cleanQuery) ||
    cleanQuery.includes('how do i start') ||
    cleanQuery.includes('how to join') ||
    cleanQuery.includes('start learning')
  ) {
    const searchResults = await searchCourses({ query: userQuery });
    const matched = searchResults.map((r) => r.course);
    const allCourses = matched.length > 0 ? matched : await getAllCourses();
    return {
      reply: `🎓 **How to Enroll on Capacity Connect**\n\n1. **Sign in** with your official gov ID (top-right *Sign In* button).\n2. **Browse** the catalog below or filter by cadre track (DRSTC / FTC / IMTC / Modular).\n3. Open a course and click **View Course** to inspect the syllabus.\n4. Hit **Enroll**, stream the video lectures + download the PDF handbooks.\n5. Complete **100% progress**, then clear the **timed exam (≥ 70%)** to earn your certificate.\n\nRecommended modules to start with:`,
      matchedCourses: allCourses.slice(0, 4),
      suggestedQueries: [
        'Which course should a beginner start with?',
        'Show passing score & exam details',
        'Is there any course fee?',
      ],
      intent: 'ENROLLMENT_INFO',
    };
  }

  // 2e. Beginner / recommendation guidance ("Which course should I start with?")
  if (
    cleanQuery.includes('prereq') ||
    cleanQuery.includes('eligib') ||
    cleanQuery.includes('beginner') ||
    cleanQuery.includes('fresher') ||
    cleanQuery.includes('inductee') ||
    cleanQuery.includes('recommend') ||
    cleanQuery.includes('suggest') ||
    cleanQuery.includes('best course') ||
    cleanQuery.includes('first course') ||
    cleanQuery.includes('new to') ||
    cleanQuery.includes('where') && cleanQuery.includes('start') ||
    cleanQuery.includes('which') && cleanQuery.includes('course')
  ) {
    const allCourses = await getAllCourses();
    const byTrack = (t: string) => allCourses.filter((c) => c.cadreTrack === t);
    return {
      reply: `🧭 **Where Should You Start? (Role-Based Guide)**\n\n- 🌱 **Complete newcomer / Observer** → Start with **IMTC-301** (*${byTrack('IMTC')[0]?.title || 'Integrated Synoptic Meteorology'}*, ${byTrack('IMTC')[0]?.durationHours || 16}h, Foundational). No prerequisites.\n- 🌪️ **Working forecaster (RMC)** → Go for **FTC-201** (Doppler radar & cyclone nowcasting, ${byTrack('FTC')[0]?.durationHours || 18.5}h). Assumes basic synoptic knowledge.\n- 🖥️ **Newly recruited Scientist-B** → Take **DRSTC-101** (NWP + HPC on Pratyush, ${byTrack('DRSTC')[0]?.durationHours || 24}h). Assumes UG-level physics/maths.\n- 🤖 **In-service specialist exploring AI** → Pick **MOD-401** (Physics-informed AI nowcasting, ${byTrack('MODULAR')[0]?.durationHours || 14}h). Basic Python/ML familiarity helps but is not mandatory.\n\nAll courses are self-paced with free preview lectures:`,
      matchedCourses: allCourses,
      suggestedQueries: [
        'What is covered in IMD-IMTC-301?',
        'How do I enroll in a course?',
        'Show passing score & exam details',
      ],
      intent: 'RECOMMENDATION',
    };
  }

  // 2f. Cadre track overview ("Tell me about the FTC track")
  if (
    /\b(drstc|ftc|imtc|modular)\b/.test(cleanQuery) &&
    /(track|about|tell|what|detail|info|mean|course|module)/.test(cleanQuery)
  ) {
    const allCourses = await getAllCourses();
    const track = (['DRSTC', 'FTC', 'IMTC', 'MODULAR'] as const).find((t) =>
      cleanQuery.includes(t.toLowerCase())
    )!;
    const trackCourses = allCourses.filter((c) => c.cadreTrack === track);
    return {
      reply: `${TRACK_GUIDE[track]}\n\n**📦 Modules in this track:**\n${trackCourses
        .map((c) => `- **[${c.code}] ${c.title}** — ${c.durationHours}h • ${c.level} • 👨‍🏫 ${c.trainerName}`)
        .join('\n')}\n\nSelect a module below to view its full syllabus:`,
      matchedCourses: trackCourses,
      suggestedQueries: [
        trackCourses[0] ? `What is covered in ${trackCourses[0].code}?` : 'Show all courses',
        'Show passing score & exam details',
        'Compare with other cadre modules',
      ],
      intent: 'TRACK_OVERVIEW',
    };
  }

  // 2g. Platform help (login, roles, progress, support)
  if (
    cleanQuery.includes('login') ||
    cleanQuery.includes('log in') ||
    cleanQuery.includes('sign in') ||
    cleanQuery.includes('password') ||
    cleanQuery.includes('forgot') ||
    cleanQuery.includes('account') ||
    cleanQuery.includes('profile') ||
    cleanQuery.includes('dashboard') ||
    cleanQuery.includes('progress') ||
    cleanQuery.includes('help') ||
    cleanQuery.includes('support') ||
    cleanQuery.includes('contact') ||
    cleanQuery.includes('navigate') ||
    cleanQuery.includes('how to use') ||
    cleanQuery.includes('role')
  ) {
    const allCourses = await getAllCourses();
    return {
      reply: `🛟 **Capacity Connect Platform Help**\n\n- 🔐 **Sign in:** use the *Sign In* button (top-right) with your official gov ID. New users can register via *Sign Up*.\n- 👥 **Roles:** *Admin* (DG IMD — approvals & analytics), *Trainer* (faculty — create courses & assessments), *Trainee* (scientists/forecasters — learn & certify). Switch workspaces from the profile menu.\n- 📊 **Track progress:** open *My Cadre / Trainee dashboard* for your 55/30/15 competency dossier, readiness score, and gap analysis.\n- 🛰️ **Live tools:** explore the *Live Doppler Radar* page and the *Technical Architecture* page from the navbar.\n- 📜 **Certificates:** auto-issued on the course page after 100% progress + ≥ 70% exam score.\n\nMeanwhile, here are popular modules learners ask about:`,
      matchedCourses: allCourses.slice(0, 3),
      suggestedQueries: [
        'How do I enroll in a course?',
        'Which course should a beginner start with?',
        'Tell me about certification',
      ],
      intent: 'PLATFORM_HELP',
    };
  }

  // 2h. Fees / pricing ("Is there any fee?")
  if (
    /\b(fees?|cost|price|pricing|payment|pay|charges?|free)\b/.test(cleanQuery)
  ) {
    const allCourses = await getAllCourses();
    return {
      reply: `💰 **Course Fees**\n\nCapacity Connect is a **sovereign, mission-funded platform** — all IMD/MoES training modules, video lectures, handbooks, timed assessments, and digitally-signed certificates are **completely FREE** for authorized government personnel (no payment step during enrollment).\n\nJust sign in, enroll, and start learning:`,
      matchedCourses: allCourses.slice(0, 3),
      suggestedQueries: [
        'How do I enroll in a course?',
        'Which course should a beginner start with?',
        'Show all courses',
      ],
      intent: 'FEES_INFO',
    };
  }

  // 2i. Domain micro-explainers ("What is Doppler radar?", "Explain the monsoon")
  if (
    /^(what is|what are|what does|explain|meaning of|define|how does|how do|why|tell me about)\b/.test(cleanQuery)
  ) {
    const faq = DOMAIN_FAQS.find((f) => f.keys.some((k) => cleanQuery.includes(k)));
    if (faq) {
      const searchResults = await searchCourses({ query: faq.searchTerm });
      const matched = searchResults.map((r) => r.course);
      return {
        reply: `📡 **${faq.title}**\n\n${faq.answer}\n\n**🎓 Master this hands-on in these modules:**`,
        matchedCourses: matched.length > 0 ? matched : await getAllCourses(),
        suggestedQueries: [
          'Show all courses',
          'Show passing score & exam details',
          'Which course should a beginner start with?',
        ],
        intent: 'DOMAIN_FAQ',
      };
    }
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

You can also ask me things like:
- **"What is covered in IMD-FTC-201?"** for full syllabus & materials
- **"Exam pattern for IMD-MOD-401"** for time limit, attempts & passing score
- **"How do I enroll?"** / **"Is there any fee?"**
- **"Which course should a beginner start with?"**
- **"What is Doppler radar?"** / **"Explain the monsoon"** for quick concept explainers
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
