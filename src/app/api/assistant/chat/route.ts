import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sanitizeText } from '@/lib/sanitize';
import { ApiError, apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import { CONFIDENCE_MIN, RETRIEVAL_TOP_K, retrieve, type CandidateDoc } from '@/lib/rag/retrieve';
import { assistantRateLimit, containsInjection, INJECTION_REFUSAL, lowConfidenceFallback } from '@/lib/rag/guardrails';
import { buildContextBlock, buildSystemPrompt, extractiveFallback, generateGrounded, llmConfigured, type LlmMessage } from '@/lib/rag/llm';
import { structuredAnswer } from '@/lib/rag/structured';

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message must not be empty.').max(2000, 'Message must be 2000 characters or fewer.'),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(10)
    .default([]),
  model: z.enum(['openai/gpt-oss-120b', 'openai/gpt-oss-20b']).optional(),
});

/**
 * POST /api/assistant/chat — authenticated (any approved role).
 *
 * Course Navigator pipeline: rate limit (20/hr) → prompt-injection screen
 * → role-aware structured intents (deterministic, cited) → hybrid
 * BM25+vector retrieval (RRF, top-5, audience-filtered) → grounded
 * generation with citations (or extractive fallback / "I don't know").
 * Both turns are persisted with retrieved sources for audit.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAssistantSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Chat payload is invalid.');
    }
    const { message: rawMessage, history } = parsed.data;
    // Strip markup from the stored/logged copy (defense in depth; the
    // retrieval copy is equivalent since only tags are removed).
    const message = sanitizeText(rawMessage);
    const role = session.role as 'TRAINEE' | 'TRAINER' | 'ADMIN';

    // Rate limit: rolling 60 minutes, persistent across instances.
    const since = new Date(Date.now() - 3600 * 1000);
    const used = await prisma.chatMessage.count({ where: { userId: session.userId, role: 'USER', createdAt: { gte: since } } });
    const limit = assistantRateLimit();
    if (used >= limit) {
      const resetAt = new Date(since.getTime() + 3600 * 1000);
      throw new ApiError(429, 'RATE_LIMITED', `Assistant limit reached (${limit} queries/hour). Try again later.`, {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetAt.getTime() / 1000)),
        'Retry-After': String(Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000))),
      });
    }

    // Prompt-injection screen.
    if (containsInjection(message)) {
      await prisma.chatMessage.create({ data: { userId: session.userId, role: 'USER', content: message, sources: [] } });
      const reply = await persistAssistant(session.userId, INJECTION_REFUSAL, []);
      return apiOk({ answer: reply.content, sources: [], confidence: 0, degraded: true, model: 'guardrail', blocked: true });
    }

    // Deterministic role-aware intents first.
    const structured = await structuredAnswer(role, session.userId, message);
    if (structured) {
      await prisma.chatMessage.create({ data: { userId: session.userId, role: 'USER', content: message, sources: [] } });
      const reply = await persistAssistant(session.userId, structured.text, structured.sources);
      return apiOk({ answer: reply.content, sources: structured.sources, confidence: 1, degraded: false, model: 'structured' });
    }

    // Hybrid retrieval over audience-filtered documents.
    // Trainees see ALL-audience chunks only; trainers/admins also see
    // governance material (STAFF audience).
    const docs = await prisma.document.findMany({ select: { id: true, content: true, embedding: true, source: true, section: true, metadata: true } });
    const candidates: CandidateDoc[] = [];
    for (const d of docs) {
      const meta = (d.metadata ?? {}) as { audience?: unknown };
      const aud = Array.isArray(meta.audience) ? (meta.audience as string[]) : ['ALL'];
      if (!aud.includes('ALL') && !aud.includes(role)) continue;
      candidates.push({ id: d.id, content: d.content, embedding: d.embedding as unknown as number[] | null, source: d.source, section: d.section });
    }
    const chunks = retrieve(message, candidates, RETRIEVAL_TOP_K);
    const topConfidence = chunks.length > 0 ? chunks[0].confidence : 0;

    await prisma.chatMessage.create({ data: { userId: session.userId, role: 'USER', content: message, sources: [] } });

    if (chunks.length === 0 || topConfidence < CONFIDENCE_MIN) {
      const fallback = lowConfidenceFallback(role);
      const reply = await persistAssistant(
        session.userId,
        fallback,
        chunks.map((c) => ({ source: c.source, section: c.section }))
      );
      return apiOk({ answer: reply.content, sources: replySources(chunks), confidence: topConfidence, degraded: true, model: 'fallback' });
    }

    const context = buildContextBlock(chunks);
    const llmHistory: LlmMessage[] = history.map((h) => ({ role: h.role, content: h.content }));
    let answer: string;
    let model: string;
    let degraded = false;
    if (llmConfigured()) {
      try {
        const out = await generateGrounded(buildSystemPrompt(role), context, llmHistory, message, parsed.data.model);
        answer = out.text;
        model = out.model;
      } catch {
        answer = extractiveFallback(chunks);
        model = 'extractive';
        degraded = true;
      }
    } else {
      answer = extractiveFallback(chunks);
      model = 'extractive';
      degraded = true;
    }
    const reply = await persistAssistant(
      session.userId,
      answer,
      chunks.map((c) => ({ source: c.source, section: c.section }))
    );
    return apiOk({ answer: reply.content, sources: replySources(chunks), confidence: topConfidence, degraded, model });
  } catch (err) {
    return apiFail(err, 'ASSISTANT_UNAVAILABLE');
  }
}

function replySources(chunks: Array<{ source: string; section: string | null }>): Array<{ source: string; section: string | null }> {
  return chunks.map((c) => ({ source: c.source, section: c.section }));
}

async function persistAssistant(
  userId: string,
  content: string,
  sources: Array<{ source: string; section: string | null }>
) {
  return prisma.chatMessage.create({
    data: { userId, role: 'ASSISTANT', content, sources: sources as unknown as object },
  });
}
