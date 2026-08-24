import { NextRequest, NextResponse } from 'next/server';
import { initialAssessments } from '@/lib/mockData';
import { sanitizeAssessmentForTrainee } from '@/services/assessmentService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const assessment = initialAssessments.find((a) => a.id === id || a.courseId === id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Sanitize quiz data: strip correctOption and explanations
    const sanitizedQuiz = sanitizeAssessmentForTrainee(assessment);

    return NextResponse.json({
      success: true,
      quiz: sanitizedQuiz,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
