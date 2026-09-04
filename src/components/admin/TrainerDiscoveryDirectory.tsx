'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Star,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  Mail,
  MapPin,
  ExternalLink,
  Send,
} from 'lucide-react';
import { initialUsers, initialCompetencies, MockUser } from '@/lib/mockData';

export function TrainerDiscoveryDirectory() {
  const allTrainers = initialUsers.filter((u) => u.role === 'TRAINER');
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedTrainer, setSelectedTrainer] = useState<MockUser | null>(null);
  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);

  const domains = [
    'ALL',
    'Atmospheric Physics & Modeling',
    'Observational Radar & Satellite',
    'Computational & HPC',
    'Applied Meteorology & DSS',
  ];

  const filteredTrainers = allTrainers.filter((trainer) => {
    const matchesDomain =
      selectedDomain === 'ALL' ||
      trainer.competencies.some((c) => {
        const comp = initialCompetencies.find((ic) => ic.id === c.competencyId || ic.code === c.code);
        return comp && comp.category === selectedDomain;
      });

    const matchesSearch =
      trainer.profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
      trainer.profile.headline.toLowerCase().includes(search.toLowerCase()) ||
      trainer.profile.organization.toLowerCase().includes(search.toLowerCase()) ||
      trainer.competencies.some((c) => c.competencyName.toLowerCase().includes(search.toLowerCase()));

    return matchesDomain && matchesSearch;
  });

  const handleDeployTrainer = (trainerName: string) => {
    setAssignedSuccess(`Deployment request dispatched for ${trainerName} to lead upcoming Mission Mausam cohort.`);
    setTimeout(() => setAssignedSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {assignedSuccess && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in-up shadow-glow-emerald">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{assignedSuccess}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                NATIONAL FACULTY ROSTER
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">IMD & MoES Accredited Experts</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-400" />
              <span>Trainer Discovery & Faculty Allocation Directory</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Discover senior scientists, radar specialists, and NWP faculty verified under WMO and Mission Mausam standards.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {filteredTrainers.length} of {allTrainers.length} Faculty Available
            </span>
          </div>
        </div>

        {/* Search & Domain Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search faculty by name, meteorological specialization, institute, or competency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDomain === dom
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {dom === 'ALL' ? 'All Domains' : dom.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => {
          const rawRating = trainer.id === 'user-trainer-1' ? 4.92 : trainer.id === 'user-trainer-2' ? 4.95 : 4.88;
          const coursesDelivered = trainer.id === 'user-trainer-1' ? 14 : trainer.id === 'user-trainer-2' ? 8 : 10;

          return (
            <div
              key={trainer.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1 hover:shadow-elevation-1"
            >
              <div className="space-y-4">
                {/* Header & Avatar */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={trainer.profile.avatarUrl}
                    alt={trainer.profile.fullName}
                    className="h-14 w-14 rounded-2xl object-cover border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{trainer.profile.fullName}</h3>
                      <span title="Verified MoES Faculty">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{trainer.designation || trainer.profile.headline}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {rawRating} ★
                      </span>
                      <span>•</span>
                      <span className="text-indigo-400 font-bold">{coursesDelivered} Cohorts</span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {trainer.profile.bio}
                </p>

                {/* Verified Competencies */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.competencies.map((c) => (
                      <span
                        key={c.competencyId}
                        className="rounded-lg bg-white dark:bg-slate-950 px-2 py-1 text-[10px] font-medium text-indigo-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1"
                      >
                        <span>{c.code}</span>
                        <span className="text-emerald-400 font-bold font-mono">Lvl {c.proficiencyLevel}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Center / Department */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{trainer.centre || trainer.profile.organization}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrainer(trainer)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200 transition-colors"
                >
                  View Dossier
                </button>

                <button
                  type="button"
                  onClick={() => handleDeployTrainer(trainer.profile.fullName)}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <Send className="h-3 w-3" />
                  <span>Deploy Faculty</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dossier Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in relative">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTrainer.profile.avatarUrl}
                  alt={selectedTrainer.profile.fullName}
                  className="h-16 w-16 rounded-2xl object-cover border border-emerald-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTrainer.profile.fullName}</h3>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                      ACCREDITED
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-0.5">{selectedTrainer.designation || selectedTrainer.profile.headline}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedTrainer.centre || selectedTrainer.profile.organization}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainer(null)}
                className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Academic Bio</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedTrainer.profile.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Qualifications</span>
                  <div className="space-y-1 mt-1">
                    {selectedTrainer.profile.qualifications.map((q, idx) => (
                      <div key={idx} className="text-slate-600 dark:text-slate-300">
                        • {q.degree} ({q.institution}, {q.year})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Certifications</span>
                  <div className="space-y-1 mt-1">
                    {selectedTrainer.profile.certificates.map((c, idx) => (
                      <div key={idx} className="text-emerald-300 font-medium">
                        ✓ {c.title} ({c.issuer})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedTrainer(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDeployTrainer(selectedTrainer.profile.fullName);
                  setSelectedTrainer(null);
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30"
              >
                Deploy Faculty to Cohort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}