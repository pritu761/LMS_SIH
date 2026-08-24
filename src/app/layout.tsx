import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CAPACITY CONNECT | Digital Capacity Building & LMS Portal',
    template: '%s | Capacity Connect',
  },
  description:
    'National digital capacity building portal with role-based access control, proctored timed MCQ assessments, video lecture streaming, and automated 55/30/15 competency mapping intelligence.',
  keywords: [
    'Capacity Building',
    'LMS',
    'Competency Mapping',
    'Assessment Engine',
    'Civil Service Training',
    'E-Governance',
    'Digital India',
    'Smart India Hackathon',
  ],
  authors: [{ name: 'Capacity Connect Team' }],
  openGraph: {
    title: 'CAPACITY CONNECT | Digital Capacity Building & LMS Portal',
    description:
      'Sovereign digital capacity building platform with RBAC, timed proctored MCQ exams, and AI-powered competency matching.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Capacity Connect',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060911',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Production Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Capacity Connect</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  India&apos;s sovereign digital capacity building and learning management platform for public sector institutions.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Platform</h4>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li>Role-Based Access Control (RBAC)</li>
                  <li>Timed Proctored MCQ Exams</li>
                  <li>55/30/15 Competency Mapping</li>
                  <li>Lecture Video Streaming & PDF</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Technology</h4>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li>Next.js 14 App Router + TypeScript</li>
                  <li>PostgreSQL (Neon Serverless)</li>
                  <li>Prisma ORM + Edge JWT (jose)</li>
                  <li>Tailwind CSS + Lucide React</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                © {new Date().getFullYear()} Capacity Connect • National Digital Capacity Building Framework
              </span>
              <span className="text-[11px] text-slate-500">
                Smart India Hackathon 2024 • Built with 🇮🇳
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
