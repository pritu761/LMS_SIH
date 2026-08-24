import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  try {
    // Attempt a lightweight SQL query to test connectivity
    const result: any = await prisma.$queryRaw`SELECT 1 as connected, NOW() as server_time`;
    const latencyMs = Date.now() - startTime;

    // Fetch quick table counts if connected
    const userCount = await prisma.user.count().catch(() => 0);
    const courseCount = await prisma.course.count().catch(() => 0);
    const assessmentCount = await prisma.assessment.count().catch(() => 0);

    return NextResponse.json({
      status: 'HEALTHY',
      database: 'PostgreSQL (Neon / Serverless Pooler)',
      connected: true,
      latencyMs: `${latencyMs}ms`,
      serverTime: result[0]?.server_time || new Date().toISOString(),
      counts: {
        users: userCount,
        courses: courseCount,
        assessments: assessmentCount,
      },
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        status: 'OFFLINE_OR_FALLBACK',
        connected: false,
        latencyMs: `${latencyMs}ms`,
        error: error.message,
        hint: 'Database is not currently reachable with the specified DATABASE_URL in .env. Portal is operating in high-fidelity Mock/Memory repository mode.',
      },
      { status: 503 }
    );
  }
}
