// ============================================================================
// Portable embeddings (Phase 3.1A): deterministic hashed bag-of-words
// vectors (512-dim, L2-normalized). Zero dependencies, offline-safe, and
// stored in Document.embedding (JSON) per the schema's portable design.
// Cosine similarity over these vectors captures topical overlap well for
// curriculum text; BM25 (see bm25.ts) covers exact terms, fused via RRF.
//
// Production upgrade: set EMBEDDING_MODEL=openai/text-embedding-3-small with
// OPENAI_API_KEY and swap embedTexts() for the API call — the interface and
// stored format (float arrays) stay identical. pgvector migration SQL lives
// in the schema header.
// ============================================================================

export const EMBEDDING_DIM = 512;
export const EMBEDDING_MODEL_ID = process.env.EMBEDDING_MODEL ?? 'local/hash-512-v1';

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+/.\-% ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && t.length < 32);
}

/** Deterministic L2-normalized embedding for one text. */
export function embedText(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vec;
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  counts.forEach((count, token) => {
    // Two independent hashes reduce collision bias (sign hashing).
    const idx = fnv1a(`i:${token}`) % EMBEDDING_DIM;
    const sign = fnv1a(`s:${token}`) % 2 === 0 ? 1 : -1;
    vec[idx] += sign * (1 + Math.log(count));
  });
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => Math.round((v / norm) * 1e6) / 1e6);
}

/** Cosine similarity (inputs assumed L2-normalized). */
export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += (a[i] ?? 0) * (b[i] ?? 0);
  return dot;
}
