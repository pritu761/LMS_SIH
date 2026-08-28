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
  const [title, setTitle] = useState('Advanced Kubernetes Architecture & Zero-Trust Certification Exam');
  const [description, setDescription] = useState('Timed proctored exam evaluating container runtime security and ingress routing.');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [cutoffDate, setCutoffDate] = useState('2026-12-31T23:59');
  const [isSaved, setIsSaved] = useState(false);

  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      questionText: 'What is the default Raft consensus quorum threshold required for a 3-node etcd cluster?',
      options: [
        { id: 'opt_1', text: '1 Node' },
        { id: 'opt_2', text: '2 Nodes (Quorum = N/2 + 1)' },
        { id: 'opt_3', text: '3 Nodes' },
      ],
      correctOption: 'opt_2',
      weight: 2.5,
      explanation: 'In Raft consensus, quorum is calculated as floor(N/2) + 1. For 3 nodes, quorum is 2.',
    },
  ]);

  const addQuestion = () => {
    const newQId = `q_${Date.now()}`;
    setQuestions([
      ...questions,
      {
        id: newQId,
        questionText: 'New Assessment Question Prompt...',
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
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/20">
              ASSESSMENT DESIGNER
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Automated MCQ Auto-Grading Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            MCQ Assessment Creator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Define exam parameters, question weights, answer keys, explanations, and time limit bounds.
          </p>
        </div>

        {isSaved && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                    <span className="rounded-lg bg-indigo-600/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
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
                        className="w-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-900 dark:text-slate-200 text-center"
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
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                          className="flex-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
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