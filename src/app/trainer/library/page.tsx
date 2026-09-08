'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses } from '@/lib/mockData';
import {
  UploadCloud,
  Video,
  FileText,
  Trash2,
  CheckCircle,
  Plus,
  Clock,
  Sparkles,
  Play,
  FileSpreadsheet,
  Eye,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY = 'trainer-library-materials-v1';

export default function TrainerLibraryPage() {
  const course = initialCourses[0];
  const [materials, setMaterials] = useState([...course.materials]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VIDEO' | 'PDF' | 'PPT' | 'DOC'>('ALL');

  // Persist library across navigation (local cache until backend sync lands)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setMaterials(parsed);
      }
    } catch { /* corrupted cache — fall back to course materials */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch { /* storage full/blocked — session-only */ }
  }, [materials]);

  const filteredMaterials = typeFilter === 'ALL' ? materials : materials.filter((m) => m.type === typeFilter);

  const togglePreview = (id: string) => {
    setMaterials(materials.map((m) => (m.id === id ? { ...m, isPreview: !m.isPreview } : m)));
  };

  // Form states for manual upload item
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'VIDEO' | 'PDF' | 'PPT' | 'DOC'>('VIDEO');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState('85 MB');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFileSize(`${Math.round(file.size / (1024 * 1024) * 10) / 10} MB`);
      if (file.type.includes('video')) setType('VIDEO');
      else if (file.type.includes('pdf')) setType('PDF');
      else setType('DOC');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFileSize(`${Math.round(file.size / (1024 * 1024) * 10) / 10} MB`);
      if (file.type.includes('video')) setType('VIDEO');
      else if (file.type.includes('pdf')) setType('PDF');
      else setType('DOC');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);
    let uploadedUrl = type === 'VIDEO'
      ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    // If real file is selected, upload to zero-cost local storage
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.data.fileUrl;
        }
      } catch (err) {
        console.error('Local upload fallback:', err);
      }
    }

    const newMat = {
      id: `mat-${Date.now()}`,
      title,
      description,
      type,
      url: uploadedUrl,
      downloadUrl: uploadedUrl,
      durationSeconds: type === 'VIDEO' ? 1200 : undefined,
      fileSize: fileSize || '25 MB',
      sortOrder: materials.length + 1,
      isPreview: false,
    };

    setMaterials([...materials, newMat]);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setIsUploading(false);
    setShowUploadSuccess(true);
    setTimeout(() => setShowUploadSuccess(false), 3000);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                MEDIA MANAGEMENT
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Course: {course.code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Curriculum Media Library & Uploads
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Upload recorded lectures (MP4), high-resolution slide decks (PDF/PPT), and reading documentation.
            </p>
          </div>
        </div>

        {showUploadSuccess && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed flex items-center gap-2 animate-fade-in-up">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Lecture uploaded and linked to the module curriculum.</span>
          </div>
        )}

        {/* Drag and Drop Zone + Upload Form */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-6 animate-fade-in-up animation-delay-100">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <UploadCloud className="h-4 w-4 text-indigo-400" />
            </div>
            <span>Upload New Lecture or Slide Deck</span>
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/40 scale-[1.01]'
                : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/40 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
              accept="video/mp4,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.doc,.docx"
            />
            <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Drag and drop file here, or browse local system</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports MP4 (H.264), PDF, PPTX, and DOCX (Zero-Cost Local Disk Storage)
            </p>
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block max-w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-200 cursor-pointer transition-all hover:scale-105"
            >
              <span className="block truncate max-w-[280px] sm:max-w-[420px]">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Browse Files from Computer'}
              </span>
            </label>
          </div>

          {/* Form details */}
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 4: Dual-Pol Doppler Velocity De-aliasing Lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 input-glow transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Asset Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 input-glow transition-all"
                >
                  <option value="VIDEO">VIDEO (MP4 Lecture)</option>
                  <option value="PDF">PDF (Slide Deck)</option>
                  <option value="PPT">PPT (Presentation)</option>
                  <option value="DOC">DOC (Reference Manual)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Key lecture takeaways, code repo links, and reference bibliography..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 input-glow transition-all"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !title.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50 btn-shimmer"
              >
                <Plus className="h-4 w-4" />
                <span>{isUploading ? 'Encoding Asset...' : 'Add to Curriculum'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Materials Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Published Course Assets ({filteredMaterials.length}/{materials.length})
            </h3>
            <div className="flex items-center gap-1 text-xs">
              {(['ALL', 'VIDEO', 'PDF', 'PPT', 'DOC'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTypeFilter(f)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    typeFilter === f
                      ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No {typeFilter} assets yet</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload your first {typeFilter === 'ALL' ? 'lecture or slide deck' : typeFilter} using the form above.</p>
            </div>
          ) : (
          <div className="space-y-2 stagger-children">
            {filteredMaterials.map((m, idx) => (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 flex items-center justify-between gap-4 hover:border-indigo-500/30 dark:hover:bg-slate-950/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs group-hover:scale-110 transition-transform">
                    {m.type === 'VIDEO' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded-md bg-indigo-500/10 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border border-indigo-500/20 shrink-0">
                        {m.type}
                      </span>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors">{m.title}</h4>
                      {m.isPreview && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                          FREE PREVIEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5 tabular-nums flex-wrap">
                      <span>Size: {m.fileSize}</span>
                      {m.durationSeconds && <span>• Duration: {Math.floor(m.durationSeconds / 60)} mins</span>}
                    </div>
                    {m.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{m.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all"
                      title={m.type === 'VIDEO' ? 'Preview video' : 'Open document'}
                    >
                      {m.type === 'VIDEO' ? <Play className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                    </a>
                  )}
                  <button
                    onClick={() => togglePreview(m.id)}
                    className={`p-2 rounded-xl transition-all ${m.isPreview ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                    title={m.isPreview ? 'Remove free preview' : 'Mark as free preview'}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Remove asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}