import prisma from '@/lib/prisma';
import { getSharedStudies } from '@/services/radarService';
import { getAssignedCohorts } from '@/services/trainerService';
import { getTraineeTracks } from '@/services/traineeService';
import { bankQuestions } from '@/services/trainerService';

// ============================================================================
// Role-aware structured answers (Phase 3.1C–E). Deterministic, cited,
// hallucination-free: these run BEFORE retrieval and cover the documented
// example queries per role. Returns null when no intent matches.
// Audience rule: trainees get their OWN data, trainers their cohorts',
// admins governance-wide facts. Never another user's personal data.
// ============================================================================

export interface StructuredHit {
  text: string;
  sources: Array<{ source: string; section: string | null }>;
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function fullNameOf(u: { profile: { fullName: string } | null; email: string }): string {
  return u.profile?.fullName ?? u.email;
}

async function traineeWeakest(userId: string): Promise<StructuredHit | null> {
  const rows = await prisma.competencyScore.findMany({ where: { userId }, orderBy: { score: 'asc' } });
  if (rows.length === 0) return null;
  const worst = rows.reduce((a, b) => {
    const ga = a.requiredScore > 0 ? (a.requiredScore - a.score) / a.requiredScore : 0;
    const gb = b.requiredScore > 0 ? (b.requiredScore - b.score) / b.requiredScore : 0;
    return gb > ga ? b : a;
  });
  const gap = worst.requiredScore > 0 ? Math.round(((worst.requiredScore - worst.score) / worst.requiredScore) * 100) : 0;
  // Suggest the first incomplete lesson in the weakest-domain track, if any.
  let suggestion = 'Open your learning path below to continue.';
  try {
    const { tracks } = await getTraineeTracks(userId);
    const track = tracks.find((t) => t.domains.includes(worst.domain));
    const next = track?.modules.flatMap((m) => m.lessons.map((l) => ({ m: m.code, ...l }))).find((l) => !l.completed && !l.locked && l.code);
    if (track && next) suggestion = `Suggested next step: **${next.title}** (${next.code}, ${track.code}).`;
  } catch {
    /* suggestion stays generic */
  }
  return {
    text: `Your weakest competency domain is **${worst.domain}** — ${Math.round(worst.score)}/${Math.round(worst.requiredScore)} (**${gap}% gap**). ${suggestion}`,
    sources: [{ source: 'competency:profile', section: worst.domain }],
  };
}

async function traineeNextExam(userId: string): Promise<StructuredHit | null> {
  const now = new Date();
  const session = await prisma.cohortSession.findFirst({
    where: {
      type: 'EXAM_WINDOW',
      startsAt: { gte: now },
      cohort: { members: { some: { userId } } },
    },
    orderBy: { startsAt: 'asc' },
    include: { cohort: { select: { code: true } } },
  });
  if (!session) return null;
  return {
    text: `Your next exam is **${session.title}** (${session.cohort.code}) — window opens **${session.startsAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}**${session.endsAt ? ` and closes ${session.endsAt.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}. Complete the identity and system checks before starting.`,
    sources: [{ source: `cohort:${session.cohort.code}`, section: 'exam-window' }],
  };
}

async function modulePrereqs(message: string): Promise<StructuredHit | null> {
  const mods = await prisma.trainingModule.findMany({
    where: { isPublished: true },
    select: { code: true, title: true, track: { select: { code: true } }, prerequisites: { include: { prerequisite: { select: { code: true, title: true } } } } },
  });
  const q = message.toLowerCase();
  const hit = mods.find((m) => q.includes(m.code.toLowerCase()) || (m.title.toLowerCase().split(/[:–—-]/)[0] && q.includes(m.title.toLowerCase().slice(0, 24))));
  if (!hit) return null;
  if (hit.prerequisites.length === 0) {
    return {
      text: `**${hit.code} — ${hit.title}** has no prerequisites. You can start it directly from the ${hit.track.code} outline.`,
      sources: [{ source: `module:${hit.code}`, section: 'prerequisites' }],
    };
  }
  const list = hit.prerequisites.map((p) => `**${p.prerequisite.code}** — ${p.prerequisite.title}`).join('\n');
  return {
    text: `Before **${hit.code} — ${hit.title}**, complete:\n${list}\n\nLocked lessons unlock automatically once prerequisites are done.`,
    sources: [{ source: `module:${hit.code}`, section: 'prerequisites' }],
  };
}

async function trainerLowScorers(userId: string, message: string): Promise<StructuredHit | null> {
  const thresholdMatch = message.match(/(\d{2,3})\s*%/);
  const threshold = thresholdMatch ? Math.max(1, Math.min(99, Number(thresholdMatch[1]))) : 60;
  const domainMatch = message.toUpperCase().match(/RAD-NOWCAST|DISASTER-OPS|SYNOPTIC|COMMS|NWP|HPC/);
  const cohorts = await getAssignedCohorts(userId, false);
  if (cohorts.length === 0) return null;
  const memberRows = await prisma.cohortMember.findMany({
    where: { cohortId: { in: cohorts.map((c) => c.id) } },
    include: { user: { include: { profile: { select: { fullName: true } } } }, cohort: { select: { code: true } } },
  });
  const userIds: string[] = [];
  const seenUsers: Record<string, boolean> = {};
  for (const m of memberRows) {
    if (!seenUsers[m.userId]) {
      seenUsers[m.userId] = true;
      userIds.push(m.userId);
    }
  }
  const scores = await prisma.competencyScore.findMany({ where: { userId: { in: userIds } } });
  const byUser = new Map<string, typeof scores>();
  for (const s of scores) {
    const arr = byUser.get(s.userId) ?? [];
    arr.push(s);
    byUser.set(s.userId, arr);
  }
  const lines: string[] = [];
  for (const m of memberRows) {
    const rows = (byUser.get(m.userId) ?? []).filter((s) => !domainMatch || s.domain === domainMatch[0]);
    const weak = rows.filter((s) => s.score < threshold);
    if (weak.length > 0) {
      lines.push(`**${fullNameOf(m.user)}** (${m.cohort.code}): ${weak.map((s) => `${s.domain} ${Math.round(s.score)}`).join(', ')}`);
    }
    if (lines.length >= 5) break;
  }
  if (lines.length === 0) return null;
  const cohortCodes: string[] = [];
  const seenCohorts: Record<string, boolean> = {};
  for (const m of memberRows.slice(0, 5)) {
    if (!seenCohorts[m.cohort.code]) {
      seenCohorts[m.cohort.code] = true;
      cohortCodes.push(m.cohort.code);
    }
  }
  return {
    text: `Trainees below ${threshold}%${domainMatch ? ` in ${domainMatch[0]}` : ''} across your cohorts:\n${lines.join('\n')}\n\nConsider a remediation pack for the flagged domains.`,
    sources: cohortCodes.map((code) => ({ source: `cohort:${code}`, section: 'scores' })),
  };
}

const DIFFICULTY_WORDS: Array<[RegExp, 'EASY' | 'MEDIUM' | 'HARD']> = [
  [/\beasy\b|\bbasic\b|\bfoundation\b/i, 'EASY'],
  [/\bhard\b|\badvanced\b|\btough\b/i, 'HARD'],
];

async function trainerQuiz(message: string): Promise<StructuredHit | null> {
  const topic = message.replace(/generate|quiz|questions?|please|a |an |the |on |about |for |me |my /gi, ' ').trim();
  if (topic.length < 3) return null;
  let difficulty: 'EASY' | 'MEDIUM' | 'HARD' | undefined;
  for (let di = 0; di < DIFFICULTY_WORDS.length; di++) {
    const re = DIFFICULTY_WORDS[di][0];
    const d = DIFFICULTY_WORDS[di][1];
    if (re.test(message)) {
      difficulty = d;
      break;
    }
  }
  const domain = message.toUpperCase().match(/RAD-NOWCAST|DISASTER-OPS|SYNOPTIC|COMMS|NWP|HPC/)?.[0];
  const pool = await bankQuestions({ competency: domain, difficulty, q: topic.length > 30 ? undefined : topic });
  const picked = (pool.length > 0 ? pool : await bankQuestions({})).slice(0, 5);
  if (picked.length === 0) return null;
  const body = picked
    .map((q, i) => {
      const opts = q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o.text}`).join('\n');
      const key = Array.isArray(q.correct)
        ? q.correct.map((c) => { const idx = q.options.findIndex((o) => o.id === c); return idx >= 0 ? String.fromCharCode(65 + idx) : c; }).join(', ')
        : (() => { const idx = q.options.findIndex((o) => o.id === q.correct); return idx >= 0 ? String.fromCharCode(65 + idx) : ''; })();
      return `**Q${i + 1}.** ${q.text} _(${q.difficulty}, ${q.bloomsLevel})_\n${opts}\n   → Answer: **${key}**`;
    })
    .join('\n\n');
  return {
    text: `Here is a ${picked.length}-question practice set${domain ? ` on **${domain}**` : ''}${difficulty ? ` (${difficulty})` : ''} from your bank:\n\n${body}`,
    sources: [{ source: 'bank:questions', section: domain ?? 'mixed' }],
  };
}

