'use client';

import React from 'react';
import { Megaphone, Pin, AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverLift, ease } from '@/lib/animations';
import { initialAnnouncements } from '@/lib/mockData';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function AnnouncementFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.smooth }}
      className="rounded-3xl border border-white/10 bg-[#09090e] p-6 backdrop-blur-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Megaphone className="h-4 w-4 text-blue-400" />
          </div>
          <span>Sitewide Bulletins & Ministry Directives</span>
        </h3>
        <span className="text-xs text-slate-400 rounded-lg bg-white/5 px-2.5 py-1 border border-white/10">Official CMS</span>
      </div>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {initialAnnouncements.map((ann) => {
          let badgeClass = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
          let Icon = Sparkles;
          let hoverBorder = 'hover:border-blue-500/40';
          if (ann.type === 'ALERT') {
            badgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
            Icon = AlertTriangle;
            hoverBorder = 'hover:border-rose-500/40';
          } else if (ann.type === 'ACHIEVEMENT') {
            badgeClass = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
            Icon = Trophy;
            hoverBorder = 'hover:border-amber-500/40';
          }

          return (
            <motion.div
              key={ann.id}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`rounded-2xl border p-4 transition-all duration-300 ${hoverBorder} cursor-default ${
                ann.isPinned
                  ? 'border-blue-500/40 bg-blue-950/20 shadow-glow-sm'
                  : 'border-white/10 bg-black/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badgeClass}`}>
                    <Icon className="h-3 w-3" />
                    {ann.type}
                  </span>
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                      <Pin className="h-3 w-3 animate-pulse" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {timeAgo(ann.createdAt)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-2">{ann.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ann.content}</p>

              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                Published by <span className="text-slate-200 font-semibold">{ann.authorName}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

