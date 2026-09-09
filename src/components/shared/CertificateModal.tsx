'use client';

import React, { useRef } from 'react';
import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  QrCode,
  Satellite,
  Compass,
} from 'lucide-react';

export interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  courseTitle: string;
  courseCode: string;
  cadreTrack: string;
  scorePercentage: number;
  issueDate?: string;
  credentialId?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  recipientName,
  courseTitle,
  courseCode,
  cadreTrack,
  scorePercentage,
  issueDate = 'August 2026',
  credentialId = 'IMD-MM-2026-VERIFIED',
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in-up">
      <div className="relative my-6 w-full max-w-4xl space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-white px-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Digital Verified Credential • Mission Mausam Ledger</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <Printer className="h-4 w-4 text-[#c59b48]" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center border border-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Card Body */}
        <div
          ref={certificateRef}
          className="relative rounded-3xl border-4 border-[#c59b48] bg-gradient-to-br from-[#ffffff] via-[#fcfbf9] to-[#f7f4ed] dark:from-[#0b1e36] dark:via-[#081526] dark:to-[#050e1a] p-8 sm:p-12 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden print:m-0 print:p-8 print:border-2 print:shadow-none"
        >
          {/* Ornamental Outer Corner Accents */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#c59b48] pointer-events-none" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#c59b48] pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#c59b48] pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#c59b48] pointer-events-none" />

          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Satellite className="h-96 w-96 text-[#c59b48]" />
          </div>

          <div className="relative z-10 text-center space-y-6">
            
            {/* National Header */}
            <div className="space-y-1.5 border-b border-[#c59b48]/30 pb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0b1e36] border border-[#c59b48]/50 flex items-center justify-center text-[#c59b48] shadow-md">
                  <Satellite className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black tracking-wider uppercase text-[#0b1e36] dark:text-[#c59b48]">
                    India Meteorological Department
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Ministry of Earth Sciences, Government of India • Mission Mausam Capacity Directorate
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-[#c59b48]/15 px-4 py-1 text-[11px] font-mono font-bold tracking-widest text-[#9a7224] dark:text-[#c59b48] uppercase border border-[#c59b48]/30">
                Official Certificate of Competency Mastery
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wide text-[#0b1e36] dark:text-white">
                Certificate of Achievement
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                This is to officially certify that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="py-2">
              <div className="text-2xl sm:text-4xl font-black tracking-tight text-[#0b1e36] dark:text-[#c59b48] underline decoration-[#c59b48]/40 underline-offset-8">
                {recipientName}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                Cadre Track: <span className="font-bold text-[#0b1e36] dark:text-slate-200">{cadreTrack}</span> • Directorate of Numerical Weather Prediction & Radar
              </p>
            </div>

            {/* Course & Assessment Achievement Description */}
            <div className="max-w-2xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                has successfully completed all rigorous curriculum lecture modules, computational laboratories, and proctored technical evaluations for:
              </p>
              <div className="p-3.5 rounded-2xl bg-[#0b1e36]/5 dark:bg-white/5 border border-[#c59b48]/30 font-bold text-[#0b1e36] dark:text-white text-sm sm:text-base">
                {courseCode}: {courseTitle}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                demonstrating certified mastery with a final assessment score of{' '}
                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {scorePercentage}%
                </span>{' '}
                in compliance with WMO (World Meteorological Organization) Education & Training standards.
              </p>
            </div>

            {/* Signatures & Seal Grid */}
            <div className="pt-8 border-t border-[#c59b48]/30 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 text-center">
              
              {/* Left Signatory */}
              <div className="space-y-1">
                <div className="font-serif italic text-base font-bold text-[#0b1e36] dark:text-slate-200">
                  Prof. Vikramaditya Sen
                </div>
                <div className="h-[1px] w-36 bg-[#c59b48]/50 mx-auto" />
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Lead Faculty Modeller
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  IMD Training Institute, Pune
                </div>
              </div>

              {/* Center Seal */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#c59b48] bg-[#c59b48]/10 flex items-center justify-center text-[#c59b48] shadow-inner animate-glow-pulse">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <span className="text-[9px] font-mono font-black text-[#9a7224] dark:text-[#c59b48] uppercase tracking-wider">
                  VERIFIED SEAL • 2026
                </span>
              </div>

              {/* Right Signatory */}
              <div className="space-y-1">
                <div className="font-serif italic text-base font-bold text-[#0b1e36] dark:text-slate-200">
                  Dr. Mrutyunjay Mohapatra
                </div>
                <div className="h-[1px] w-36 bg-[#c59b48]/50 mx-auto" />
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Director General of Meteorology
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  IMD HQ, New Delhi
                </div>
              </div>
            </div>

            {/* Bottom Metadata & Verification Hash */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <div>
                Issued Date: <span className="text-slate-700 dark:text-slate-300 font-semibold">{issueDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-3 w-3" />
                <span>Credential ID: {credentialId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
