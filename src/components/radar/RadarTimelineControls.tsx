'use client';

import React, { useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { RadarFrame } from '@/types/weather';

export interface RadarTimelineControlsProps {
  frames: RadarFrame[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // in milliseconds per frame (e.g. 1000 for 1x, 500 for 2x, 2000 for 0.5x)
  onIndexChange: (index: number) => void;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speedMs: number) => void;
  isOfflineFallback?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function RadarTimelineControls({
  frames,
  currentIndex,
  isPlaying,
  playbackSpeed,
  onIndexChange,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  isOfflineFallback = false,
  onRefresh,
  className = '',
}: RadarTimelineControlsProps) {
  const currentFrame = frames[currentIndex] || null;

  // Find index of the latest past frame (transition point to nowcast)
  const latestPastIndex = useMemo(() => {
    for (let i = frames.length - 1; i >= 0; i--) {
      if (!frames[i].isNowcast) return i;
    }
    return frames.length > 0 ? frames.length - 1 : 0;
  }, [frames]);

  const latestPastTime = frames[latestPastIndex]?.time || Math.floor(Date.now() / 1000);

  // Format frame timestamp & relative offset label
  const { formattedTime, relativeLabel, isLiveFrame, isNowcastFrame } = useMemo(() => {
    if (!currentFrame) {
      return {
        formattedTime: '--:--',
        relativeLabel: 'No Data',
        isLiveFrame: false,
        isNowcastFrame: false,
      };
    }

    const date = new Date(currentFrame.time * 1000);
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const isLive = currentIndex === latestPastIndex && !currentFrame.isNowcast;
    const isNowcast = currentFrame.isNowcast;

    let rel = '';
    if (isLive) {
      rel = 'LIVE';
    } else if (isNowcast) {
      const diffMin = Math.round((currentFrame.time - latestPastTime) / 60);
      rel = `+${Math.max(5, diffMin)}m (Nowcast)`;
    } else {
      const diffMin = Math.round((latestPastTime - currentFrame.time) / 60);
      rel = `-${Math.max(5, diffMin)}m`;
    }

    return {
      formattedTime: timeStr,
      relativeLabel: rel,
      isLiveFrame: isLive,
      isNowcastFrame: isNowcast,
    };
  }, [currentFrame, currentIndex, latestPastIndex, latestPastTime]);

  const speedOptions = [
    { label: '0.5x', ms: 2000 },
    { label: '1x', ms: 1000 },
    { label: '2x', ms: 500 },
    { label: '4x', ms: 250 },
  ];

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl p-3 sm:p-4 text-slate-900 dark:text-white select-none transition-all duration-300 ${className}`}
      role="region"
      aria-label="Radar Timeline Playback Controls"
    >
      {/* Top Header: Frame Status & Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Frame Type Badge */}
        <div className="flex items-center gap-2">
          {isLiveFrame ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              Live Radar
            </div>
          ) : isNowcastFrame ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin" />
              Nowcast Forecast
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-400/30 text-sky-700 dark:text-sky-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Past Frame ({relativeLabel})
            </div>
          )}

          {isOfflineFallback && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-[#9a7224] dark:text-amber-300 font-mono">
              <Zap className="w-3 h-3" /> Simulation Mode
            </span>
          )}
        </div>

        {/* Timestamp Display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formattedTime}
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Frame {currentIndex + 1} / {frames.length || 1} • {relativeLabel}
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Radar Frames"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Refresh Radar Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Time Scrubber Slider & Frame Markers */}
      <div className="space-y-2 mb-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={currentIndex}
            onChange={(e) => onIndexChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/50"
            aria-label="Timeline Scrubber Slider"
          />
        </div>

        {/* Frame Tick Mark Indicators */}
        <div className="flex items-center justify-between gap-1 px-1">
          {frames.map((frame, idx) => {
            const isSelected = idx === currentIndex;
            const isNowcast = frame.isNowcast;
            const isLive = idx === latestPastIndex && !isNowcast;

            let dotColor = 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-500';
            if (isSelected) {
              dotColor = isNowcast ? 'bg-purple-500 ring-2 ring-purple-300 shadow-md scale-125' : 'bg-[#c59b48] ring-2 ring-[#c59b48]/50 shadow-md scale-125';
            } else if (isLive) {
              dotColor = 'bg-emerald-500 dark:bg-emerald-400 ring-1 ring-emerald-300';
            } else if (isNowcast) {
              dotColor = 'bg-purple-400/60 hover:bg-purple-500';
            } else {
              dotColor = 'bg-sky-400/60 hover:bg-sky-500';
            }

            return (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`h-2.5 flex-1 rounded-full transition-all duration-150 ${dotColor}`}
                title={`Frame ${idx + 1}: ${new Date(frame.time * 1000).toLocaleTimeString()} ${
                  isNowcast ? '(Nowcast)' : isLive ? '(LIVE)' : ''
                }`}
                aria-label={`Jump to frame ${idx + 1}`}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5">
          <span>-2h Past</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● LIVE</span>
          <span>+30m Nowcast</span>
        </div>
      </div>

      {/* Playback Controls & Speed Selector */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onStepBackward}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            title="Step Backward (Left Arrow)"
            aria-label="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 border shadow-sm transition active:scale-95 ${
              isPlaying
                ? 'bg-[#c59b48]/20 border-[#c59b48]/50 text-[#9a7224] dark:text-amber-300 hover:bg-[#c59b48]/30 shadow-[#c59b48]/10'
                : 'bg-[#c59b48] hover:bg-[#b58b38] gold-ink font-bold border-[#c59b48] shadow-md'
            }`}
            title={isPlaying ? 'Pause Animation (Space)' : 'Play Radar Animation (Space)'}
            aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Loop</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            title="Step Forward (Right Arrow)"
            aria-label="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1.5 hidden md:inline">
            Speed:
          </span>
          {speedOptions.map((opt) => {
            const isSelected = playbackSpeed === opt.ms;
            return (
              <button
                key={opt.ms}
                onClick={() => onSpeedChange(opt.ms)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  isSelected
                    ? 'bg-[#c59b48] gold-ink font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                aria-label={`Set speed to ${opt.label}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RadarTimelineControls;
