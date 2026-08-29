'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCompetencies, initialCadres, initialCourses, MockCourse } from '@/lib/mockData';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  Video,
  FileText,
  Sliders,
  Clock,
  Radio,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

export default function TrainerCourseCreatorPage() {
  const [code, setCode] = useState('DRSTC-204');
  const [title, setTitle] = useState('Advanced 4D-Var Data Assimilation & HPC Parallel Scaling');
  const [category, setCategory] = useState('Numerical Weather Prediction');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');
  const [cadreTrack, setCadreTrack] = useState('DRSTC');
  const [durationHours, setDurationHours] = useState(24.0);
  const [description, setDescription] = useState(
    'Comprehensive mathematical formulation of 4D-Var variational data assimilation, tangent linear and adjoint operators, NetCDF radar data ingest, and MPI scaling on Pratyush/Mihir supercomputers.'
  );
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?w=800&auto=format&fit=crop&q=60');

  // Competency mappings with target proficiency levels
  const [selectedCompetencies, setSelectedCompetencies] = useState([
    { competencyId: 'comp-nwp', requiredProficiency: 5, weight: 1.5 },
    { competencyId: 'comp-hpc', requiredProficiency: 4, weight: 1.2 },
    { competencyId: 'comp-satellite', requiredProficiency: 3, weight: 1.0 },
  ]);

  // Curriculum material modules
  const [materials, setMaterials] = useState([
    {
      id: 'mat-new-1',
      title: 'Lecture 1: Mathematical Foundations of 4D-Var Cost Functions',
      type: 'VIDEO',
      durationMinutes: 45,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'mat-new-2',
      title: 'Lecture 2: Adjoint Sensitivity & Boundary Covariances Slide Deck',
      type: 'PDF',
      durationMinutes: 30,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const handleAddCompetency = (compId: string) => {
    if (!selectedCompetencies.some((c) => c.competencyId === compId)) {
      setSelectedCompetencies([
        ...selectedCompetencies,
        { competencyId: compId, requiredProficiency: 3, weight: 1.0 },
      ]);
    }
  };

  const handleRemoveCompetency = (compId: string) => {
    setSelectedCompetencies(selectedCompetencies.filter((c) => c.competencyId !== compId));
  };

  const handleProficiencyChange = (compId: string, level: number) => {
    setSelectedCompetencies(
      selectedCompetencies.map((c) =>
        c.competencyId === compId ? { ...c, requiredProficiency: level } : c
      )
    );
  };

  const handleAddMaterial = () => {
    const newId = `mat-new-${Date.now()}`;
    setMaterials([
      ...materials,
      {
        id: newId,
        title: `Module ${materials.length + 1}: Topic Lecture & Lab Notebook`,
        type: 'VIDEO',
        durationMinutes: 40,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();

    // Append to in-memory courses list
    const newCourseObj: MockCourse = {
      id: `course-${Date.now()}`,
      title,
      code,
      slug: code.toLowerCase().replace(/\s+/g, '-'),
      description,
      category,
      level,
      cadreTrack: cadreTrack as any,
      durationHours,
      thumbnail,
      status: 'PUBLISHED',
      trainerId: 'user-trainer-1',
      trainerName: 'Prof. Vikramaditya Sen',
      trainerRating: 4.92,
      trainerSpecialization: 'Numerical Weather Prediction & HPC Modeller',
      assessmentId: 'assess-1',
      competencies: selectedCompetencies.map((sc) => {
        const compInfo = initialCompetencies.find((ic) => ic.id === sc.competencyId);
        return {
          competencyId: sc.competencyId,
          competencyName: compInfo?.name || 'Atmospheric Science',
          requiredProficiency: sc.requiredProficiency,
          weight: sc.weight,
        };
      }),
      materials: materials.map((m, idx) => ({
        id: m.id,
        title: m.title,
        description: `Official training lecture and practical lab on ${m.title}`,
        type: m.type as any,
        url: m.url,
        sortOrder: idx + 1,
        fileSize: '45 MB',
        durationSeconds: m.durationMinutes * 60,
        isPreview: idx === 0,
      })),
    };

    initialCourses.unshift(newCourseObj);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48]/60 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#c59b48]/15 px-2.5 py-0.5 text-xs font-bold text-[#9a7224] dark:text-[#c59b48] border border-[#c59b48]/30">
              MISSION MAUSAM CURRICULUM STUDIO
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Faculty Course Authoring & Competency Mapping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Author New Curriculum Track Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Publish sovereign meteorological courses mapped to DRSTC, FTC, IMTC, and Modular tracks. Bound competencies are automatically analyzed by the 55/30/15 allocation algorithm.
          </p>
        </div>

        {isSaved && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2 animate-fade-in-up shadow-glow-emerald">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Course &ldquo;{code}: {title}&rdquo; successfully authored and published sitewide!</span>
            </div>
            <Link
              href="/trainee/courses"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 text-xs font-bold transition-all"
            >
              View in Catalog
            </Link>
          </div>
        )}

        <form onSubmit={handleSaveCourse} className="space-y-6">
          
          {/* Section 1: Course Metadata & Cadre Alignment */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#c59b48]" />
              <span>Module Details & Cadre Classification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Course Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Cadre Track</label>
                <select
                  value={cadreTrack}
                  onChange={(e) => setCadreTrack(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
                >
                  {initialCadres.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.fullName}
                    </option>
                  ))}
                  <option value="MODULAR">MODULAR: AI & HPC In-Service</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Specialization Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
                >
                  <option value="Numerical Weather Prediction">Numerical Weather Prediction</option>
                  <option value="Radar Meteorology">Radar Meteorology & DWR</option>
                  <option value="Satellite Meteorology">Satellite Meteorology & INSAT</option>
                  <option value="AI & High Performance Computing">AI & High Performance Computing</option>
                  <option value="Severe Weather Forecasting">Severe Weather & Cyclone Warning</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Curriculum Duration (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value) || 10)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Curriculum Overview & Syllabus Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-200 focus:border-[#c59b48] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Target Competencies & Proficiency Thresholds */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-500" />
                  <span>Mapped Competency Standards ({selectedCompetencies.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select domain skills and target proficiency thresholds (1 to 5) taught in this module.
                </p>
              </div>

              {/* Add Competency Selector */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCompetency(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                >
                  <option value="">+ Add Mapped Competency</option>
                  {initialCompetencies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} ({comp.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCompetencies.map((sc) => {
                const compInfo = initialCompetencies.find((c) => c.id === sc.competencyId);
                if (!compInfo) return null;

                return (
                  <div
                    key={sc.competencyId}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#c59b48] uppercase font-bold">
                          {compInfo.code} • {compInfo.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{compInfo.name}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(sc.competencyId)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Required Level:</span>
                        <span className="font-bold text-[#0b1e36] dark:text-[#c59b48]">Level {sc.requiredProficiency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => handleProficiencyChange(sc.competencyId, lvl)}
                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                              lvl <= sc.requiredProficiency
                                ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Curriculum Material Modules */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-cyan-500" />
                <span>Curriculum Lesson Assets ({materials.length})</span>
              </h3>

              <button
                type="button"
                onClick={handleAddMaterial}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Lesson</span>
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((m, idx) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                    <div className="h-8 w-8 rounded-xl bg-[#0b1e36]/10 dark:bg-white/5 flex items-center justify-center font-bold text-xs text-[#0b1e36] dark:text-[#c59b48] shrink-0">
                      {idx + 1}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => {
                          const updated = [...materials];
                          updated[idx].title = e.target.value;
                          setMaterials(updated);
                        }}
                        className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 sm:col-span-2"
                      />

                      <div className="flex items-center gap-2">
                        <select
                          value={m.type}
                          onChange={(e) => {
                            const updated = [...materials];
                            updated[idx].type = e.target.value;
                            setMaterials(updated);
                          }}
                          className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        >
                          <option value="VIDEO">MP4 Video</option>
                          <option value="PDF">PDF Slides</option>
                          <option value="PPT">Presentation</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3">
            <Link
              href="/trainer"
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-[#0b1e36] hover:bg-[#122c4d] dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] text-white dark:text-[#0b1e36] px-8 py-3 text-xs font-bold shadow-xl transition-all hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Publish Course to Mission Mausam Catalog</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
