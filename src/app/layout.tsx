import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { BackToTop } from '@/components/shared/BackToTop';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider } from '@/context/ChatContext';
import { CourseChatbot } from '@/components/chat/CourseChatbot';

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
      <body className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans antialiased selection:bg-[#e0234e] selection:text-white" suppressHydrationWarning>
        <ThemeProvider>
          <ChatProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>

            {/* Rich NestJS-style Global Footer */}
            <footer className="w-full border-t border-white/10 bg-[#040102] py-16 px-4 sm:px-6 lg:px-8 mt-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                
                {/* Col 1: Brand & Gov Info (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[#e0234e] flex items-center justify-center text-white shadow-md shadow-[#e0234e]/40">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <span className="font-black text-lg tracking-tight text-white">
                      Capacity<span className="text-[#e0234e]">Connect</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    Sovereign meteorological competency assessment, cadre mapping, and faculty allocation platform built for the India Meteorological Department (IMD) and Ministry of Earth Sciences (MoES).
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>All 38 Doppler Radar Nodes Online</span>
                  </div>
                </div>

                {/* Col 2: Documentation */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-white">Documentation</div>
                  <ul className="space-y-2 text-slate-400">
                    <li><a href="/admin/competency" className="hover:text-white transition-colors">55/30/15 Algorithm</a></li>
                    <li><a href="/trainee/courses" className="hover:text-white transition-colors">Cadre Curricula</a></li>
                    <li><a href="/admin/reports" className="hover:text-white transition-colors">WMO RTC Rubrics</a></li>
                    <li><a href="/admin/batches" className="hover:text-white transition-colors">Batch Directives</a></li>
                  </ul>
                </div>

                {/* Col 3: Ecosystem */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-white">Ecosystem</div>
                  <ul className="space-y-2 text-slate-400">
                    <li><a href="/admin/competency" className="hover:text-white transition-colors">Capacity Observe</a></li>
                    <li><a href="/admin/competency" className="hover:text-white transition-colors">Competency DevTools</a></li>
                    <li><a href="/admin/batches" className="hover:text-white transition-colors">Deploy & Orchestrate</a></li>
                    <li><a href="/trainee/courses" className="hover:text-white transition-colors">IMD Masterclass</a></li>
                  </ul>
                </div>

                {/* Col 4: Institutional Links */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-white">Governance</div>
                  <ul className="space-y-2 text-slate-400">
                    <li><a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">IMD Official</a></li>
                    <li><a href="https://moes.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">MoES Portal</a></li>
                    <li><a href="https://www.tropmet.res.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">IITM Pune</a></li>
                    <li><a href="https://ncmrwf.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">NCMRWF HPC</a></li>
                  </ul>
                </div>
              </div>

              <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
                <div>© 2026 Ministry of Earth Sciences & India Meteorological Department. Built with NestJS Architecture.</div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Smart India Hackathon</span>
                  <span className="flex items-center gap-1">Built for India 🇮🇳</span>
                </div>
              </div>
            </footer>

            <BackToTop />
            <CourseChatbot />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
