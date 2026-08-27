'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialUsers, initialCompetencies, initialCadres } from '@/lib/mockData';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Building,
  MapPin,
  Mail,
  Sparkles,
  Radio,
  Compass,
} from 'lucide-react';

export default function TraineeProfilePage() {
  const defaultUser = initialUsers.find((u) => u.role === 'TRAINEE') || initialUsers[4];

  const [profile, setProfile] = useState({ ...defaultUser.profile });
  const [competencies, setCompetencies] = useState([...defaultUser.competencies]);
  const [designation, setDesignation] = useState(defaultUser.designation || 'Scientist-B (DRSTC 2026 Batch Inductee)');
  const [centre, setCentre] = useState(defaultUser.centre || 'Numerical Weather Prediction Division, IMD HQ, New Delhi');
  const [cadreTrack, setCadreTrack] = useState(defaultUser.cadreTrack || 'DRSTC');
  const [isSaved, setIsSaved] = useState(false);

  // Qualification form state
  const [qualifications, setQualifications] = useState(
    profile.qualifications || [
      { degree: 'M.Tech in Atmospheric Science & Computing', institution: 'IIT Delhi', year: '2024', field: 'Atmospheric Physics' },
      { degree: 'B.Tech in Computer Science & Engineering', institution: 'NIT Surat', year: '2022', field: 'High Performance Computing' },
    ]
  );

  // Experience form state
  const [experience, setExperience] = useState(
    profile.experience || [
      { title: 'Scientist-B (Trainee)', company: 'India Meteorological Department', startYear: '2025', endYear: 'Present', description: 'Assisting in ensemble NWP post-processing.' },
    ]
  );

  const addQualification = () => {
    setQualifications([...qualifications, { degree: 'New Degree / Specialization', institution: 'University / IIT / NIT', year: '2025', field: 'Atmospheric Sciences' }]);
  };

  const removeQualification = (idx: number) => {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  };

  const handleProficiencyChange = (competencyId: string, newLevel: number) => {
    setCompetencies((prev) =>
      prev.map((c) => (c.competencyId === competencyId ? { ...c, proficiencyLevel: newLevel } : c))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
              MISSION MAUSAM DOSSIER
            </span>
            <span className="text-xs text-slate-400">IMD / MoES Official Cadre Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Meteorological Competency Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Keep your scientific qualifications, cadre designation, and verified meteorological proficiencies updated for gap mapping and faculty deployment.
          </p>
        </div>

        {isSaved && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile dossier and meteorological competency levels updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Section 1: Official Cadre & Meteorological Division */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Official Designation & Cadre Pathway</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cadre Training Track</label>
                <select
                  value={cadreTrack}
                  onChange={(e) => setCadreTrack(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {initialCadres.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Station / Division / RMC</label>
                <input
                  type="text"
                  value={centre}
                  onChange={(e) => setCentre(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Professional Research & Training Bio</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Self-Rated Meteorological Competency Matrix */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Mission Mausam Competency Matrix (Proficiency 1 - 5)</span>
              </h3>
              <span className="text-[11px] text-slate-400">1: Foundational • 5: Master Practitioner</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initialCompetencies.map((comp) => {
                const userComp = competencies.find((c) => c.competencyId === comp.id || c.code === comp.code);
                const currentLevel = userComp ? userComp.proficiencyLevel : 1;

                return (
                  <div
                    key={comp.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                          {comp.code} • {comp.category}
                        </span>
                        <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                      </div>
                      <span className="rounded bg-indigo-600/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                        Level {currentLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => handleProficiencyChange(comp.id, lvl)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            lvl <= currentLevel
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Academic Qualifications */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>Academic Degrees & Geoscience Specializations</span>
              </h3>
              <button
                type="button"
                onClick={addQualification}
                className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            <div className="space-y-3">
              {qualifications.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Degree (e.g. M.Tech in Atmospheric Science)"
                      value={q.degree}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].degree = e.target.value;
                        setQualifications(updated);
                      }}
                      className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Institution (e.g. IIT Delhi)"
                      value={q.institution}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].institution = e.target.value;
                        setQualifications(updated);
                      }}
                      className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2024)"
                      value={q.year}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].year = e.target.value;
                        setQualifications(updated);
                      }}
                      className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeQualification(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-8 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Save & Update Mission Mausam Dossier</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
