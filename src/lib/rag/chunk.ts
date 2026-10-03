// ============================================================================
// RAG chunking (Phase 3.1A): ~512 tokens (≈2000 chars) with ~50-token
// (≈200 char) overlap, split on paragraph then sentence boundaries so
// chunks keep citations clean (source + section travel with each chunk).
// ============================================================================

export interface RawChunk {
  content: string;
  section: string;
}

const CHUNK_CHARS = 2000;
const OVERLAP_CHARS = 200;

function splitSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?\n]+[.!?]+["”']?|\S[^.!?\n]*$/g);
  return (parts ?? [paragraph]).map((s) => s.trim()).filter(Boolean);
}

/** Split long text into overlapping chunks; section labels the origin. */
export function chunkText(content: string, section: string): RawChunk[] {
  const text = content.replace(/\r\n/g, '\n').trim();
  if (!text) return [];
  if (text.length <= CHUNK_CHARS) return [{ content: text, section }];

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: RawChunk[] = [];
  let current = '';
  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push({ content: trimmed, section });
    // Overlap: carry the tail forward.
    current = trimmed.slice(-OVERLAP_CHARS);
  };
  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= CHUNK_CHARS) {
      current = current ? `${current}\n\n${para}` : para;
      continue;
    }
    if (current.trim()) flush();
    if (para.length <= CHUNK_CHARS) {
      current = current ? `${current}\n\n${para}`.slice(-OVERLAP_CHARS) + '\n\n' + para : para;
      // Simpler: start fresh with overlap tail already in `current`.
      if (current.length > CHUNK_CHARS) {
        // Para itself fits but overlap pushed it over — restart clean.
        current = para;
      }
      continue;
    }
    // Oversized paragraph: sentence-pack it.
    for (const sentence of splitSentences(para)) {
      if ((current + ' ' + sentence).length > CHUNK_CHARS) flush();
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim() && (chunks.length === 0 || chunks[chunks.length - 1].content !== current.trim())) {
    chunks.push({ content: current.trim(), section });
  }
  return chunks.filter((c) => c.content.length > 0);
}
