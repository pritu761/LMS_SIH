import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { BackToTop } from '@/components/shared/BackToTop';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider } from '@/context/ChatContext';
import { CourseChatbot } from '@/components/chat/CourseChatbot';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
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
  themeColor: '#0b1e36',
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${jakarta.variable} ${outfit.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-[#070f1a] dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#0b1e36] selection:text-[#c59b48] transition-colors duration-300" suppressHydrationWarning>
        <div className="watermark-bg" suppressHydrationWarning />
        <ThemeProvider>
          <ChatProvider>
            <Navbar />
            <main className="flex-1 flex flex-col relative z-10" suppressHydrationWarning>{children}</main>

            {/* Sovereign Navy & Gold Global Footer with Wave & Gold Trim */}
            <footer className="w-full mt-auto relative overflow-hidden bg-[#0b1e36] text-white border-t-2 border-[#c59b48]" suppressHydrationWarning>
              {/* Subtle top gold accent glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48] to-transparent opacity-80" />
              
              <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 relative z-10">
                
                {/* Col 1: Brand & Gov Info (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#122c4d] border border-[#c59b48]/40 flex items-center justify-center text-[#c59b48] shadow-lg shadow-[#08172a]/50">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <span className="font-black text-xl tracking-tight text-white">
                      CAPACITY<span className="text-[#c59b48] ml-1">CONNECT</span>
                    </span>
                  </div>
                  <div className="text-xs text-[#c59b48] font-semibold tracking-wide">
                    Empowering People. Strengthening Competencies. Building a Future-Ready Workforce.
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                    Sovereign meteorological competency assessment, cadre mapping, and faculty allocation platform built for the India Meteorological Department (IMD) and Ministry of Earth Sciences (MoES).
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>All 38 Doppler Radar Nodes Online • WMO Compliance Ready</span>
                  </div>
                </div>

                {/* Col 2: Problem & Algorithms */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-[#c59b48]">Core Engine</div>
                  <ul className="space-y-2 text-slate-300">
                    <li><Link href="/admin/competency" className="hover:text-[#c59b48] transition-colors">55/30/15 Allocation Algorithm</Link></li>
                    <li><Link href="/trainee/courses" className="hover:text-[#c59b48] transition-colors">Cadre Curricula & Tracks</Link></li>
                    <li><Link href="/admin/competency" className="hover:text-[#c59b48] transition-colors">WMO RTC Rubrics</Link></li>
                    <li><Link href="/trainee/profile" className="hover:text-[#c59b48] transition-colors">Competency Gap Dossier</Link></li>
                  </ul>
                </div>

                {/* Col 3: Architecture Deep Dive */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-[#c59b48]">Technical Specs</div>
                  <ul className="space-y-2 text-slate-300">
                    <li><Link href="/architecture" className="hover:text-[#c59b48] font-semibold text-[#c59b48] transition-colors">Technical Architecture</Link></li>
                    <li><Link href="/architecture#ioc" className="hover:text-[#c59b48] transition-colors">Inversion of Control (IoC)</Link></li>
                    <li><Link href="/architecture#dtos" className="hover:text-[#c59b48] transition-colors">TypeScript DTOs & Schemas</Link></li>
                    <li><Link href="/architecture#hpc" className="hover:text-[#c59b48] transition-colors">HPC Parallelism Sandbox</Link></li>
                  </ul>
                </div>

                {/* Col 4: Institutional Links */}
                <div className="space-y-3 text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider text-[#c59b48]">Governance</div>
                  <ul className="space-y-2 text-slate-300">
                    <li><a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#c59b48] transition-colors">IMD Official (mausam.imd.gov.in)</a></li>
                    <li><a href="https://moes.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#c59b48] transition-colors">Ministry of Earth Sciences (MoES)</a></li>
                    <li><a href="https://www.tropmet.res.in" target="_blank" rel="noreferrer" className="hover:text-[#c59b48] transition-colors">IITM Pune</a></li>
                    <li><a href="https://ncmrwf.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#c59b48] transition-colors">NCMRWF HPC Center</a></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright & Gov Note */}
              <div className="border-t border-white/10 bg-[#08172a] py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
                  <div>© 2026 CapacityConnect • Smart India Hackathon (SIH) • Ministry of Earth Sciences & IMD</div>
                  <div className="text-[#c59b48]">Built with Inversion of Control, Type-Safe DTOs & WMO Rubrics</div>
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
