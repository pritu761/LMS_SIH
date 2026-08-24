import { NextRequest, NextResponse } from 'next/server';
import { initialFeedbacks, initialUsers } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { feedbackSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = parsed.data;
    const user = initialUsers.find((u) => u.id === session.userId);

    const newFeedback = {
      id: `fb-${Date.now()}`,
      courseId,
      userId: session.userId,
      userName: user?.profile.fullName || session.fullName || 'Trainee',
      userRole: user?.profile.headline || 'Civil Service Trainee',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    initialFeedbacks.unshift(newFeedback);

    return NextResponse.json({
      success: true,
      message: 'Review and rating submitted successfully!',
      feedback: newFeedback,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
