'use client';

import React from 'react';
import {
  X,
  User,
  Building,
  GraduationCap,
  Briefcase,
  Award,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { MockUser } from '@/lib/mockData';

interface UserDetailModalProps {
  user: MockUser;
  onClose: () => void;
  onApprove?: () => void;
  onSuspend?: () => void;
}

export function UserDetailModal({ user, onClose, onApprove, onSuspend }: UserDetailModalProps) {
  const profile = user.profile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'}
            alt={profile.fullName}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {profile.fullName}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                  user.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : user.status === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                {user.status}
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium mt-0.5">{profile.headline}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                {profile.organization || 'Public Sector'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                {profile.location || 'India'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Professional Biography
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed rounded-xl bg-white dark:bg-slate-950/50 p-3.5 border border-slate-200 dark:border-slate-800/80">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Competencies Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-indigo-400" />
            <span>Self-Rated & Verified Competencies</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {user.competencies && user.competencies.length > 0 ? (
              user.competencies.map((comp) => (
                <div
                  key={comp.competencyId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">
                      {comp.code}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{comp.competencyName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                      Lvl {comp.proficiencyLevel} / 5
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 italic py-2">
                No verified competencies recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Qualifications & Experience Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Qualifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span>Academic Qualifications</span>
            </h4>
            <div className="space-y-2">
              {profile.qualifications && profile.qualifications.length > 0 ? (
                profile.qualifications.map((q, idx) => (
                  <div key={idx} className="rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">{q.degree}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{q.institution} ({q.year})</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">No formal records listed.</div>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-amber-400" />
              <span>Work Experience</span>
            </h4>
            <div className="space-y-2">
              {profile.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">{exp.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{exp.company} ({exp.startYear} - {exp.endYear})</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">No prior experience listed.</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-700"
          >
            Close Dossier
          </button>

          <div className="flex items-center gap-2">
            {user.status === 'PENDING' && onApprove && (
              <button
                onClick={onApprove}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve Account</span>
              </button>
            )}

            {user.status === 'APPROVED' && onSuspend && (
              <button
                onClick={onSuspend}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 px-4 py-2 text-xs font-semibold transition-colors"
              >
                Suspend Access
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}