async function adminLowStations(message: string): Promise<StructuredHit | null> {
  const m = message.match(/(\d{2,3})\s*%/);
  const threshold = m ? Math.max(1, Math.min(100, Number(m[1]))) : 70;
  const stations = await prisma.station.findMany({ where: { isActive: true, readinessPct: { lt: threshold } }, orderBy: { readinessPct: 'asc' }, take: 10 });
  if (stations.length === 0) return null;
  return {
    text: `Stations below ${threshold}% readiness this quarter (${stations.length} shown):\n${stations.map((s) => `**${s.code}** ${s.name} — ${Math.round(s.readinessPct)}% (gap: ${s.topGapDomain ?? '—'})`).join('\n')}`,
    sources: [{ source: 'stations:readiness', section: `below-${threshold}` }],
  };
}

async function adminCertsMonth(message: string): Promise<StructuredHit | null> {
  const m = message.toLowerCase().match(/january|february|march|april|may|june|july|august|september|october|november|december/);
  if (!m) return null;
  const month = MONTHS[m[0]] ?? 1;
  const now = new Date();
  let year = now.getUTCFullYear();
  if (month > now.getUTCMonth() + 1) year -= 1;
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const count = await prisma.certificate.count({ where: { issuedAt: { gte: start, lt: end } } });
  return {
    text: `**${count}** certificate(s) were issued in ${m[0][0].toUpperCase() + m[0].slice(1)} ${year}.`,
    sources: [{ source: 'reports:certification-rate', section: `${year}-${String(month).padStart(2, '0')}` }],
  };
}

