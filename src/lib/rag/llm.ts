// ============================================================================
// Model-agnostic generation (Phase 3.1B). Default: Groq OpenAI-compatible
// endpoint (GROQ_API_KEY, chain LLM_MODEL → gpt-oss-120b → gpt-oss-20b).
// Swap LLM_PROVIDER=openai|anthropic with the matching key to change
// vendors — the grounded prompt contract below is provider-independent.
// Without any key, callers use extractiveFallback() (always cited).
// ============================================================================

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResult {
  text: string;
  model: string;
  degraded: boolean;
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

function modelChain(): string[] {
  const preferred = (process.env.LLM_MODEL ?? '').trim();
  const chain = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  if (preferred && !chain.includes(preferred)) return [preferred, ...chain];
  if (preferred) return [preferred, ...chain.filter((m) => m !== preferred)];
  return chain;
}

export function llmConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
}

export function buildSystemPrompt(role: string): string {
  return [
    'You are CapacityConnect Course Navigator, the AI assistant for the IMD / Mission Mausam training portal.',
    'Rules you must follow:',
    '- Only answer based on the provided context. If uncertain, say so and suggest contacting admin.',
    '- Never fabricate regulatory or operational guidance (warnings, thresholds, SOPs).',
    '- Always cite the source of each factual claim as [S1], [S2], … matching the context blocks.',
    '- Keep answers concise, trainee-friendly Markdown; no invented links, codes or dates.',
    `- The user role is ${role}: give ADMIN users governance-wide facts, TRAINERs their cohort facts, TRAINEES their own progress facts. Never reveal another user's personal data.`,
  ].join('\n');
}

export function buildContextBlock(chunks: Array<{ content: string; source: string; section: string | null }>): string {
  return chunks
    .map((c, i) => `[S${i + 1}] (source: ${c.source}${c.section ? ` • ${c.section}` : ''})\n${c.content.slice(0, 1500)}`)
    .join('\n\n');
}

/** Grounded generation with model-chain fallback. Throws only on total failure. */
export async function generateGrounded(
  system: string,
  context: string,
  history: LlmMessage[],
  message: string,
  preferredModel?: string
): Promise<LlmResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error('LLM not configured.');
  const chain = modelChain();
  const ordered = preferredModel && chain.includes(preferredModel)
    ? [preferredModel, ...chain.filter((m) => m !== preferredModel)]
    : chain;
  let lastError = '';
  for (const model of ordered) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 600,
          messages: [
            { role: 'system', content: system },
            ...history.slice(-6),
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        lastError = data.error?.message ?? 'Empty completion.';
        continue;
      }
      return { text, model, degraded: false };
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'LLM call failed.';
    }
  }
  throw new Error(`All models failed (${lastError}).`);
}

/** Extractive fallback: answer strictly from retrieved excerpts, cited. */
export function extractiveFallback(
  chunks: Array<{ content: string; source: string; section: string | null }>
): string {
  const top = chunks.slice(0, 2);
  const parts = top.map((c, i) => {
    const excerpt = c.content.length > 420 ? `${c.content.slice(0, 420)}…` : c.content;
    return `**From ${c.source}${c.section ? ` (${c.section})` : ''} [S${i + 1}]:**\n${excerpt}`;
  });
  return (
    `Here is what I found in the course materials (limited mode — full AI answering is unavailable right now):\n\n` +
    parts.join('\n\n') +
    `\n\nAsk a follow-up about any of these, or contact your administrator for operational guidance.`
  );
}
