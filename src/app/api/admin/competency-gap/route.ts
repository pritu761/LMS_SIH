import { NextRequest, NextResponse } from 'next/server';
import { analyzeTraineeCompetencyGap, discoverTrainersByDomain } from '@/services/competencyService';
import { initialUsers, initialCadres } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || initialUsers.find((u) => u.role === 'TRAINEE')?.id || 'user-trainee-1';
    const targetCadreCode = body.targetCadreCode;

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || initialUsers.find((u) => u.role === 'TRAINEE')?.id || 'user-trainee-1';
    const targetCadreCode = searchParams.get('cadre') || undefined;

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