async function adminPendingOld(): Promise<StructuredHit | null> {
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000);
  const rows = await prisma.user.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    orderBy: { createdAt: 'asc' },
    take: 10,
    include: { profile: { select: { fullName: true } } },
  });
  if (rows.length === 0) return null;
  return {
    text: `Registrations waiting over 48 hours (${rows.length}):\n${rows.map((u) => {
      const hrs = Math.floor((Date.now() - u.createdAt.getTime()) / 3600000);
      return `**${fullNameOf(u)}** (${u.email}, ${u.role}) — ${hrs}h`;
    }).join('\n')}\n\nReview or escalate them from the approval queue.`,
    sources: [{ source: 'approvals:queue', section: 'sla-breach' }],
  };
}

/**
 * Try every documented role intent in priority order. Pure reads, fully
 * RBAC-scoped by construction (own data / own cohorts / governance facts).
 */
export async function structuredAnswer(
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN',
  userId: string,
  message: string
): Promise<StructuredHit | null> {
  const q = message.toLowerCase();
  const has = (...needles: string[]) => needles.some((n) => q.includes(n));

  if (role === 'TRAINEE') {
    if (has('weakest', 'biggest gap', 'lagging', 'behind', 'improve')) return traineeWeakest(userId);
    if (has('next exam', 'upcoming exam', 'when') && has('exam')) return traineeNextExam(userId);
    if (has('pass', 'threshold', 'certification') && (has('pass') || has('threshold') || has('certificate') || has('certification'))) {
      return {
        text: 'Certification needs **70% overall** with no domain below 50%. DRSTC exams allow 3 attempts (best counts); every certificate verifies at `/verify/[certId]`.',
        sources: [{ source: 'faq:certification', section: 'Passing thresholds' }],
      };
    }
    if (has('before', 'prerequisite', 'unlock', 'need', 'require') && (has('module') || /[a-z]+-m\d+/i.test(message))) {
      return modulePrereqs(message);
    }
    if (has('exam') && has('when', 'next', 'upcoming', 'date', 'window')) return traineeNextExam(userId);
  }

  if (role === 'TRAINER') {
    if (has('quiz', 'generate', 'questions')) return trainerQuiz(message);
    if (has('below', 'under', 'struggl', 'weak', 'behind', 'at risk', 'scored') || /\d{2,3}\s*%/.test(message)) {
      return trainerLowScorers(userId, message);
    }
    if (has('pass', 'threshold')) {
      return {
        text: 'Assessments pass at **70%** by default (configurable per exam, up to 10 attempts). Item flags: difficulty outside 0.30–0.80 or discrimination below 0.30 deserve revision.',
        sources: [{ source: 'faq:certification', section: 'Passing thresholds' }],
      };
    }
  }

  if (role === 'ADMIN') {
    if (has('pending', 'approval', 'waiting', 'sla', 'old')) {
      const hit = await adminPendingOld();
      if (hit) return hit;
    }
    if (has('station', 'readiness') && (has('below', 'under', 'list', 'which') || /\d{2,3}\s*%/.test(message))) {
      return adminLowStations(message);
    }
    if (has('certificate', 'certificates', 'certification', 'issued') && has('august', 'september', 'october', 'july', 'june', 'january', 'february', 'march', 'april', 'may', 'november', 'december', 'month')) {
      return adminCertsMonth(message);
    }
    if (has('station', 'readiness', 'below', 'quarter')) return adminLowStations(message);
  }

  // Cross-role shared intents.
  if (has('prerequisite', 'before') && /[a-z]+-m\d+/i.test(message)) return modulePrereqs(message);
  return null;
}

export async function radarStudyCount(userId: string): Promise<number> {
  return (await getSharedStudies(userId)).length;
}
