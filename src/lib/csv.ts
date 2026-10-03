// ============================================================================
// Minimal RFC 4180 CSV parser/serializer (no dependency). Handles quoted
// fields, embedded commas/newlines and doubled quotes. Used by the trainer
// question-bank import and (later) admin bulk operations.
// ============================================================================

/** Parse CSV text into rows of fields. Throws on unbalanced quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += ch;
        i += 1;
      }
    } else if (ch === '"') {
      inQuotes = true;
      i += 1;
    } else if (ch === ',') {
      pushField();
      i += 1;
    } else if (ch === '\r') {
      i += 1;
    } else if (ch === '\n') {
      pushField();
      pushRow();
      i += 1;
    } else {
      field += ch;
      i += 1;
    }
  }
  if (inQuotes) throw new Error('Unbalanced quotes in CSV.');
  pushField();
  // Drop a single trailing empty row from the final newline.
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 1 && last[0] === '') rows.pop();
  } else if (row.length > 1 || row[0] !== '') {
    rows.push(row);
  } else if (row.length > 0) {
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

function escapeCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Serialize header + rows to CSV text. */
export function toCsv(header: string[], rows: string[][]): string {
  const lines = [header.map(escapeCell).join(',')];
  for (const r of rows) lines.push(r.map(escapeCell).join(','));
  return lines.join('\r\n') + '\r\n';
}
