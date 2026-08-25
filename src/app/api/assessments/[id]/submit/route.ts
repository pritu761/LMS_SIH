import { NextRequest, NextResponse } from 'next/server';
import { initialAssessments, initialEnrollments } from '@/lib/mockData';
import { gradeAssessmentSubmission } from '@/services/assessmentService';
import { getCurrentUser } from '@/lib/auth';
import { submissionAnswerSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const assessment = initialAssessments.find((a) => a.id === id || a.courseId === id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = submissionAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { answers, timeSpentSeconds } = parsed.data;

    // Execute Auto-Grading Engine
    const gradingResult = gradeAssessmentSubmission(
      assessment,
      answers,
      timeSpentSeconds,
      session.userId
    );

    // If passed, update user's enrollment progress to 100% and generate certificate
    if (gradingResult.passed) {
      const enrollment = initialEnrollments.find(
        (e) => e.userId === session.userId && e.courseId === assessment.courseId
      );
      if (enrollment) {
        enrollment.status = 'COMPLETED';
        enrollment.progressPercentage = 100.0;
        enrollment.completedAt = new Date().toISOString();
        enrollment.certificateId = `CERT-${assessment.courseId.toUpperCase().replace('COURSE-', '')}-${Date.now().toString(36).toUpperCase()}`;
        enrollment.certificateUrl = `/certificates/${enrollment.certificateId}`;
      }
    }

    return NextResponse.json({
      success: true,
      result: gradingResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
