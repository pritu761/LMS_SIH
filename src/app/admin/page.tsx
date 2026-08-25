'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/shared/StatsCard';
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { initialUsers, initialAnnouncements } from '@/lib/mockData';
import {
  ShieldCheck,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Brain,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  CheckCircle,
  Activity,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const pendingUsersCount = initialUsers.filter((u) => u.status === 'PENDING').length;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'ALERT' | 'SPOTLIGHT' | 'ACHIEVEMENT' | 'GENERAL'>('SPOTLIGHT');
  const [isPinned, setIsPinned] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    initialAnnouncements.unshift({
      id: `ann-${Date.now()}`,
      title,
      content,
      type,
      isPinned,
      authorName: 'Dr. Rajeshwari Sharma (Director)',
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setContent('');
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header — Command Center Aesthetic */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                NATIONAL GOVERNANCE
              </span>
              <span className="text-xs text-slate-400">Executive Capacity Building Control Room</span>
              <span className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
                <Activity className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">All Systems Operational</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Sitewide Intelligence & Governance Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Monitor sitewide learner throughput, approve pending faculty, publish national bulletins, and run competency matching models.
            </p>
          </div>
        </div>

        {/* Sitewide KPIs */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Active Learners"
              value="25,480"
              change="14.2% MoM"
              icon={Users}
              color="indigo"
            />
            <StatsCard
              title="Course Completion"
              value="94.6%"
              change="3.1% YoY"
              icon={TrendingUp}
              color="emerald"
            />
            <StatsCard
              title="Certificates Issued"
              value="18,920"
              change="22.5% increase"
              icon={Award}
              color="cyan"
            />
            <StatsCard
              title="Pending Approvals"
              value={`${pendingUsersCount} Queue`}
              change={pendingUsersCount > 0 ? 'Requires action' : 'Clear'}
              icon={ShieldCheck}
              color="amber"
            />
          </div>
        </ScrollReveal>

        {/* Quick Navigation Action Cards */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-950 p-6 backdrop-blur-xl hover:border-amber-500/50 transition-all duration-500 group space-y-3 card-tilt hover:shadow-elevation-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:shadow-glow-amber transition-all duration-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 animate-pulse">
                  {pendingUsersCount} Pending
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                  User Approvals & RBAC Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inspect candidate credentials, assign Trainee / Trainer / Admin roles, or suspend non-compliant accounts.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/competency"
              className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/20 via-slate-900/80 to-slate-950 p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-all duration-500 group space-y-3 card-tilt hover:shadow-elevation-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                  55/30/15 Algorithm
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                  Competency Mapping Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Run automated matching algorithm to compute compatibility and rank faculty for any course.
                </p>
              </div>
            </Link>
          </div>
        </ScrollReveal>

        {/* Sitewide CMS Publisher & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Announcement Publisher */}
          <ScrollReveal animation="fade-left" delay={100}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-cyan-400" />
                </div>
                <span>Publish Ministry Directive / Bulletin</span>
              </h3>

              {publishedSuccess && (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in-up">
                  <CheckCircle className="h-4 w-4" />
                  <span>Bulletin published sitewide to all active trainee & trainer feeds!</span>
                </div>
              )}

              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bulletin Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 📢 Digital Governance Hackathon & Certification Drive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 input-glow transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Category Tag</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 input-glow transition-all"
                    >
                      <option value="SPOTLIGHT">SPOTLIGHT</option>
                      <option value="ALERT">ALERT</option>
                      <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="pin"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 accent-indigo-500"
                    />
                    <label htmlFor="pin" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Pin to top of feed
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Message Content</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Official notification details, deadlines, and circular references..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 input-glow transition-all"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-glow-md btn-shimmer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Broadcast Bulletin</span>
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>

          {/* Live Feed Preview */}
          <ScrollReveal animation="fade-right" delay={200}>
            <AnnouncementFeed />
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
