import { NextRequest, NextResponse } from 'next/server';
import { matchTrainersForCourse } from '@/services/competencyService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Trainer authorization required' }, { status: 403 });
    }

    const body = await request.json();
    const courseId = body.courseId || 'course-cloud-101';
    const candidateTrainerIds = body.candidateTrainerIds;

    const matchAnalysis = await matchTrainersForCourse(courseId, candidateTrainerIds);

    return NextResponse.json({
      success: true,
      analysis: matchAnalysis,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
