import { NextRequest, NextResponse } from 'next/server';
import { searchCourses, getAllCourses } from '@/services/courseSearchService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Course catalog data is part of the protected LMS — require login.
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const cadreTrack = searchParams.get('cadreTrack') || undefined;
    const category = searchParams.get('category') || undefined;
    const maxDurationParam = searchParams.get('maxDuration');
    const maxDuration = maxDurationParam ? parseFloat(maxDurationParam) : undefined;

    const results = await searchCourses({
      query,
      cadreTrack,
      category,
      maxDuration,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in /api/courses/search route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error while searching courses.' },
      { status: 500 }
    );
  }
}
