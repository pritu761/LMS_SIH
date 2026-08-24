import React from 'react';
import { Megaphone, Pin, AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { initialAnnouncements } from '@/lib/mockData';

export function AnnouncementFeed() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-indigo-400" />
          <span>Sitewide Bulletins & Ministry Directives</span>
        </h3>
        <span className="text-xs text-slate-400">Official CMS</span>
      </div>

      <div className="space-y-3">
        {initialAnnouncements.map((ann) => {
          let badgeClass = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
          let Icon = Sparkles;
          if (ann.type === 'ALERT') {
            badgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
            Icon = AlertTriangle;
          } else if (ann.type === 'ACHIEVEMENT') {
            badgeClass = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
            Icon = Trophy;
          }

          return (
            <div
              key={ann.id}
              className={`rounded-2xl border p-4 transition-all ${
                ann.isPinned
                  ? 'border-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badgeClass}`}>
                    <Icon className="h-3 w-3" />
                    {ann.type}
                  </span>
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-2">{ann.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ann.content}</p>

              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                Published by <span className="text-slate-300 font-semibold">{ann.authorName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
