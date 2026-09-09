// ============================================================================
// Input sanitization (Phase 3.4E): strip HTML from user-generated text
// before persistence. No-dependency allowlist-free stripper: removes
// script/style blocks, all tags, event-handler remnants and excess
// whitespace. Markdown-authored content (lessons, quizzes) is intentionally
// NOT stripped — it renders through react-markdown (safe) or is authored
// by privileged roles and validated by zod.
// ============================================================================

/** Strip all HTML markup from free-text input (notes, reasons, messages). */
export function sanitizeText(input: string, maxLength = 2000): string {
  let out = input.replace(/<script[\s\S]*?<\/script\s*>/gi, ' ');
  out = out.replace(/<style[\s\S]*?<\/style\s*>/gi, ' ');
  out = out.replace(/<\/?[a-zA-Z][^>]*>/g, ' ');
  out = out.replace(/&(?:nbsp|amp|lt|gt|quot);/gi, ' ');
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length > maxLength) out = out.slice(0, maxLength);
  return out;
}

/** Nullable variant for optional note fields (null stays null). */
export function sanitizeOptional(input: string | null | undefined, maxLength = 2000): string | null {
  if (input === null || input === undefined) return null;
  const clean = sanitizeText(input, maxLength);
  return clean.length > 0 ? clean : null;
}
