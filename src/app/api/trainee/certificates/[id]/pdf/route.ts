import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, requireTraineeSession } from '@/lib/api-helpers';
import { getCertificateForPdf } from '@/services/traineeService';
import { buildCertificatePdf } from '@/lib/certificate-pdf';

/**
 * GET /api/trainee/certificates/[id]/pdf
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Generates the caller's
 * certificate as a one-page PDF with holder name, module, issue date,
 * verification ID and a QR code deep-linking to /verify/[certId].
 * Unknown IDs and other users' certificates both return 404 (no existence
 * oracle). Revoked certificates render with a REVOKED banner (kept for
 * audit rather than hidden).
 *
 * @openapi
 * responses:
 *   200: application/pdf attachment (certificate-<id>.pdf)
 *   401/403/404: { success: false, error: { code, message } }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { id } = await params;
    if (!id || typeof id !== 'string') throw new ApiError(400, 'INVALID_ID', 'Certificate id is invalid.');
    const cert = await getCertificateForPdf(session.userId, id);
    if (!cert) throw new ApiError(404, 'CERTIFICATE_NOT_FOUND', 'Certificate not found.');

    const proto = request.headers.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
    const pdf = await buildCertificatePdf({
      traineeName: cert.traineeName,
      moduleTitle: cert.moduleTitle,
      trackCode: cert.trackCode,
      issuedLabel: cert.issuedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
      verificationId: cert.verificationId,
      verifyUrl: `${proto}://${host}/verify/${cert.verificationId}`,
      score: cert.score,
      grade: cert.grade,
      revoked: cert.status !== 'VALID',
    });
    const body = new Uint8Array(pdf);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${cert.verificationId}.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    return apiFail(err, 'PDF_UNAVAILABLE');
  }
}
