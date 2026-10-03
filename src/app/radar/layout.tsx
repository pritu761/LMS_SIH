import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Weather Radar & Doppler Precipitation Nowcasting | LMS_SIH',
  description:
    'Interactive real-time Doppler weather radar feeds, past frame playback, forward nowcasting projections, Marshall-Palmer dBZ reflectivity analysis, and 7-day synoptic forecasts for India and global regions.',
  keywords: [
    'Weather Radar',
    'Doppler Radar',
    'Precipitation Nowcasting',
    'RainViewer',
    'Open-Meteo',
    'IMD Doppler Radar Network',
    'Mission Mausam',
    'dBZ Reflectivity',
    'Convective Storm Risk',
    'Live Weather Map',
  ],
  openGraph: {
    title: 'Live Weather Radar & Doppler Precipitation Nowcasting | LMS_SIH',
    description:
      'Explore live Doppler weather radar overlays, frame playback, storm severity indices, hourly nowcasts, and 7-day forecasts.',
    type: 'website',
  },
};

export default function RadarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full">{children}</div>;
}
