/**
 * Capacity Connect — Groq (free-tier) LLM integration for MausamBot.
 *
 * Uses Groq's OpenAI-compatible Chat Completions API with free models.
 * No SDK dependency — plain fetch. Get a free key at https://console.groq.com
 * and set GROQ_API_KEY in .env (server-side only, never NEXT_PUBLIC_).
 *
 * Strategy: the deterministic rule engine (courseChatEngine) answers first.
 * Groq is used as the intelligent fallback for open-ended questions the
 * rules can't cover, grounded with a live catalog snapshot so it never
 * hallucinates course codes, durations, or exam patterns.
 */

import type { MockCourse } from '@/lib/mockData';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Free-tier models, ordered by preference. If the primary is unavailable
// (rate limit / decommission), we automatically try the next.
// (IDs verified against https://api.groq.com/openai/v1/models.)
const MODEL_CHAIN = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export const GROQ_MODEL_LABELS: Record<string, string> = {
  'openai/gpt-oss-120b': 'GPT-OSS 120B',
  'openai/gpt-oss-20b': 'GPT-OSS 20B',
};

export function isGroqEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Compact catalog snapshot injected into the system prompt for grounding. */
export function buildCatalogContext(courses: MockCourse[]): string {
  return courses
    .map((c) => {
      const mats = (c.materials || [])
        .map((m) => `    - [${m.type}] ${m.title}`)
        .join('\n');
      return `- [${c.code}] ${c.title} (${c.cadreTrack} track, ${c.level}, ${c.durationHours}h, faculty: ${c.trainerName} ${c.trainerRating}/5)\n  ${c.description}\n${mats}`;
    })
    .join('\n');
}

const BASE_SYSTEM_PROMPT = `You are MausamBot, the AI Course Navigator for Capacity Connect — the Indian Meteorological Department (IMD) & Ministry of Earth Sciences (MoES) digital training portal for Mission Mausam.

PERSONA
- Warm, precise, mission-flavoured tone. Start replies with one relevant emoji header like the examples.
- Audience: IMD scientists, forecasters, Met officers, trainees (DRSTC/FTC/IMTC/Modular cadres).
- Format answers in the same Markdown style as the portal: **bold** key terms, short bullets, ⏱️/📝/🎓/📡 emojis sparingly.

GROUND TRUTH (authoritative — never contradict)
- 4 cadre tracks: DRSTC (inductee Scientists-B, NWP/HPC), FTC (in-service forecasters, Doppler radar & nowcasting), IMTC (Met officers/observers foundation, synoptic + INSAT-3DS), MODULAR (short AI/HPC masterclasses).
- All exams: proctored timed MCQs, passing score 70%, up to 3 attempts; certificates are NISG & MoES accredited with QR verification, free for govt personnel.
- Platform is self-paced (no batches), English medium, PDF handbooks downloadable, videos stream online.
- Competency engine rule: 55% assessments + 30% course progress + 15% faculty validation.
- WMO BIP-M (WMO-258) aligned curricula.

CATALOG (live snapshot — only recommend THESE modules, with exact codes)
{CATALOG}

RULES
- Recommend only courses from CATALOG above. If asked for something not covered, say so and suggest the closest catalog module.
- Keep replies under ~220 words unless a syllabus/exam breakdown is explicitly requested.
- Never invent course codes, durations, faculty names, fees, or deadlines.
- For weather-concept questions, give a crisp 2-4 line explainer then point to the most relevant catalog module.
- If asked about login/roles/progress, describe: Sign In top-right with gov ID; roles ADMIN (DG IMD), TRAINER (faculty), TRAINEE (scientists/forecasters); progress on the Trainee dashboard.`;

async function callGroq(
  model: string,
  messages: GroqChatMessage[],
  timeoutMs = 20000
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 900,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Groq ${model} HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error(`Groq ${model} returned empty content`);
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export interface GroqAnswer {
  reply: string;
  model: string;
}

/**
 * Answer an open-ended trainee question with Groq, grounded in the catalog.
 * Tries each model in MODEL_CHAIN (or a caller-preferred model first);
 * throws only if all fail (caller falls back to the rule-engine reply).
 */
export async function generateGroqAnswer(
  userQuery: string,
  history: Array<{ role: string; content: string }> = [],
  courses: MockCourse[] = [],
  preferredModel?: string
): Promise<GroqAnswer> {
  const system = BASE_SYSTEM_PROMPT.replace('{CATALOG}', buildCatalogContext(courses) || '(catalog unavailable)');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: system },
    ...history.slice(-8).map((h) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.content.slice(0, 1500),
    })),
    { role: 'user', content: userQuery.slice(0, 1500) },
  ];

  let lastError: unknown = null;
  const chain = preferredModel
    ? [preferredModel, ...MODEL_CHAIN.filter((m) => m !== preferredModel)]
    : MODEL_CHAIN;
  for (const model of chain) {
    try {
      const reply = await callGroq(model, messages);
      return { reply, model };
    } catch (err) {
      console.warn(`[groq] model ${model} failed, trying next:`, err);
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All Groq models failed');
}
