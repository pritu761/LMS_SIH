'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialAnnouncements } from '@/lib/mockData';
import { MotionSection } from '@/components/shared/MotionPrimitives';
import {
  FileText,
  Megaphone,
  Pin,
  AlertTriangle,
  Sparkles,
  Trophy,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  Filter,
  Eye,
  Send,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  X,
} from 'lucide-react';

export default function AdminCmsPage() {
  const [announcements, setAnnouncements] = useState([...initialAnnouncements]);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SPOTLIGHT' | 'ALERT' | 'ACHIEVEMENT' | 'GENERAL' | 'PINNED'>('ALL');
  
  // New announcement modal / composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'SPOTLIGHT' | 'ALERT' | 'ACHIEVEMENT' | 'GENERAL'>('SPOTLIGHT');
  const [isPinned, setIsPinned] = useState(false);
  const [authorName, setAuthorName] = useState('Dr. Rajeshwari Sharma (Director)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenComposer = (ann?: typeof initialAnnouncements[0]) => {
    if (ann) {
      setEditingId(ann.id);
      setTitle(ann.title);
      setContent(ann.content);
      setType(ann.type);
      setIsPinned(ann.isPinned);
      setAuthorName(ann.authorName);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setType('SPOTLIGHT');
      setIsPinned(false);
      setAuthorName('Dr. Rajeshwari Sharma (Director)');
    }
    setIsComposerOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      // Edit existing
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, title, content, type, isPinned, authorName }
            : a
        )
      );
      showToast('Bulletin updated successfully!');
    } else {
      // Create new
      const newAnn = {
        id: `ann-${Date.now()}`,
        title,
        content,
        type,
        isPinned,
        authorName,
        createdAt: new Date().toISOString(),
      };
      setAnnouncements([newAnn, ...announcements]);
      // Also update initialAnnouncements mock store for shared feeds
      initialAnnouncements.unshift(newAnn);
      showToast('New directive broadcasted live across all dashboards!');
    }

    setIsComposerOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    const idx = initialAnnouncements.findIndex((a) => a.id === id);
    if (idx !== -1) initialAnnouncements.splice(idx, 1);
    showToast('Bulletin removed from sitewide broadcast.');
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
    const item = initialAnnouncements.find((a) => a.id === id);
    if (item) item.isPinned = !item.isPinned;
    showToast('Pin status updated.');
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesFilter =
      selectedFilter === 'ALL'
        ? true
        : selectedFilter === 'PINNED'
        ? ann.isPinned
        : ann.type === selectedFilter;

    const matchesSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.content.toLowerCase().includes(search.toLowerCase()) ||
      ann.authorName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pinnedCount = announcements.filter((a) => a.isPinned).length;
  const alertCount = announcements.filter((a) => a.type === 'ALERT').length;
  const spotlightCount = announcements.filter((a) => a.type === 'SPOTLIGHT').length;

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-3 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  CMS DIRECTIVES
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">National Broadcast Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Announcements & CMS Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Publish sitewide directives, circulars, security alerts, and milestones across all user dashboards.
              </p>
            </div>

            <button
              onClick={() => handleOpenComposer()}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-glow-md btn-shimmer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Bulletin</span>
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed flex items-center gap-2 animate-fade-in-up shadow-glow-emerald">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CMS Analytics Cards */}
        <MotionSection variant="fade-up" delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-1 card-tilt">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">Total Bulletins</span>
              <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tabular-nums">{announcements.length} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Active</span></div>
            </div>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-950/20 p-4 space-y-1 card-tilt">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-indigo-700 dark:text-indigo-300">Pinned to Top</span>
              <div className="text-2xl font-display font-extrabold text-indigo-700 dark:text-indigo-400 tabular-nums">{pinnedCount} <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400/70">Items</span></div>
            </div>
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 p-4 space-y-1 card-tilt">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 dark:text-rose-300">Active Alerts</span>
              <div className="text-2xl font-display font-extrabold text-rose-700 dark:text-rose-400 tabular-nums">{alertCount} <span className="text-sm font-bold text-rose-500 dark:text-rose-400/70">Notices</span></div>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 space-y-1 card-tilt">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">Spotlight Feeds</span>
              <div className="text-2xl font-display font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">{spotlightCount} <span className="text-sm font-bold text-amber-600 dark:text-amber-400/70">Features</span></div>
            </div>
          </div>
        </MotionSection>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fade-in-up animation-delay-150">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search announcements by title, content, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 input-glow transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'PINNED', 'SPOTLIGHT', 'ALERT', 'ACHIEVEMENT', 'GENERAL'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedFilter === filter
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3 stagger-children">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((ann) => {
              let badgeClass = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
              let Icon = Sparkles;
              let borderClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60';

              if (ann.type === 'ALERT') {
                badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
                Icon = AlertTriangle;
                borderClass = 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10';
              } else if (ann.type === 'ACHIEVEMENT') {
                badgeClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
                Icon = Trophy;
                borderClass = 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10';
              } else if (ann.isPinned) {
                borderClass = 'border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-950/20';
              }

              return (
                <div
                  key={ann.id}
                  className={`rounded-3xl border p-5 backdrop-blur-xl space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-1 ${borderClass}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${badgeClass}`}>
                        <Icon className="h-3 w-3" />
                        {ann.type}
                      </span>
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          <Pin className="h-3 w-3 animate-pulse" /> PINNED
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        {new Date(ann.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleTogglePin(ann.id)}
                        className={`p-1.5 rounded-xl border text-xs transition-all ${
                          ann.isPinned
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={ann.isPinned ? 'Unpin bulletin' : 'Pin to top of feed'}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenComposer(ann)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Edit bulletin"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                        title="Delete bulletin"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-[15px] sm:text-base font-display font-bold text-slate-900 dark:text-white leading-snug">{ann.title}</h3>
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <div>
                      Published by <span className="text-slate-900 dark:text-slate-200 font-semibold">{ann.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Broadcast Active</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No bulletins found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try changing your search query or category filter.</p>
            </div>
          )}
        </div>

        {/* Modal / Overlay Composer */}
        {isComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-5 animate-scale-in relative">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Megaphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingId ? 'Edit Directive / Circular' : 'Broadcast New Sitewide Directive'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Instantly visible in all Trainee and Trainer feeds</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close composer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bulletin Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Digital Governance Hackathon & Certification Drive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 input-glow transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category Tag</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 input-glow transition-all"
                    >
                      <option value="SPOTLIGHT">SPOTLIGHT (High Priority Feature)</option>
                      <option value="ALERT">ALERT (Security & Maintenance Warning)</option>
                      <option value="ACHIEVEMENT">ACHIEVEMENT (Milestone Trophy)</option>
                      <option value="GENERAL">GENERAL (Standard Bulletin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Author & Department</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 input-glow transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full directive details, instructions, circular links, or milestone notes..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-slate-200 input-glow transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pin-directive"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-200 dark:border-slate-700 accent-indigo-500"
                  />
                  <label htmlFor="pin-directive" className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                    Pin this directive to the top of all user feeds
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 btn-shimmer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{editingId ? 'Update Directive' : 'Broadcast Sitewide'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}