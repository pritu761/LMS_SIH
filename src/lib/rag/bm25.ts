import { tokenize } from './embed';

// ============================================================================
// BM25 keyword search (Phase 3.1B), k1=1.2 / b=0.75, computed over the
// role-filtered candidate set per query (a few hundred chunks — no index
// server needed at this scale).
// ============================================================================

const K1 = 1.2;
const B = 0.75;

export interface ScoredDoc {
  id: number;
  score: number;
}

/** BM25 scores for each candidate doc (parallel arrays with `docs`). */
export function bm25Scores(query: string, docs: string[][]): number[] {
  const terms: string[] = [];
  const seenTerms: Record<string, boolean> = {};
  for (const t of tokenize(query)) {
    if (!seenTerms[t]) {
      seenTerms[t] = true;
      terms.push(t);
    }
  }
  if (terms.length === 0 || docs.length === 0) return docs.map(() => 0);
  const N = docs.length;
  const avgLen = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, N);
  const docFreq = new Map<string, number>();
  for (const doc of docs) {
    const seen: Record<string, boolean> = {};
    for (const t of doc) {
      if (!seen[t]) {
        seen[t] = true;
        docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
      }
    }
  }
  return docs.map((doc) => {
    let score = 0;
    const len = doc.length || 1;
    for (const term of terms) {
      let tf = 0;
      for (const t of doc) if (t === term) tf += 1;
      if (tf === 0) continue;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      score += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * len) / Math.max(1, avgLen))));
    }
    return score;
  });
}

/** Rank indices by score desc (stable): returns doc positions. */
export function rankByScore(scores: number[]): number[] {
  return scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((r) => r.idx);
}
