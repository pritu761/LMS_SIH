// ============================================================================
// Guardrails (Phase 3.1F): hourly rate limit accounting, prompt-injection
// patterns, low-confidence fallback copy. Rate state lives in the DB
// (ChatMessage timestamps) so limits hold across server instances.
// ============================================================================

/** Queries per rolling hour, per user. Configurable via env. */
export function assistantRateLimit(): number {
  const v = Number(process.env.ASSISTANT_RATE_LIMIT_PER_HOUR ?? 20);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 20;
}

/** Prompt-injection / system-override patterns → polite refusal. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /\bsystem\s+prompt\b/i,
  /you\s+are\s+now\s+(?!.*capacityconnect)/i,
  /pretend\s+(to\s+be|you(\'re| are))/i,
  /jailbreak/i,
  /\bdan\s+mode\b/i,
  /developer\s+mode/i,
  /do\s+anything\s+now/i,
  /reveal\s+(your|the)\s+(system|hidden|secret)/i,
  /override\s+(safety|policy|guardrail)/i,
];

export function containsInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(message));
}

export const INJECTION_REFUSAL =
  'I can only help with CapacityConnect training, competencies and portal guidance — I can\u2019t follow instructions that try to change my role or reveal system details. How can I help with your learning?';

export function lowConfidenceFallback(role: string): string {
  const contact = role === 'ADMIN' ? 'the governance helpdesk' : 'your portal administrator';
  return (
    `I don\u2019t have reliable information on that in the course materials I can access. ` +
    `I don\u2019t want to guess on operational or regulatory guidance — please contact ${contact}, ` +
    `or try asking about a specific module, competency, exam window or certification rule.`
  );
}
