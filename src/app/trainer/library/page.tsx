'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function TrainerLibraryPage() {
  const course = initialCourses[0];
  const [materials, setMaterials] = useState([...course.materials]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

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
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                MEDIA MANAGEMENT
              </span>
              <span className="text-xs text-slate-400">Course: {course.code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Curriculum Media Library & Uploads
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Upload recorded lectures (MP4), high-resolution slide decks (PDF/PPT), and reading documentation.
            </p>
          </div>
        </div>

        {showUploadSuccess && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in-up shadow-glow-emerald">
            <CheckCircle className="h-4 w-4" />
            <span>Asset encoded and successfully linked to module curriculum!</span>
          </div>
        )}

        {/* Drag and Drop Zone + Upload Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6 animate-fade-in-up animation-delay-100">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
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
                ? 'border-indigo-500 bg-indigo-950/40 shadow-glow-sm scale-[1.01]'
                : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
              accept="video/mp4,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.doc,.docx"
            />
            <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-glow-sm">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-white">Drag and drop file here, or browse local system</h4>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP4 (H.264), PDF, PPTX, and DOCX (Zero-Cost Local Disk Storage)
            </p>
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2 text-xs font-semibold text-slate-200 cursor-pointer transition-all hover:scale-105"
            >
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Browse Files from Computer'}
            </label>
          </div>

          {/* Form details */}
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 3: Distributed Consensus & Raft Protocols"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 input-glow transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Asset Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 input-glow transition-all"
                >
                  <option value="VIDEO">VIDEO (MP4 Lecture)</option>
                  <option value="PDF">PDF (Slide Deck)</option>
                  <option value="PPT">PPT (Presentation)</option>
                  <option value="DOC">DOC (Reference Manual)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Key lecture takeaways, code repo links, and reference bibliography..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-slate-200 input-glow transition-all"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !title.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-glow-md disabled:opacity-50 btn-shimmer"
              >
                <Plus className="h-4 w-4" />
                <span>{isUploading ? 'Encoding Asset...' : 'Add to Curriculum'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Materials Table */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">
              Published Course Assets ({materials.length})
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">Ordered by curriculum index</span>
          </div>

          <div className="space-y-2 stagger-children">
            {materials.map((m, idx) => (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between gap-4 hover:border-indigo-500/30 hover:bg-slate-950/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase border border-indigo-500/20">
                        {m.type}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-200 transition-colors">{m.title}</h4>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Size: {m.fileSize}</span>
                      {m.durationSeconds && <span>• Duration: {Math.floor(m.durationSeconds / 60)} mins</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Remove asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
