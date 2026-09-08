import { NextRequest, NextResponse } from 'next/server';
import { generateCourseChatResponse } from '@/lib/courseChatEngine';
import { searchCourses, getAllCourses } from '@/services/courseSearchService';
import { isGroqEnabled, generateGroqAnswer } from '@/lib/groq';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], model: requestedModel } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "message" string is required.' },
        { status: 400 }
      );
    }

    // Optional caller-preferred Groq model (validated against allow-list)
    const MODEL_ALLOW_LIST = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    const preferredModel =
      typeof requestedModel === 'string' && MODEL_ALLOW_LIST.includes(requestedModel)
        ? requestedModel
        : undefined;

    // Optional user session for personalized greeting or context
    const session = await getCurrentUser().catch(() => null);
    const userRole = session?.role || 'TRAINEE';

    // Generate intelligent response using our Course NLP Chat Engine
    const response = await generateCourseChatResponse(message, history, userRole);

    // Groq LLM fallback: for open-ended questions the rules can't cover,
    // answer with a free Groq model grounded in the live catalog.
    let reply = response.reply;
    let matchedCourses = response.matchedCourses;
    let intent = response.intent;
    let source: 'rules' | 'groq' = 'rules';
    let groqModel: string | undefined;

    if (response.intent === 'FALLBACK_SEARCH' && isGroqEnabled()) {
      try {
        const catalog = await getAllCourses();
        const searchHits = await searchCourses({ query: message });
        const grounded = searchHits.length > 0 ? searchHits.map((r) => r.course) : catalog;
        const { reply: groqReply, model } = await generateGroqAnswer(message, history, catalog, preferredModel);
        reply = groqReply;
        matchedCourses = grounded.slice(0, 3);
        intent = 'GROQ_ANSWER';
        source = 'groq';
        groqModel = model;
      } catch (err) {
        console.warn('[chat] Groq fallback failed, using rule-engine reply:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        matchedCourses,
        suggestedQueries: response.suggestedQueries,
        intent,
        source,
        model: groqModel,
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
