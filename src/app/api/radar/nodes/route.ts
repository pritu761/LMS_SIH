import { NextResponse } from 'next/server';
import { ALL_38_DOPPLER_NODES, getNetworkSummary } from '@/lib/radarNetworkData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const band = searchParams.get('band');
  const region = searchParams.get('region');
  const status = searchParams.get('status');

  let nodes = [...ALL_38_DOPPLER_NODES];

  if (band && band !== 'ALL') {
    nodes = nodes.filter((n) => n.band.toLowerCase() === band.toLowerCase());
  }

  if (region && region !== 'ALL') {
    nodes = nodes.filter((n) => n.region.toLowerCase() === region.toLowerCase());
  }

  if (status && status !== 'ALL') {
    nodes = nodes.filter((n) => n.status.toLowerCase() === status.toLowerCase());
  }

  // Dynamic real-time micro-fluctuations to simulate live telemetry
  const now = new Date();
  const timeMs = now.getTime();
  const dynamicNodes = nodes.map((node, index) => {
    const cycle = (timeMs / 1000 + index * 10) % 360;
    const dynamicAzimuth = Math.floor((node.azimuthDeg + (timeMs / 50) % 360) % 360);
    const dynamicLatency = Number((node.latencyMs + (Math.sin(timeMs / 2000 + index) * 1.5)).toFixed(1));
    const dynamicReflectivity = Number((node.reflectivityDbz + Math.sin(timeMs / 3000 + index) * 0.8).toFixed(1));

    return {
      ...node,
      azimuthDeg: dynamicAzimuth,
      latencyMs: dynamicLatency,
      reflectivityDbz: dynamicReflectivity,
      lastScanTime: 'Live (0s ago)',
    };
  });

  const summary = getNetworkSummary();

  return NextResponse.json({
    success: true,
    summary,
    totalCount: dynamicNodes.length,
    nodes: dynamicNodes,
  });
}
