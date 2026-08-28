'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Circle,
  FileText,
  Download,
  Award,
  Star,
  Clock,
  Sparkles,
  Share2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Youtube,
  Radio,
} from 'lucide-react';
import { MockCourse } from '@/lib/mockData';
import { FeedbackModal } from './FeedbackModal';
import Link from 'next/link';

interface CoursePlayerProps {
  course: MockCourse;
  initialEnrollment?: any;
}

/**
 * Extract YouTube Video ID and format embed/watch URLs
 */
function getYouTubeEmbedInfo(url?: string): { isYouTube: boolean; embedUrl: string; originalUrl: string } | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }
  return null;
}

export function CoursePlayer({ course, initialEnrollment }: CoursePlayerProps) {
  const [activeMaterial, setActiveMaterial] = useState(course.materials[0]);
  const [completedIds, setCompletedIds] = useState<string[]>(
    initialEnrollment?.completedMaterialIds || ['mat-1']
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [progressPercent, setProgressPercent] = useState(
    initialEnrollment?.progressPercentage || 50
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytInfo = getYouTubeEmbedInfo(activeMaterial.url);

  const currentIndex = course.materials.findIndex((m) => m.id === activeMaterial.id);
  const hasNextMaterial = currentIndex >= 0 && currentIndex < course.materials.length - 1;
  const hasPrevMaterial = currentIndex > 0;

  const handleNextLesson = () => {
    if (hasNextMaterial) {
      if (!completedIds.includes(activeMaterial.id)) {
        toggleMaterialComplete(activeMaterial.id);
      }
      setActiveMaterial(course.materials[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrevMaterial) {
      setActiveMaterial(course.materials[currentIndex - 1]);
    }
  };

  useEffect(() => {
    // Scroll to top on material change
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) videoRef.current.play();
    }
  }, [activeMaterial]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMaterialComplete = async (matId: string) => {
    const isCompleted = completedIds.includes(matId);
    let updated: string[];
    if (isCompleted) {
      updated = completedIds.filter((id) => id !== matId);
    } else {
      updated = [...completedIds, matId];
    }
    setCompletedIds(updated);

    const calculatedProgress = Math.round((updated.length / course.materials.length) * 100);
    setProgressPercent(calculatedProgress);

    try {
      await fetch('/api/trainee/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, materialId: matId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatVideoTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Banner & Quick Metrics */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                {course.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">{course.category}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-emerald-400 font-medium">{course.level} Level</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{course.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Delivered by <span className="text-slate-200 font-semibold">{course.trainerName}</span> • Senior Faculty
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all duration-300 shadow-sm hover:shadow-glow-amber hover:border-amber-500/30"
            >
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Review Course</span>
            </button>

            <Link
              href={`/trainee/assessments/${course.assessmentId}`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-glow-md btn-shimmer"
            >
              <Award className="h-4 w-4" />
              <span>Take Assessment</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Course Completion Progress</span>
            <span className="font-bold text-indigo-400">{progressPercent}% Completed</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 relative rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 animate-stripe opacity-30 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player + Curriculum Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player & Resource Area */}
        <div className="lg:col-span-2 space-y-4">
          {activeMaterial.type === 'VIDEO' ? (
            ytInfo?.isYouTube ? (
              /* YouTube Embedded Player with Rich Controls */
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={ytInfo.embedUrl}
                    title={activeMaterial.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Video Info & Quick Actions Bar */}
                <div className="p-4 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => toggleMaterialComplete(activeMaterial.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        completedIds.includes(activeMaterial.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{completedIds.includes(activeMaterial.id) ? 'Lesson Completed' : 'Mark as Completed'}</span>
                    </button>

                    <a
                      href={ytInfo.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 text-red-300 hover:bg-red-600/25 border border-red-500/30 text-xs font-semibold transition-all"
                    >
                      <Youtube className="h-3.5 w-3.5 text-red-500" />
                      <span className="hidden sm:inline">Watch on YouTube</span>
                      <ExternalLink className="h-3 w-3 text-red-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      HD Topic Stream
                    </span>

                    {hasPrevMaterial && (
                      <button
                        onClick={handlePrevLesson}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-all hover:scale-105"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>
                    )}

                    {hasNextMaterial && (
                      <button
                        onClick={handleNextLesson}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Custom HTML5 Video Player */
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-elevation-3 group">
                <video
                  ref={videoRef}
                  src={activeMaterial.url}
                  className="w-full aspect-video object-cover bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => toggleMaterialComplete(activeMaterial.id)}
                />

                {/* Custom Video Controls Bar */}
                <div className="p-4 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 space-y-3">
                  {/* Seekbar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePlayPause}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      <span className="text-xs font-mono text-slate-400">
                        {formatVideoTime(currentTime)} / {formatVideoTime(duration || activeMaterial.durationSeconds || 0)}
                      </span>
                    </div>

                    {/* Playback speed selector */}
                    <div className="flex items-center gap-2">
                      {[1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            playbackSpeed === speed
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                              : 'text-slate-400 hover:text-white bg-slate-900'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Document / PDF / Slides Resource Viewer */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl space-y-0">
              {/* Document Header & Action Toolbar */}
              <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-red-950/80 px-2 py-0.5 text-[9px] font-extrabold text-red-300 uppercase border border-red-500/20">
                        {activeMaterial.type} DOCUMENT
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Size: {activeMaterial.fileSize}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{activeMaterial.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeMaterial.downloadUrl || activeMaterial.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>

                  <a
                    href={activeMaterial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 border border-slate-700 transition-all"
                    title="Open in new window"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Popout</span>
                  </a>

                  <button
                    onClick={() => toggleMaterialComplete(activeMaterial.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      completedIds.includes(activeMaterial.id)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{completedIds.includes(activeMaterial.id) ? 'Reviewed' : 'Mark Reviewed'}</span>
                  </button>
                </div>
              </div>

              {/* Embedded Document / PDF Reader Canvas */}
              <div className="relative w-full h-[520px] bg-slate-950">
                <iframe
                  src={`${activeMaterial.url}#toolbar=1&navpanes=0`}
                  title={activeMaterial.title}
                  className="w-full h-full border-0 rounded-b-2xl bg-slate-900"
                />
              </div>
            </div>
          )}

          {/* Module Notes & Lecture Description */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Lesson Overview & Key Learning Objectives</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeMaterial.description || course.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Competencies Covered
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {course.competencies.map((comp) => (
                    <span
                      key={comp.competencyId}
                      className="rounded bg-indigo-950/60 px-2 py-0.5 text-[11px] font-medium text-indigo-300 border border-indigo-500/20"
                    >
                      {comp.competencyName} (Lvl {comp.requiredProficiency})
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Course Metadata
                </span>
                <div className="text-xs text-slate-300 space-y-1 mt-1">
                  <div>Estimated Duration: {course.durationHours} Hours</div>
                  <div>Certification: Official Capacity Connect Certificate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Curriculum Checklist */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-xl animate-fade-in-right animation-delay-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Course Curriculum</h2>
              <span className="text-xs font-semibold text-slate-400">
                {completedIds.length} / {course.materials.length} Done
              </span>
            </div>

            <div className="space-y-2 stagger-children">
              {course.materials.map((mat, idx) => {
                const isSelected = activeMaterial.id === mat.id;
                const isDone = completedIds.includes(mat.id);

                return (
                  <div
                    key={mat.id}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500/50 bg-indigo-950/30 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                    onClick={() => setActiveMaterial(mat)}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMaterialComplete(mat.id);
                        }}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                      >
                        {isDone ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            Lesson {idx + 1}
                          </span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-semibold text-slate-300 uppercase">
                            {mat.type}
                          </span>
                        </div>
                        <h4 className={`text-xs font-semibold truncate mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                          {mat.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{mat.type === 'VIDEO' ? `${Math.floor((mat.durationSeconds || 1200) / 60)} min` : mat.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Callout Banner */}
            <div className="mt-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-slate-900 p-4 space-y-3 animate-border-glow">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-bold text-white">Subject-Wise Assessment</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Complete the timed MCQ exam to earn your verified credential and update your competency rating.
              </p>
              <Link
                href={`/trainee/assessments/${course.assessmentId}`}
                className="block text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30 hover:shadow-glow-md btn-shimmer"
              >
                Launch Exam Room
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          courseId={course.id}
          courseTitle={course.title}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
