import { NextRequest, NextResponse } from 'next/server';
import { analyzeTraineeCompetencyGap, discoverTrainersByDomain } from '@/services/competencyService';
import { initialUsers, initialCadres } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

/**
 * Authorization policy: every caller must be authenticated.
 * - ADMIN / TRAINER may inspect any trainee's gap analysis.
 * - TRAINEE may only inspect their own record.
 */
function isAllowedToView(session: { userId: string; role: string }, requestedUserId: string): boolean {
  if (session.role === 'ADMIN' || session.role === 'TRAINER') return true;
  return session.userId === requestedUserId;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = body.userId || initialUsers.find((u) => u.role === 'TRAINEE')?.id || 'user-trainee-1';
    const targetCadreCode = body.targetCadreCode;

    if (!isAllowedToView(session, userId)) {
      return NextResponse.json({ error: 'Forbidden: you may only view your own competency analysis' }, { status: 403 });
    }

    const gapAnalysis = await analyzeTraineeCompetencyGap(userId, targetCadreCode);

    return NextResponse.json({
      success: true,
      analysis: gapAnalysis,
      cadres: initialCadres,
      trainees: initialUsers.filter((u) => u.role === 'TRAINEE'),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || initialUsers.find((u) => u.role === 'TRAINEE')?.id || 'user-trainee-1';
    const targetCadreCode = searchParams.get('cadre') || undefined;

    if (!isAllowedToView(session, userId)) {
      return NextResponse.json({ error: 'Forbidden: you may only view your own competency analysis' }, { status: 403 });
    }

    const gapAnalysis = await analyzeTraineeCompetencyGap(userId, targetCadreCode);

    return NextResponse.json({
      success: true,
      analysis: gapAnalysis,
      cadres: initialCadres,
      trainees: initialUsers.filter((u) => u.role === 'TRAINEE'),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
