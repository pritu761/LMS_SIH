import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { BackToTop } from '@/components/shared/BackToTop';
import { ThemeProvider } from '@/context/ThemeContext';

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
      <body className="min-h-screen bg-black text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-black" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>

          {/* BridgeMind-inspired Minimalist Footer */}
          <footer className="relative border-t border-white/10 bg-black/90 backdrop-blur-2xl">
            {/* Subtle electric separator */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                <div className="sm:col-span-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-amber-500 p-[1.5px]">
                      <div className="h-full w-full rounded-[6px] bg-black flex items-center justify-center">
                        <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      </div>
                    </div>
                    <span className="font-black text-sm text-white">CAPACITY<span className="text-emerald-400">CONNECT</span></span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    India&apos;s sovereign digital capacity building and learning management platform for public sector institutions.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Platform</h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li className="hover:text-slate-200 transition-colors cursor-default">Role-Based Access Control (RBAC)</li>
                    <li className="hover:text-slate-200 transition-colors cursor-default">Timed Proctored MCQ Exams</li>
                    <li className="hover:text-slate-200 transition-colors cursor-default">55/30/15 Competency Mapping</li>
                    <li className="hover:text-slate-200 transition-colors cursor-default">Lecture Video Streaming & PDF</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Compliance</h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                      NISG Accredited
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                      MeitY Framework Aligned
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                      Digital India Standards
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                      AES-256 Data Encryption
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Stack & Architecture</h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">Next.js 16</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">Framer Motion</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">PostgreSQL</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">Tailwind CSS</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">Edge JWT</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Smart India Hackathon • Problem Statement #1734</p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  © {new Date().getFullYear()} Capacity Connect • National Digital Capacity Building Framework
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  Smart India Hackathon • Built for India
                  <span className="text-base">🇮🇳</span>
                </span>
              </div>
            </div>
          </footer>

          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
