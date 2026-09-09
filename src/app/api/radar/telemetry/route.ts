import { NextResponse } from 'next/server';
import { runNodeDiagnostics, ALL_38_DOPPLER_NODES } from '@/lib/radarNetworkData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nodeId, testType } = body;

    const targetId = nodeId || ALL_38_DOPPLER_NODES[0].id;
    const testName = testType || 'Full-Polarimetric Dual-Pol Pulse Calibration';

    const result = runNodeDiagnostics(targetId, testName);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process radar diagnostic request' },
      { status: 400 }
    );
  }
}
