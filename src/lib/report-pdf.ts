import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ============================================================================
// Generic tabular report PDF (Phase 1.5E). One renderer serves all six
// pre-built admin reports: title band, meta line, auto-paginated table,
// footer with page numbers. Server-side only.
// ============================================================================

export interface ReportPdfInput {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
  generatedAt: string;
}

const NAVY = rgb(0.043, 0.118, 0.212);
const GOLD = rgb(0.773, 0.608, 0.282);
const SLATE = rgb(0.28, 0.33, 0.41);
const HEADER_BG = rgb(0.93, 0.94, 0.96);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 44;
const ROW_H = 17;
const HEADER_Y = 770;
const FOOTER_Y = 34;

function fit(font: { widthOfTextAtSize: (t: string, s: number) => number }, text: string, size: number, max: number): string {
  if (font.widthOfTextAtSize(text, size) <= max) return text;
  let out = text;
  while (out.length > 4 && font.widthOfTextAtSize(`${out}…`, size) > max) out = out.slice(0, -1);
  return `${out}…`;
}

/** Build a paginated table PDF. Throws on generation failure. */
export async function buildReportPdf(input: ReportPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const usable = PAGE_W - MARGIN * 2;
  const colCount = Math.max(1, input.columns.length);
  // First column gets more room; the rest share evenly.
  const firstW = Math.min(usable * 0.4, 190);
  const restW = (usable - firstW) / Math.max(1, colCount - 1);
  const widths = input.columns.map((_, i) => (i === 0 ? firstW : restW));

  const rowsPerPage = Math.floor((HEADER_Y - 120 - FOOTER_Y - 30) / ROW_H);
  const totalPages = Math.max(1, Math.ceil(input.rows.length / rowsPerPage));

  for (let p = 0; p < totalPages; p++) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    // Masthead
    page.drawRectangle({ x: 0, y: PAGE_H - 64, width: PAGE_W, height: 64, color: NAVY });
    page.drawRectangle({ x: 0, y: PAGE_H - 67, width: PAGE_W, height: 3, color: GOLD });
    const title = fit(helvBold, input.title, 14, usable);
    page.drawText(title, { x: MARGIN, y: PAGE_H - 34, size: 14, font: helvBold, color: rgb(1, 1, 1) });
    page.drawText('CapacityConnect • IMD • Mission Mausam', { x: MARGIN, y: PAGE_H - 50, size: 8, font: helv, color: GOLD });

    let y = HEADER_Y;
    page.drawText(`Generated ${new Date(input.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST • Page ${p + 1}/${totalPages}`, {
      x: MARGIN,
      y,
      size: 8,
      font: helv,
      color: SLATE,
    });
    y -= 8;
    if (input.note && p === 0) {
      const note = fit(helv, input.note, 8, usable);
      page.drawText(note, { x: MARGIN, y, size: 8, font: helv, color: SLATE });
      y -= 12;
    }
    y -= 6;

    // Header row
    page.drawRectangle({ x: MARGIN, y: y - ROW_H + 4, width: usable, height: ROW_H, color: HEADER_BG });
    let x = MARGIN + 4;
    input.columns.forEach((c, i) => {
      page.drawText(fit(helvBold, c.toUpperCase(), 7.5, widths[i] - 8), { x, y: y - 9, size: 7.5, font: helvBold, color: NAVY });
      x += widths[i];
    });
    y -= ROW_H;

    // Body rows
    const slice = input.rows.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    slice.forEach((row, ri) => {
      if ((p * rowsPerPage + ri) % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - ROW_H + 4, width: usable, height: ROW_H, color: rgb(0.965, 0.968, 0.972) });
      }
      let cx = MARGIN + 4;
      row.forEach((cell, i) => {
        page.drawText(fit(helv, cell, 7.5, (widths[i] ?? restW) - 8), { x: cx, y: y - 9, size: 7.5, font: helv, color: SLATE });
        cx += widths[i] ?? restW;
      });
      y -= ROW_H;
    });

    page.drawText(`CapacityConnect governance report • ${input.rows.length} row(s)`, {
      x: MARGIN,
      y: FOOTER_Y,
      size: 7.5,
      font: helv,
      color: SLATE,
    });
  }

  return doc.save();
}
