import { NextRequest, NextResponse } from 'next/server';
import { generateCourseChatResponse } from '@/lib/courseChatEngine';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "message" string is required.' },
        { status: 400 }
      );
    }

    // Optional user session for personalized greeting or context
    const session = await getCurrentUser().catch(() => null);
    const userRole = session?.role || 'TRAINEE';

    // Generate intelligent response using our Course NLP Chat Engine
    const response = await generateCourseChatResponse(message, history, userRole);

    return NextResponse.json({
      success: true,
      data: {
        reply: response.reply,
        matchedCourses: response.matchedCourses,
        suggestedQueries: response.suggestedQueries,
        intent: response.intent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error while generating chat response.',
      },
      { status: 500 }
    );
  }
}
