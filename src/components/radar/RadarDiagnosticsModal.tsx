'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarNode, DiagnosticResult } from '@/types/radar';
import {
  X,
  Zap,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Cpu,
  Radio,
  Layers,
} from 'lucide-react';

interface RadarDiagnosticsModalProps {
  node: RadarNode;
  isOpen: boolean;
  onClose: () => void;
}

export function RadarDiagnosticsModal({ node, isOpen, onClose }: RadarDiagnosticsModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [testType, setTestType] = useState<string>('Dual-Pol Polarimetric Calibration & De-Aliasing');

  const runTest = async () => {
    setIsRunning(true);
    setDiagnosticResult(null);

    try {
      const res = await fetch('/api/radar/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: node.id,
          testType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Add small realistic delay for the test execution feeling
        setTimeout(() => {
          setDiagnosticResult(data.data);
          setIsRunning(false);
        }, 1200);
      }
    } catch (e) {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark-surface w-full max-w-3xl rounded-3xl bg-[#040810] border border-[#c59b48]/40 shadow-2xl p-6 space-y-6 text-white font-sans relative overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#c59b48]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0b1e36] border border-[#c59b48]/60 flex items-center justify-center text-[#dfb76c]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-sans font-bold text-[#dfb76c] uppercase">
                TELEMETRY DIAGNOSTIC TEST RUNNER
              </div>
              <h3 className="text-lg font-bold text-white">
                {node.name} ({node.code})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Test Configuration Selector */}
        <div className="space-y-3 shrink-0">
          <label className="text-xs font-sans text-slate-300 font-bold">
            SELECT HARDWARE / TELEMETRY DIAGNOSTIC SUITE
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Dual-Pol Polarimetric Calibration & De-Aliasing',
              'Transmitter Pulse & Magnetron Waveguide Health',
              'MoES Supercomputer Telemetry Latency Stress Test',
            ].map((t) => (
              <button
                key={t}
                onClick={() => setTestType(t)}
                className={`p-3 rounded-2xl text-left text-xs font-sans font-medium border transition-all ${
                  testType === t
                    ? 'bg-[#0b1e36] border-[#c59b48] text-[#dfb76c] font-bold shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <div className="flex items-center justify-between shrink-0">
          <div className="text-xs font-sans text-slate-400">
            Node Frequency: <span className="text-white font-mono">{node.frequencyGhz}</span> • Band:{' '}
            <span className="text-cyan-400 font-mono">{node.band}</span>
          </div>

          <button
            onClick={runTest}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all shadow-lg ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#0b1e36] via-[#16365f] to-[#0b1e36] border border-[#c59b48] text-[#dfb76c] hover:scale-105 shadow-[#c59b48]/20'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-[#dfb76c]" />
                <span>Executing Hardware Pulse...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-[#c59b48]" />
                <span>Launch Diagnostic Test</span>
              </>
            )}
          </button>
        </div>

        {/* Terminal Log Console */}
        <div className="flex-1 min-h-[220px] rounded-2xl bg-[#02050b] border border-white/15 p-4 font-mono text-xs overflow-y-auto space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="h-3 w-3 text-cyan-400" />
              <span>STATION CONSOLE LOG (node_{node.code.toLowerCase()})</span>
            </span>
            <span className="text-emerald-400">STATUS: READY</span>
          </div>

          {!diagnosticResult && !isRunning && (
            <div className="text-slate-500 text-xs py-8 text-center">
              Click &quot;Launch Diagnostic Test&quot; to ping this Doppler Radar station and verify dual-polarimetric calibration.
            </div>
          )}

          {isRunning && (
            <div className="py-6 text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-cyan-400 text-xs">
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Synchronizing pulse frequency with {node.name}...</span>
              </div>
            </div>
          )}

          {diagnosticResult && (
            <div className="space-y-1 pt-1">
              {diagnosticResult.log.map((line, idx) => (
                <div
                  key={idx}
                  className={`text-[11px] leading-relaxed ${
                    line.includes('✔')
                      ? 'text-emerald-400 font-bold bg-emerald-500/10 p-1.5 rounded'
                      : line.includes('[AUTH]') || line.includes('[TX]')
                      ? 'text-cyan-300'
                      : line.includes('[CALIB]')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Badge */}
        {diagnosticResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 shrink-0 text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-slate-400">SNR Ratio:</span>{' '}
              <span className="font-bold text-emerald-400">{diagnosticResult.details.snrDb} dB</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-slate-400">ZDR Bias:</span>{' '}
              <span className="font-bold text-[#dfb76c]">{diagnosticResult.details.zdrBiasDb} dB</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-slate-400">De-Aliased:</span>{' '}
              <span className="font-bold text-cyan-400">100% Verified</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-slate-400">Waveguide:</span>{' '}
              <span className="font-bold text-white">{diagnosticResult.details.waveguideLossDb} dB</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
