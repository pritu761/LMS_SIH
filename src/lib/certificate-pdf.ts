import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

// ============================================================================
// Certificate PDF generator (Phase 1.3E). Server-side only (pdf-lib + qrcode
// are Node-safe). Layout: A4 portrait, navy masthead, gold rules, holder
// name, module, issue date, score/grade, verification ID and a QR code that
// deep-links to the public /verify/[certId] page.
// ============================================================================

export interface CertificatePdfInput {
  traineeName: string;
  moduleTitle: string;
  trackCode: string | null;
  issuedLabel: string;
  verificationId: string;
  verifyUrl: string;
  score: number | null;
  grade: string | null;
  revoked: boolean;
}

const NAVY = rgb(0.043, 0.118, 0.212);
const GOLD = rgb(0.773, 0.608, 0.282);
const SLATE = rgb(0.28, 0.33, 0.41);
const ROSE = rgb(0.75, 0.16, 0.24);

function centerX(font: { widthOfTextAtSize: (t: string, s: number) => number }, text: string, size: number, pageWidth: number): number {
  return (pageWidth - font.widthOfTextAtSize(text, size)) / 2;
}

function fitText(
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  text: string,
  size: number,
  maxWidth: number
): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 4 && font.widthOfTextAtSize(`${out}…`, size) > maxWidth) out = out.slice(0, -1);
  return `${out}…`;
}

/**
 * Build a one-page certificate PDF. Throws on generation failure (caller
 * maps to a 500 with no internals leaked).
 */
export async function buildCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  // Masthead
  page.drawRectangle({ x: 0, y: 741, width, height: 101, color: NAVY });
  page.drawRectangle({ x: 0, y: 738, width, height: 3, color: GOLD });
  const org = 'INDIA METEOROLOGICAL DEPARTMENT • MISSION MAUSAM';
  page.drawText(fitText(helvBold, org, 11, width - 80), {
    x: centerX(helvBold, fitText(helvBold, org, 11, width - 80), 11, width),
    y: 792,
    size: 11,
    font: helvBold,
    color: GOLD,
  });
  page.drawText('CapacityConnect', {
    x: centerX(helv, 'CapacityConnect', 10, width),
    y: 774,
    size: 10,
    font: helv,
    color: rgb(1, 1, 1),
  });

  let y = 690;
  const title = 'Certificate of Completion';
  page.drawText(title, { x: centerX(helvBold, title, 26, width), y, size: 26, font: helvBold, color: NAVY });
  y -= 22;
  const sub = input.revoked ? 'CREDENTIAL REVOKED — retained for audit' : 'This credential certifies that';
  page.drawText(sub, {
    x: centerX(helv, sub, 11, width),
    y,
    size: 11,
    font: helv,
    color: input.revoked ? ROSE : SLATE,
  });

  // Holder name
  y -= 52;
  const name = fitText(helvBold, input.traineeName, 30, width - 100);
  page.drawText(name, { x: centerX(helvBold, name, 30, width), y, size: 30, font: helvBold, color: NAVY });
  y -= 8;
  page.drawLine({ start: { x: 90, y }, end: { x: width - 90, y }, thickness: 1.5, color: GOLD });

  // Module
  y -= 44;
  page.drawText('has successfully completed', {
    x: centerX(helv, 'has successfully completed', 11, width),
    y,
    size: 11,
    font: helv,
    color: SLATE,
  });
  y -= 30;
  const mod = fitText(helvBold, input.moduleTitle, 17, width - 100);
  page.drawText(mod, { x: centerX(helvBold, mod, 17, width), y, size: 17, font: helvBold, color: NAVY });

  y -= 26;
  const meta: string[] = [];
  if (input.trackCode) meta.push(`Track ${input.trackCode}`);
  meta.push(`Issued ${input.issuedLabel}`);
  if (input.score !== null) meta.push(`Score ${input.score}`);
  if (input.grade) meta.push(`Grade ${input.grade}`);
  const metaLine = meta.join('  •  ');
  page.drawText(fitText(helv, metaLine, 11, width - 100), {
    x: centerX(helv, fitText(helv, metaLine, 11, width - 100), 11, width),
    y,
    size: 11,
    font: helv,
    color: SLATE,
  });

  // Verification ID + QR
  y -= 60;
  page.drawText('Verification ID', { x: centerX(helvBold, 'Verification ID', 10, width), y, size: 10, font: helvBold, color: NAVY });
  y -= 18;
  page.drawText(input.verificationId, {
    x: centerX(mono, input.verificationId, 10, width),
    y,
    size: 10,
    font: mono,
    color: SLATE,
  });

  const qrDataUrl = await QRCode.toDataURL(input.verifyUrl, { width: 240, margin: 1 });
  const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qr = await doc.embedPng(qrBytes);
  const qrSize = 130;
  page.drawImage(qr, { x: (width - qrSize) / 2, y: y - qrSize - 18, width: qrSize, height: qrSize });
  const scanY = y - qrSize - 34;
  page.drawText('Scan to verify at CapacityConnect', {
    x: centerX(helv, 'Scan to verify at CapacityConnect', 9, width),
    y: scanY,
    size: 9,
    font: helv,
    color: SLATE,
  });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 46, color: NAVY });
  const foot = 'Issued by CapacityConnect • India Meteorological Department • Ministry of Earth Sciences';
  page.drawText(fitText(helv, foot, 8, width - 60), {
    x: centerX(helv, fitText(helv, foot, 8, width - 60), 8, width),
    y: 19,
    size: 8,
    font: helv,
    color: rgb(0.85, 0.85, 0.85),
  });

  return doc.save();
}
