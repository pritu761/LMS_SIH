'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses } from '@/lib/mockData';
import {
  FileCheck,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  HelpCircle,
  Timer,
  Award,
  Sparkles,
} from 'lucide-react';

export default function AssessmentCreatorPage() {
  const [courseId, setCourseId] = useState(initialCourses[0].id);
  const [title, setTitle] = useState('Numerical Weather Prediction & Doppler Radar Certification Exam (DRSTC-101)');
  const [description, setDescription] = useState('Timed proctored examination evaluating atmospheric dynamics, non-hydrostatic Navier-Stokes governing equations, CFL numerical stability, and Doppler radar velocity dealiasing.');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [cutoffDate, setCutoffDate] = useState('2026-12-31T23:59');
  const [isSaved, setIsSaved] = useState(false);

  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      questionText: 'What is the primary governing criterion to prevent numerical instability in explicit finite-difference time integration of atmospheric governing equations?',
      options: [
        { id: 'opt_1', text: 'Richardson Extrapolation Criterion' },
        { id: 'opt_2', text: 'Courant–Friedrichs–Lewy (CFL) Condition (C = u·Δt / Δx ≤ C_max)' },
        { id: 'opt_3', text: 'Rayleigh-Bénard Convective Threshold' },
      ],
      correctOption: 'opt_2',
      weight: 2.5,
      explanation: 'The CFL condition mandates that the numerical domain of dependence must contain the physical domain of dependence to prevent catastrophic amplification of discretization errors.',
    },
    {
      id: 'q2',
      questionText: 'In Dual-Polarization Doppler Weather Radar operations, what does Differential Reflectivity (Z_DR) primarily indicate?',
      options: [
        { id: 'opt_1', text: 'Total atmospheric precipitable water vapor column' },
        { id: 'opt_2', text: 'Oblateness and horizontal-to-vertical axis ratio of hydrometeors (e.g. rain drops vs hail)' },
        { id: 'opt_3', text: 'Planetary boundary layer turbulence index' },
      ],
      correctOption: 'opt_2',
      weight: 2.5,
      explanation: 'Differential Reflectivity (Z_DR = 10 * log10(Z_H / Z_V)) measures the difference between horizontal and vertical reflectivity, isolating raindrop oblateness from tumbling isotropic hail.',
    },
  ]);

  const loadPresetTemplate = (track: 'DRSTC' | 'FTC' | 'IMTC' | 'MODULAR') => {
    if (track === 'DRSTC') {
      setTitle('DRSTC Advanced Dynamics & HPC Model Certification Exam');
      setDescription('Comprehensive scientist inductee examination evaluating 4D-Var data assimilation, MPI parallel scaling, and boundary layer parameterizations.');
      setQuestions([
        {
          id: `q_${Date.now()}_1`,
          questionText: 'Which data assimilation technique minimizes a 4-dimensional cost function over a finite time window incorporating model physics as strong constraints?',
          options: [
            { id: 'opt_1', text: 'Optimal Interpolation (OI)' },
            { id: 'opt_2', text: 'Four-Dimensional Variational Data Assimilation (4D-Var)' },
            { id: 'opt_3', text: '3D Empirical Orthogonal Function analysis' },
          ],
          correctOption: 'opt_2',
          weight: 3.0,
          explanation: '4D-Var implicitly propagates background error covariance matrices forward using the tangent linear and adjoint models across the assimilation window.',
        },
        {
          id: `q_${Date.now()}_2`,
          questionText: 'What is the theoretical speedup limit of an NWP code when scaling across 4,096 cores according to Amdahl’s Law if 5% is strictly serial?',
          options: [
            { id: 'opt_1', text: 'Infinite linear speedup' },
            { id: 'opt_2', text: 'Maximum theoretical speedup of 20x' },
            { id: 'opt_3', text: '256x speedup' },
          ],
          correctOption: 'opt_2',
          weight: 2.0,
          explanation: 'By Amdahl’s law: S_max = 1 / (s + (1-s)/N). When s = 0.05, S_max = 1 / 0.05 = 20x.',
        },
      ]);
    } else if (track === 'FTC') {
      setTitle('FTC Severe Weather & Cyclone Track Nowcasting Exam');
      setDescription('Operational forecaster qualification on Doppler velocity dealiasing, eye-wall meso-vortices, and color-coded alert bulletins.');
      setQuestions([
        {
          id: `q_${Date.now()}_1`,
          questionText: 'When Doppler velocity exceeds the maximum unambiguous velocity (V_max = λ · PRF / 4), what observational artifact occurs?',
          options: [
            { id: 'opt_1', text: 'Ground clutter amplification' },
            { id: 'opt_2', text: 'Velocity aliasing / Doppler folding' },
            { id: 'opt_3', text: 'Attenuation extinction' },
          ],
          correctOption: 'opt_2',
          weight: 2.5,
          explanation: 'Velocity aliasing occurs when radial velocity exceeds Nyquist interval [-V_max, +V_max], causing inbound velocities to appear falsely as outbound.',
        },
      ]);
    }
  };

  const addQuestion = () => {
    const newQId = `q_${Date.now()}`;
    setQuestions([
      ...questions,
      {
        id: newQId,
        questionText: 'New Meteorological Assessment Question Prompt...',
        options: [
          { id: 'opt_1', text: 'Option A' },
          { id: 'opt_2', text: 'Option B' },
          { id: 'opt_3', text: 'Option C' },
        ],
        correctOption: 'opt_1',
        weight: 2.0,
        explanation: 'Detailed pedagogical explanation for post-submission review.',
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  MISSION MAUSAM EXAM STUDIO
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Automated MCQ Auto-Grading Framework</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                MCQ Assessment Creator
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Define exam parameters, question weights, answer keys, explanations, and time limit bounds.
              </p>
            </div>

            {/* Template Presets */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block sm:inline mr-1">
                Templates:
              </span>
              <button
                type="button"
                onClick={() => loadPresetTemplate('DRSTC')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
              >
                DRSTC HPC
              </button>
              <button
                type="button"
                onClick={() => loadPresetTemplate('FTC')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100"
              >
                FTC Radar
              </button>
            </div>
          </div>
        </div>

        {isSaved && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Assessment configuration published and synced to course curriculum!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Assessment Meta Parameters */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Timer className="h-4 w-4 text-indigo-400" />
              <span>Assessment Configuration & Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {initialCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Exam Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 30)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Passing Percentage (%)
                </label>
                <input
                  type="number"
                  min={40}
                  max={100}
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(parseFloat(e.target.value) || 70)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Max Attempts</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 3)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Submission Cutoff Date
                </label>
                <input
                  type="datetime-local"
                  value={cutoffDate}
                  onChange={(e) => setCutoffDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-cyan-400" />
                <span>MCQ Questions ({questions.length})</span>
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-indigo-600/20 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      Question {qIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Weight:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={q.weight}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].weight = parseFloat(e.target.value) || 1.0;
                          setQuestions(updated);
                        }}
                        className="w-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-200 text-center tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Question Prompt</label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].questionText = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Options & Correct Answer Key
                    </label>
                    {q.options.map((opt, optIdx) => (
                      <div key={opt.id} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={q.correctOption === opt.id}
                          onChange={() => {
                            const updated = [...questions];
                            updated[qIdx].correctOption = opt.id;
                            setQuestions(updated);
                          }}
                          className="accent-indigo-500 h-4 w-4 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIdx].options[optIdx].text = e.target.value;
                            setQuestions(updated);
                          }}
                          className="flex-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Pedagogical Explanation (Shown after grading)
                    </label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].explanation = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 px-8 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-600/30 transition-all hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Publish Assessment Package</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}