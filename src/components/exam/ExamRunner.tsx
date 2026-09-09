'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlarmClock,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  Monitor,
  TriangleAlert,
  Wifi,
} from 'lucide-react';
import type { ExamMeta, ExamSession } from '@/services/examTypes';

type Phase = 'checks' | 'identity' | 'running';

interface CheckState {
  camera: 'pending' | 'ok' | 'fail';
  mic: 'pending' | 'ok' | 'warn';
  fullscreen: 'pending' | 'ok' | 'fail';
  network: 'pending' | 'ok' | 'warn';
  browser: 'pending' | 'ok' | 'fail';
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

/**
 * Proctored exam runner: pre-exam system checks (camera preview, mic level,
 * fullscreen, network, browser) → identity confirmation → secure delivery
 * (one question at a time, in-memory answers only — never localStorage) →
 * client proctoring (fullscreen exits with 3-strike auto-submit, blur,
 * copy/paste blocks, right-click block, devtools heuristic, feed-loss
 * detection) → submit → result page.
 */
export function ExamRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checks');
  const [meta, setMeta] = useState<ExamMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckState>({ camera: 'pending', mic: 'pending', fullscreen: 'pending', network: 'pending', browser: 'pending' });
  const [micLevel, setMicLevel] = useState(0);
  const [networkNote, setNetworkNote] = useState('');
  const [identity, setIdentity] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [session, setSession] = useState<ExamSession | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [showFsWarning, setShowFsWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<{ ctx: AudioContext; raf: number } | null>(null);
  const attemptRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>('checks');
  const submittingRef = useRef(false);
  const lastDevtoolsLog = useRef(0);
  phaseRef.current = phase;

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioRef.current) {
      cancelAnimationFrame(audioRef.current.raf);
      audioRef.current.ctx.close().catch(() => {});
      audioRef.current = null;
    }
  }, []);

  useEffect(() => stopMedia, [stopMedia]);

  // ---- metadata ----
  useEffect(() => {
    fetch(`/api/exam/${examId}`)
      .then(async (res) => {
        const body = (await res.json()) as { success: boolean; data?: { exam: ExamMeta }; error?: { message: string } };
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load exam.');
        setMeta(body.data.exam);
      })
      .catch((e: unknown) => setMetaError(e instanceof Error ? e.message : 'Could not load exam.'));
  }, [examId]);

  // ---- system checks ----
  useEffect(() => {
    let cancelled = false;
    const set = (patch: Partial<CheckState>) => {
      if (!cancelled) setChecks((c) => ({ ...c, ...patch }));
    };
    // Browser compatibility
    const browserOk =
      typeof document !== 'undefined' &&
      !!document.documentElement.requestFullscreen &&
      typeof window.fetch === 'function' &&
      typeof window.crypto !== 'undefined';
    set({ browser: browserOk ? 'ok' : 'fail', fullscreen: document.fullscreenEnabled ? 'ok' : 'fail' });

    // Camera (+optional mic) with live preview
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        set({ camera: 'ok' });
        // Mic level meter (optional — warn, never block)
        try {
          const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (Ctx) {
            const ctx = new Ctx();
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            src.connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
              analyser.getByteFrequencyData(data);
              let sum = 0;
              for (let i = 0; i < data.length; i++) sum += data[i] ?? 0;
              if (!cancelled) setMicLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
              if (!cancelled) {
                const raf = requestAnimationFrame(tick);
                if (audioRef.current) audioRef.current.raf = raf;
                else audioRef.current = { ctx, raf };
              }
            };
            tick();
            set({ mic: 'ok' });
          } else {
            set({ mic: 'warn' });
          }
        } catch {
          set({ mic: 'warn' });
        }
      } catch {
        // Retry video-only: mic is optional.
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          set({ camera: 'ok', mic: 'warn' });
        } catch {
          set({ camera: 'fail', mic: 'warn' });
        }
      }
    })();

    // Network: latency probe + effective connection type
    (async () => {
      try {
        const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
        if (conn?.downlink !== undefined && conn.downlink < 1) {
          set({ network: 'warn' });
          if (!cancelled) setNetworkNote(`Measured ~${conn.downlink} Mbps (below 1 Mbps) — answers may sync slowly.`);
          return;
        }
        const t0 = performance.now();
        const res = await fetch(`/api/catalog/tracks?_=${Date.now()}`, { cache: 'no-store' });
        const ms = performance.now() - t0;
        await res.text();
        if (cancelled) return;
        if (!res.ok || ms > 4000) {
          set({ network: 'warn' });
          setNetworkNote(`Slow link (${Math.round(ms)} ms probe) — keep this tab focused; answers submit at the end.`);
        } else {
          set({ network: 'ok' });
          setNetworkNote(`Link OK (${Math.round(ms)} ms probe${conn?.effectiveType ? `, ${conn.effectiveType}` : ''}).`);
        }
      } catch {
        set({ network: 'warn' });
        if (!cancelled) setNetworkNote('Network probe failed — check connectivity before starting.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const checksBlocking = checks.camera !== 'ok' || checks.fullscreen !== 'ok' || checks.browser !== 'ok';

  // ---- event sender ----
  const sendEvent = useCallback(
    async (type: string, metadata: Record<string, unknown> = {}) => {
      const attemptId = attemptRef.current;
      if (!attemptId) return null;
      try {
        const res = await fetch(`/api/exam/${examId}/attempt/${attemptId}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, metadata }),
          keepalive: true,
        });
        const body = (await res.json()) as {
          success: boolean;
          data?: { warnings: number; riskScore: number; integrityFlag: string; autoSubmit: boolean };
        };
        return body.success && body.data ? body.data : null;
      } catch {
        return null;
      }
    },
    [examId]
  );

  // ---- submit ----
  const submit = useCallback(
    async (auto: boolean) => {
      if (submittingRef.current || !attemptRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      try {
        await document.exitFullscreen().catch(() => {});
      } catch {
        /* already windowed */
      }
      try {
        const res = await fetch(`/api/exam/${examId}/attempt/${attemptRef.current}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, timeSpentSeconds: session ? session.timeLimitMinutes * 60 - secondsLeft : 0, auto }),
          keepalive: true,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: { message: string } } | null;
          throw new Error(body?.error?.message ?? 'Submission failed.');
        }
        stopMedia();
        router.push(`/exam/${examId}/result?attempt=${attemptRef.current}`);
      } catch {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [answers, examId, router, secondsLeft, session, stopMedia]
  );
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // ---- proctoring listeners (active while running) ----
  useEffect(() => {
    if (phase !== 'running') return;
    const onFullscreenChange = async () => {
      if (document.fullscreenElement || phaseRef.current !== 'running' || submittingRef.current) return;
      const info = await sendEvent('FULLSCREEN_EXIT', { at: new Date().toISOString() });
      const count = info?.warnings ?? 0;
      setWarnings(count);
      if (info?.autoSubmit) {
        submitRef.current(true);
      } else {
        setShowFsWarning(true);
      }
    };
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === 'running' && !submittingRef.current) {
        sendEvent('TAB_BLUR', { at: new Date().toISOString() });
      }
    };
    const onBlur = () => {
      if (phaseRef.current === 'running' && !submittingRef.current) sendEvent('WINDOW_BLUR', { at: new Date().toISOString() });
    };
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      sendEvent('COPY_ATTEMPT', {});
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      sendEvent('PASTE_ATTEMPT', {});
    };
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      sendEvent('COPY_ATTEMPT', { kind: 'cut' });
    };
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      sendEvent('RIGHT_CLICK', {});
    };
    const onOnline = () => sendEvent('NETWORK_DROP', { back: true });
    const onOffline = () => sendEvent('NETWORK_DROP', { back: false });
    const devTimer = window.setInterval(() => {
      const open = window.outerWidth - window.innerWidth > 170 || window.outerHeight - window.innerHeight > 170;
      if (open && Date.now() - lastDevtoolsLog.current > 30000 && phaseRef.current === 'running' && !submittingRef.current) {
        lastDevtoolsLog.current = Date.now();
        sendEvent('DEVTOOLS_SUSPECTED', { dw: window.outerWidth - window.innerWidth, dh: window.outerHeight - window.innerHeight });
      }
    }, 2500);
    const track = streamRef.current?.getVideoTracks()[0];
    const onTrackEnd = () => sendEvent('NO_FACE', { reason: 'camera-track-ended' });
    const onTrackMute = () => sendEvent('NO_FACE', { reason: 'camera-track-muted' });
    track?.addEventListener('ended', onTrackEnd);
    track?.addEventListener('mute', onTrackMute);

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.clearInterval(devTimer);
      track?.removeEventListener('ended', onTrackEnd);
      track?.removeEventListener('mute', onTrackMute);
    };
  }, [phase, sendEvent]);

  // ---- timers ----
  useEffect(() => {
    if (phase !== 'running' || !session) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          submitRef.current(true);
          return 0;
        }
        return s - 1;
      });
      setQuestionElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, session]);

  // Per-question soft timer: auto-advance when configured.
  useEffect(() => {
    if (phase !== 'running' || !session?.perQuestionSeconds || !session.questions.length) return;
    if (questionElapsed >= session.perQuestionSeconds && index < session.questions.length - 1) {
      setIndex((i) => i + 1);
      setQuestionElapsed(0);
    }
  }, [questionElapsed, phase, session, index]);

  useEffect(() => {
    setQuestionElapsed(0);
  }, [index]);

  // ---- start flow ----
  const begin = async () => {
    if (!meta || !identity) return;
    setStarting(true);
    setStartError(null);
    try {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        throw new Error('Fullscreen was blocked by the browser — allow it and try again.');
      }
      const startRes = await fetch(`/api/exam/${examId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityConfirmed: true }),
      });
      const startBody = (await startRes.json()) as { success: boolean; data?: { attempt: { attemptId: string } }; error?: { message: string } };
      if (!startRes.ok || !startBody.success || !startBody.data) throw new Error(startBody.error?.message ?? 'Could not start attempt.');
      attemptRef.current = startBody.data.attempt.attemptId;
      const qRes = await fetch(`/api/exam/${examId}/questions?attemptId=${startBody.data.attempt.attemptId}`);
      const qBody = (await qRes.json()) as { success: boolean; data?: ExamSession; error?: { message: string } };
      if (!qRes.ok || !qBody.success || !qBody.data) throw new Error(qBody.error?.message ?? 'Could not load questions.');
      setSession(qBody.data);
      setSecondsLeft(qBody.data.timeLimitMinutes * 60);
      setAnswers({});
      setIndex(0);
      setWarnings(0);
      setPhase('running');
    } catch (e) {
      try {
        await document.exitFullscreen().catch(() => {});
      } catch {
        /* noop */
      }
      setStartError(e instanceof Error ? e.message : 'Could not start exam.');
    } finally {
      setStarting(false);
    }
  };

  const setAnswer = (qid: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
  };

  if (metaError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h1 className="font-display mt-3 text-2xl font-black text-[#0b1e36] dark:text-white">Exam unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{metaError}</p>
      </div>
    );
  }
  if (!meta) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10" aria-busy="true" aria-label="Loading exam">
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }
  if (meta.attemptsLeft <= 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center">
        <AlarmClock className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
        <h1 className="font-display mt-3 text-2xl font-black text-[#0b1e36] dark:text-white">No attempts remaining</h1>
        <p className="mt-2 text-sm text-slate-500">
          You have used all {meta.maxAttempts} attempt(s) for “{meta.title}”. Contact your trainer for a reset.
        </p>
      </div>
    );
  }

  const current = session?.questions[index] ?? null;
  const answeredCount = session?.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '' && (answers[q.id] as unknown[]).length !== 0).length ?? 0;
  const lowTime = secondsLeft <= 300;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      {phase !== 'running' && (
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#9a7224] dark:text-[#dfb76c]">
          Proctored assessment • {meta.courseCode}
          {meta.moduleCode ? ` • ${meta.moduleCode}` : ''}
        </p>
      )}
      <h1 className="font-display mt-2 text-2xl font-black text-[#0b1e36] sm:text-3xl dark:text-white">{meta.title}</h1>

      {phase === 'checks' && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section aria-label="System checks" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Step 1 — System check</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-white/10">
              <video ref={videoRef} muted playsInline aria-label="Camera preview" className="aspect-video w-full object-cover" />
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <CheckRow icon={<Camera className="h-4 w-4" aria-hidden="true" />} label="Camera" state={checks.camera} detail={checks.camera === 'fail' ? 'Allow camera access and retry — it is required.' : 'Live preview active'} />
              <li>
                <CheckRow icon={<Mic className="h-4 w-4" aria-hidden="true" />} label="Microphone (optional)" state={checks.mic === 'warn' ? 'warn' : checks.mic} detail={checks.mic === 'ok' ? 'Level detected' : 'Unavailable — you may continue without it'} />
                {checks.mic === 'ok' && (
                  <div className="ml-9 mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" aria-hidden="true">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${micLevel}%` }} />
                  </div>
                )}
              </li>
              <CheckRow icon={<Monitor className="h-4 w-4" aria-hidden="true" />} label="Fullscreen" state={checks.fullscreen} detail={checks.fullscreen === 'ok' ? 'Supported — the exam locks to fullscreen' : 'Not available in this browser'} />
              <CheckRow icon={<Wifi className="h-4 w-4" aria-hidden="true" />} label="Network" state={checks.network} detail={networkNote || 'Probing…'} />
            </ul>
            <button
              type="button"
              onClick={() => setPhase('identity')}
              disabled={checksBlocking}
              className="mt-5 w-full rounded-xl bg-[#0b1e36] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
            >
              {checksBlocking ? 'Resolve the required checks to continue' : 'Continue to identity confirmation'}
            </button>
          </section>
          <section aria-label="Exam rules" className="h-fit rounded-2xl border border-[#c59b48]/40 bg-[#c59b48]/10 p-5 text-sm dark:bg-[#c59b48]/5">
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Before you begin</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700 dark:text-slate-200">
              <li>{meta.questionCount} question(s) • {meta.timeLimitMinutes} minutes • pass {meta.passingScore}% • {meta.attemptsLeft} attempt(s) left.</li>
              <li>Questions and options are shuffled per attempt; copy, paste and right-click are blocked and logged.</li>
              <li>Leaving fullscreen counts as a warning — 3 warnings auto-submit the exam.</li>
              <li>Answers live only in memory; nothing is stored in this browser.</li>
            </ul>
          </section>
        </div>
      )}

      {phase === 'identity' && (
        <section aria-label="Identity confirmation" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1e36]/60">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Step 2 — Confirm your identity</h2>
          <dl className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
            {[
              ['Candidate', meta.traineeName],
              ['Station', meta.traineeStation ?? '—'],
              ['Exam', meta.title],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-slate-500">{k}</dt>
                <dd className="text-right font-bold text-slate-800 dark:text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-[#c59b48] dark:border-white/15">
            <input type="checkbox" checked={identity} onChange={(e) => setIdentity(e.target.checked)} className="mt-1 h-4 w-4 accent-[#c59b48]" />
            I confirm I am {meta.traineeName} and I accept proctored conditions (fullscreen lock, activity logging).
          </label>
          {startError && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" role="alert">
              {startError}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setPhase('checks')}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:border-slate-300 dark:border-white/15 dark:text-slate-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={begin}
              disabled={!identity || starting}
              className="flex-1 rounded-xl bg-[#c59b48] px-5 py-3 text-sm font-extrabold text-[#0b1e36] hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1e36] disabled:opacity-50"
            >
              {starting ? 'Starting… (entering fullscreen)' : 'Start exam now'}
            </button>
          </div>
        </section>
      )}

      {phase === 'running' && session && current && (
        <div className="mt-4">
          {/* Timer bar */}
          <div className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${lowTime ? 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1e36]/60'}`} role="timer" aria-label="Time remaining" aria-live="off">
            <AlarmClock className={`h-5 w-5 ${lowTime ? 'text-rose-500' : 'text-[#c59b48]'}`} aria-hidden="true" />
            <span className={`font-mono text-xl font-black ${lowTime ? 'text-rose-600 dark:text-rose-400' : 'text-[#0b1e36] dark:text-white'}`}>
              {formatCountdown(secondsLeft)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Q{index + 1}/{session.questions.length} • {answeredCount} answered
              {session.perQuestionSeconds ? ` • ~${session.perQuestionSeconds}s per question` : ''}
              {warnings > 0 && <span className="ml-2 font-black text-amber-600">• {warnings}/3 fullscreen warnings</span>}
            </span>
            <span className="ml-auto flex gap-1.5">
              {!confirmSubmit ? (
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(true)}
                  disabled={submitting}
                  className="rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
                >
                  Submit exam
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => submit(false)}
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting…' : 'Confirm submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSubmit(false)}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 dark:border-white/15 dark:text-slate-300"
                  >
                    Keep writing
                  </button>
                </>
              )}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* Palette */}
            <nav aria-label="Question palette" className="h-fit rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1e36]/60">
              <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-4">
                {session.questions.map((q, i) => {
                  const answered = answers[q.id] !== undefined && answers[q.id] !== '' && (answers[q.id] as unknown[]).length !== 0;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Question ${i + 1}${answered ? ' (answered)' : ''}`}
                      aria-current={i === index ? 'true' : undefined}
                      className={`flex h-9 items-center justify-center rounded-lg font-mono text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                        i === index
                          ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]'
                          : answered
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Question */}
            <article aria-label={`Question ${index + 1}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#0b1e36]/60">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
                Question {index + 1} of {session.questions.length} • {current.type.replace(/_/g, ' ')} • {current.weight} mark{current.weight === 1 ? '' : 's'}
              </p>
              <h2 className="mt-2 text-base font-bold leading-relaxed text-slate-900 sm:text-lg dark:text-white">{current.text}</h2>

              {current.type === 'SHORT_ANSWER' || current.options.length <= 1 ? (
                <div className="mt-4">
                  <label htmlFor="short-answer" className="sr-only">Your answer</label>
                  <textarea
                    id="short-answer"
                    value={(answers[current.id] as string) ?? ''}
                    onChange={(e) => setAnswer(current.id, e.target.value)}
                    rows={5}
                    maxLength={5000}
                    placeholder="Type your answer… (trainer-graded)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Short answers are graded by your trainer — the rest auto-scores instantly.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2" role="group" aria-label="Answer options">
                  {current.options.map((o) => {
                    const multi = current.type === 'MULTI_CHOICE';
                    const picked = multi
                      ? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(o.id)
                      : answers[current.id] === o.id;
                    return (
                      <label
                        key={o.id}
                        className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors hover:border-[#c59b48]/70 focus-within:ring-2 focus-within:ring-[#c59b48] dark:border-white/10 dark:hover:border-[#c59b48]/50"
                      >
                        <input
                          type={multi ? 'checkbox' : 'radio'}
                          name={`exam-${current.id}`}
                          checked={picked}
                          onChange={() => {
                            if (multi) {
                              const cur = Array.isArray(answers[current.id]) ? [...(answers[current.id] as string[])] : [];
                              setAnswer(current.id, cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id]);
                            } else {
                              setAnswer(current.id, o.id);
                            }
                          }}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#0b1e36] dark:accent-[#c59b48]"
                        />
                        <span className="text-slate-700 dark:text-slate-200">{o.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 disabled:opacity-40 dark:border-white/15 dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Prev
                </button>
                {index < session.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i + 1)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0b1e36] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500">Last question — review the palette, then submit.</span>
                )}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Fullscreen warning modal */}
      {showFsWarning && phase === 'running' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true" aria-labelledby="fs-warn-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-[#0b1e36]">
            <TriangleAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
            <h2 id="fs-warn-title" className="font-display mt-2 text-xl font-black text-[#0b1e36] dark:text-white">
              Fullscreen exited — warning {warnings}/3
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Return to fullscreen immediately. At 3 warnings the exam auto-submits and the attempt is flagged.
            </p>
            <button
              type="button"
              onClick={() => {
                document.documentElement.requestFullscreen().catch(() => {});
                setShowFsWarning(false);
              }}
              className="mt-4 w-full rounded-xl bg-[#0b1e36] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
            >
              Return to fullscreen
            </button>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="status" aria-label="Submitting exam">
          <span className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin text-[#c59b48]" aria-hidden="true" />
            Submitting and grading…
          </span>
        </div>
      )}
    </div>
  );
}

function CheckRow({ icon, label, state, detail }: { icon: React.ReactNode; label: string; state: 'pending' | 'ok' | 'warn' | 'fail'; detail: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
          state === 'ok' ? 'bg-emerald-100 text-emerald-600' : state === 'warn' ? 'bg-amber-100 text-amber-600' : state === 'fail' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {state === 'pending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-slate-700 dark:text-slate-200">
          {label}
          <span className={`ml-2 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${state === 'ok' ? 'bg-emerald-100 text-emerald-700' : state === 'warn' ? 'bg-amber-100 text-amber-700' : state === 'fail' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
            {state === 'ok' ? 'pass' : state}
          </span>
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{detail}</span>
      </span>
    </li>
  );
}
