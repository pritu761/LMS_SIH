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
  ExternalLink,
} from 'lucide-react';
import { MockCourse } from '@/lib/mockData';
import { FeedbackModal } from './FeedbackModal';
import Link from 'next/link';

interface CoursePlayerProps {
  course: MockCourse;
  initialEnrollment?: any;
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
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
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
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Review Course</span>
            </button>

            <Link
              href={`/trainee/assessments/${course.assessmentId}`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
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
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player + Curriculum Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player & Resource Area */}
        <div className="lg:col-span-2 space-y-4">
          {activeMaterial.type === 'VIDEO' ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
              <video
                ref={videoRef}
                src={activeMaterial.url}
                className="w-full aspect-video object-cover bg-black"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => toggleMaterialComplete(activeMaterial.id)}
              />

              {/* Custom Video Controls Bar */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-3">
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
          ) : (
            /* Document / PDF / Slides Resource Viewer */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{activeMaterial.title}</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  {activeMaterial.description}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400">
                  <span>File Size: {activeMaterial.fileSize}</span>
                  <span>•</span>
                  <span>Format: {activeMaterial.type}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={activeMaterial.downloadUrl || activeMaterial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Document</span>
                </a>

                <button
                  onClick={() => toggleMaterialComplete(activeMaterial.id)}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Mark as Reviewed</span>
                </button>
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Course Curriculum</h2>
              <span className="text-xs font-semibold text-slate-400">
                {completedIds.length} / {course.materials.length} Done
              </span>
            </div>

            <div className="space-y-2">
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
            <div className="mt-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-bold text-white">Subject-Wise Assessment</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Complete the timed MCQ exam to earn your verified credential and update your competency rating.
              </p>
              <Link
                href={`/trainee/assessments/${course.assessmentId}`}
                className="block text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30"
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
