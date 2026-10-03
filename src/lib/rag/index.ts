import prisma from '@/lib/prisma';
import { chunkText } from './chunk';
import { CORPUS_VERSION, STATIC_CORPUS } from './corpus';
import { EMBEDDING_MODEL_ID, embedText } from './embed';

// ============================================================================
// Knowledge-base indexing (Phase 3.1A): lessons, rubrics, FAQs, policies,
// station briefs → chunked (512t/50 overlap) + embedded → Document rows.
// Upserts are keyed by (source, section): re-running replaces stale chunks.
// Call buildIndex() for full rebuilds (admin) and indexLesson() after any
// lesson publish/update (best-effort hook — never blocks authoring).
// ============================================================================

interface IndexDoc {
  source: string;
  section: string | null;
  audience: string[];
  content: string;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

async function collectLessonDocs(lessonIds?: string[]): Promise<IndexDoc[]> {
  const lessons = await prisma.lesson.findMany({
    where: { status: 'PUBLISHED', ...(lessonIds ? { id: { in: lessonIds } } : {}) },
    include: { module: { include: { track: { select: { code: true, name: true } } } } },
  });
  const docs: IndexDoc[] = [];
  for (const l of lessons) {
    const header = `${l.module.track.code} ${l.module.code}: ${l.title}\n${l.module.title}\n`;
    for (const chunk of chunkText(header + l.content, l.title)) {
      docs.push({
        source: `lesson:${l.code ?? l.id}`,
        section: l.title,
        audience: ['ALL'],
        content: chunk.content,
      });
    }
  }
  return docs;
}

async function collectRubricDocs(): Promise<IndexDoc[]> {
  const comps = await prisma.competency.findMany();
  const docs: IndexDoc[] = [];
  for (const c of comps) {
    const body = [
      `${c.name} (${c.code}).`,
      c.description ?? '',
      `Category: ${c.category}. Target level ${c.targetLevel}/5.`,
      c.domainCode ? `Domain: ${c.domainCode}.` : '',
      c.wmoCode ? `WMO mapping: ${c.wmoCode}.` : '',
      c.wmoRubricRef ?? '',
    ]
      .filter(Boolean)
      .join('\n');
    for (const chunk of chunkText(body, c.name)) {
      docs.push({ source: `rubric:${c.code}`, section: c.name, audience: ['ALL'], content: chunk.content });
    }
  }
  return docs;
}

async function collectStationDocs(): Promise<IndexDoc[]> {
  const stations = await prisma.station.findMany({ where: { isActive: true } });
  const docs: IndexDoc[] = [];
  for (const s of stations) {
    const body =
      `Station brief ${s.code} — ${s.name}, ${s.city}, ${s.state} (${s.region}). ` +
      `${s.radarType} DWR, ${s.radarRangeKm} km range. Readiness ${Math.round(s.readinessPct)}%, cadre ${s.cadreCount}, ` +
      `top gap ${s.topGapDomain ?? 'unknown'}. Last survey ${s.lastSurveyAt ? s.lastSurveyAt.toISOString().slice(0, 10) : 'unknown'}.`;
    docs.push({ source: `station:${s.code}`, section: s.name, audience: ['TRAINER', 'ADMIN'], content: body });
  }
  return docs;
}

function collectStaticDocs(): IndexDoc[] {
  const docs: IndexDoc[] = [];
  for (const d of STATIC_CORPUS) {
    for (const chunk of chunkText(d.content, d.section)) {
      docs.push({
        source: d.source,
        section: d.section,
        audience: d.audience === 'ALL' ? ['ALL'] : ['TRAINER', 'ADMIN'],
        content: chunk.content,
      });
    }
  }
  return docs;
}

async function writeDocs(docs: IndexDoc[]): Promise<{ sources: number; chunks: number }> {
  const bySource = new Map<string, IndexDoc[]>();
  for (const d of docs) {
    const arr = bySource.get(d.source) ?? [];
    arr.push(d);
    bySource.set(d.source, arr);
  }
  let chunks = 0;
  const entries: Array<[string, IndexDoc[]]> = [];
  bySource.forEach((list, source) => {
    entries.push([source, list]);
  });
  for (const entry of entries) {
    const source = entry[0];
    const list = entry[1];
    await prisma.$transaction([
      prisma.document.deleteMany({ where: { source } }),
      prisma.document.createMany({
        data: list.map((d) => ({
          content: d.content,
          embedding: embedText(d.content) as unknown as object,
          embeddingModel: `${EMBEDDING_MODEL_ID} · ${CORPUS_VERSION}`,
          source: d.source,
          section: d.section,
          metadata: { audience: d.audience },
        })),
      }),
    ]);
    chunks += list.length;
  }
  return { sources: bySource.size, chunks };
}

/** Full rebuild (admin-triggered). Returns source/chunk counts. */
export async function buildIndex(): Promise<{ sources: number; chunks: number }> {
  const [lessons, rubrics, stations] = await Promise.all([collectLessonDocs(), collectRubricDocs(), collectStationDocs()]);
  return writeDocs([...lessons, ...rubrics, ...stations, ...collectStaticDocs()]);
}

/** Re-index a single lesson after publish/update (best-effort hook). */
export async function indexLesson(lessonId: string): Promise<void> {
  try {
    const docs = await collectLessonDocs([lessonId]);
    if (docs.length === 0) {
      // Unpublished/deleted → drop its chunks.
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { code: true } });
      await prisma.document.deleteMany({ where: { source: lesson?.code ? `lesson:${lesson.code}` : `lesson:${lessonId}` } });
      return;
    }
    await writeDocs(docs);
  } catch (err) {
    console.warn('[rag] lesson re-index failed (non-blocking):', err instanceof Error ? err.message : err);
  }
}
