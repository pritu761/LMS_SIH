import { bm25Scores, rankByScore } from './bm25';
import { cosineSimilarity, embedText, tokenize } from './embed';

// ============================================================================
// Hybrid retrieval (Phase 3.1B): BM25 keyword ranks + vector cosine ranks
// fused with Reciprocal Rank Fusion (k=60). Top-K=5 chunks with normalized
// confidence (top RRF / max RRF). Audience-filtered before scoring so a
// role can never retrieve out-of-scope chunks.
// ============================================================================

export const RETRIEVAL_TOP_K = 5;
const RRF_K = 60;
/** Normalized top-score below this triggers the "I don't know" fallback. */
export const CONFIDENCE_MIN = 0.25;

export interface CandidateDoc {
  id: string;
  content: string;
  embedding: number[] | null;
  source: string;
  section: string | null;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  source: string;
  section: string | null;
  score: number;
  confidence: number;
}

/**
 * Meteorological acronym expansion (bidirectional): authors write "NWP"
 * while askers write "numerical weather prediction" and vice versa.
 * Expands the query side only — the index stays literal.
 */
const ACRONYMS: Array<[RegExp, string]> = [
  [/\bnwp\b/i, 'numerical weather prediction'],
  [/numerical weather prediction/i, 'nwp'],
  [/\bdwr\b/i, 'doppler weather radar'],
  [/doppler (weather )?radar/i, 'dwr'],
  [/\bqpe\b/i, 'quantitative precipitation estimation rain'],
  [/\bqpf\b/i, 'quantitative precipitation forecast'],
  [/\binsat\b/i, 'indian satellite'],
  [/\bhpc\b/i, 'high performance computing parallel'],
  [/\bmpi\b/i, 'message passing interface parallel'],
  [/\beps\b/i, 'ensemble prediction system'],
  [/\bcfl\b/i, 'courant friedrichs lewy stability'],
  [/\bzdr\b/i, 'differential reflectivity dual polarization'],
  [/\bkdp\b/i, 'specific differential phase'],
  [/\brhi\b/i, 'range height indicator'],
  [/\bppi\b/i, 'plan position indicator'],
];

export function expandQuery(query: string): string {
  let out = query;
  for (const [re, expansion] of ACRONYMS) {
    if (re.test(out)) out += ` ${expansion}`;
  }
  return out;
}

function asVector(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length === 0) return null;
  if (!value.every((v) => typeof v === 'number' && Number.isFinite(v))) return null;
  return value as number[];
}

/** RRF fusion of BM25 + cosine ranks → top-K with normalized confidence. */
export function retrieve(query: string, candidates: CandidateDoc[], topK = RETRIEVAL_TOP_K): RetrievedChunk[] {
  if (candidates.length === 0 || !query.trim()) return [];
  const expanded = expandQuery(query);
  const docTokens = candidates.map((c) => tokenize(`${c.source} ${c.section ?? ''} ${c.content}`));
  const bm25 = bm25Scores(expanded, docTokens);
  const qVec = embedText(expanded);
  const cosine = candidates.map((c) => {
    const v = asVector(c.embedding);
    if (!v) return 0;
    return Math.max(0, cosineSimilarity(qVec, v));
  });

  // Gate: with zero lexical support AND only weak vector similarity, there
  // is no retrieval — otherwise RRF normalization would report confidence
  // 1.0 for pure noise (e.g. random-word queries).
  const maxBm = Math.max(0, ...bm25);
  const maxCos = Math.max(0, ...cosine);
  if (maxBm <= 0 && maxCos < 0.2) return [];

  const bmRank = rankByScore(bm25);
  const cosRank = rankByScore(cosine);
  const posOf = (order: number[]) => {
    const pos = new Map<number, number>();
    order.forEach((docIdx, rank) => pos.set(docIdx, rank));
    return pos;
  };
  const bmPos = posOf(bmRank);
  const cosPos = posOf(cosRank);

  const fused = candidates.map((c, idx) => {
    const hasBm = bm25[idx] > 0;
    const hasCos = cosine[idx] > 0;
    if (!hasBm && !hasCos) return { idx, score: 0 };
    // A chunk must match lexically OR vectorially; RRF both when present.
    const score = (hasBm ? 1 / (RRF_K + (bmPos.get(idx) ?? 1e9)) : 0) + (hasCos ? 1 / (RRF_K + (cosPos.get(idx) ?? 1e9)) : 0);
    return { idx, score };
  });
  const max = Math.max(0, ...fused.map((f) => f.score));
  if (max <= 0) return [];
  return fused
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, topK)
    .map((f) => {
      const c = candidates[f.idx];
      return {
        id: c.id,
        content: c.content,
        source: c.source,
        section: c.section,
        score: Math.round(f.score * 1e6) / 1e6,
        confidence: Math.round((f.score / max) * 100) / 100,
      };
    });
}
