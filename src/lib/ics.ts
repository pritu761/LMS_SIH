// ============================================================================
// Minimal RFC 5545 (iCalendar) builder — no dependency needed for schedule
// export. All times are emitted in UTC (floating local times would break
// cross-device calendar imports for pan-India cohorts).
// ============================================================================

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string | null;
  start: Date;
  end: Date | null;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format as UTC basic format: 20260915T040000Z */
export function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escape TEXT values per RFC 5545 (§3.3.11). */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets (CRLF + single space continuation). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join('\r\n');
}

export function buildIcsCalendar(events: IcsEvent[], prodId = '-//CapacityConnect//IMD Trainee Schedule//EN'): string {
  const stamp = toIcsDate(new Date());
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${prodId}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of events) {
    const end = e.end && e.end > e.start ? e.end : new Date(e.start.getTime() + 60 * 60 * 1000);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}@capacityconnect`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${toIcsDate(e.start)}`);
    lines.push(`DTEND:${toIcsDate(end)}`);
    lines.push(`SUMMARY:${escapeIcsText(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeIcsText(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeIcsText(e.location)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
