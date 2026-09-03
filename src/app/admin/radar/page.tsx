'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { IndiaRadarMap } from '@/components/radar/IndiaRadarMap';
import { LiveRadarScope } from '@/components/radar/LiveRadarScope';
import { RadarDiagnosticsModal } from '@/components/radar/RadarDiagnosticsModal';
import { ALL_38_DOPPLER_NODES, getNetworkSummary } from '@/lib/radarNetworkData';
import { RadarNode, RadarNetworkSummary } from '@/types/radar';
import {
  Radio,
  Activity,
  Zap,
  ShieldCheck,
  Signal,
  Eye,
  Layers,
  Sparkles,
  Server,
  Globe,
  Users,
  Search,
  ArrowUpRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';

export default function DopplerRadarCommandCenterPage() {
  const [nodes, setNodes] = useState<RadarNode[]>(ALL_38_DOPPLER_NODES);
  const [selectedNode, setSelectedNode] = useState<RadarNode>(ALL_38_DOPPLER_NODES[0]);
  const [summary, setSummary] = useState<RadarNetworkSummary>(getNetworkSummary());
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [filterBand, setFilterBand] = useState<string>('ALL');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [lastSync, setLastSync] = useState<string>('Live');

  // Real-time dynamic polling to keep telemetry alive
  useEffect(() => {
    const fetchLiveTelemetry = async () => {
      try {
        const res = await fetch('/api/radar/nodes');
        const data = await res.json();
        if (data.success && data.nodes) {
          setNodes(data.nodes);
          setSummary(data.summary);
          // Keep selected node reference updated
          setSelectedNode((prev) => data.nodes.find((n: RadarNode) => n.id === prev.id) || data.nodes[0]);
          setLastSync(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // fallback to local data
      }
    };

    const interval = setInterval(fetchLiveTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTableNodes = nodes.filter((n) => {
    const matchQuery =
      n.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      n.city.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      n.code.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      n.state.toLowerCase().includes(searchTableQuery.toLowerCase());
    const matchBand = filterBand === 'ALL' || n.band === filterBand;
    return matchQuery && matchBand;
  });

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0 space-y-6">
        {/* Command Center Title Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#060a14] p-6 sm:p-8 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-lg shadow-[#0b1e36]/5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48] to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c59b48]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#0b1e36] text-[#dfb76c] border border-[#c59b48]/40 px-2.5 py-0.5 text-xs font-sans font-bold flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-[#c59b48] animate-pulse" />
                  NATIONAL RADAR TELEMETRY
                </span>
                <span className="text-xs font-sans text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  38 / 38 Nodes Synchronized
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#0b1e36] dark:text-white tracking-tight mt-1">
                National Doppler Weather Radar Network
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-1 leading-relaxed">
                Live polarimetric telemetry, PPI scans, Nyquist velocity de-aliasing, and automated hydrometeor classification across all 38 IMD radar stations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsDiagnosticsOpen(true)}
                className="btn-gold flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-[#0b1e36]" />
                <span>Station Diagnostics</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Live Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-slate-400">
              <span>ACTIVE RADAR NODES</span>
              <Radio className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-[#0b1e36] dark:text-white">
              38 / 38 <span className="text-xs font-bold text-emerald-500">100% ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              17 S-Band • 13 C-Band • 8 X-Band
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-slate-400">
              <span>AVG INGRESS LATENCY</span>
              <Activity className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {summary.avgLatencyMs} ms
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              P99 Latency: 19.8 ms via TLS 1.3
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-slate-400">
              <span>NATIONAL COVERAGE</span>
              <Globe className="h-4 w-4 text-[#c59b48]" />
            </div>
            <div className="text-2xl font-black text-[#0b1e36] dark:text-[#dfb76c]">
              3.28M km²
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Seamless Triangulated Radar Mosaic
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-4 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider text-slate-500 dark:text-slate-400">
              <span>TRAINEE OBSERVERS</span>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {summary.activeTraineeObservers} Connected
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              DRSTC & FTC Live Sim Channels
            </div>
          </div>
        </div>

        {/* Interactive India Map & Selected Station Scope */}
        <div className="space-y-6">
          <IndiaRadarMap
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={(node) => setSelectedNode(node)}
          />

          <LiveRadarScope
            node={selectedNode}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          />
        </div>

        {/* Live Incoming Radar Telemetry Packet Ticker */}
        <div className="rounded-2xl bg-[#030712] border border-cyan-500/20 p-4 space-y-2 font-mono text-xs text-white shadow-xl">
          <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
            <span className="flex items-center gap-2 text-cyan-300 font-bold">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>LIVE NATIONAL NOWCASTING INGRESS STREAM</span>
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY STREAM
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-slate-100 leading-snug">
              <span className="text-[#dfb76c] font-bold">[RMC Chennai]</span> Dual-Pol ZDR signature mapped • Forecaster score: 96%
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-slate-100 leading-snug">
              <span className="text-cyan-300 font-bold">[Alipore Kolkata]</span> Nor’wester squall line velocity de-aliased (V_max ±48 m/s)
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-slate-100 leading-snug">
              <span className="text-purple-300 font-bold">[Mausam Bhawan]</span> 38 / 38 stations synchronized with Pratyush HPC cluster
            </div>
          </div>
        </div>

        {/* All 38 Doppler Weather Radar Nodes Data Grid */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-6 space-y-4 shadow-lg shadow-[#0b1e36]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-lg font-bold text-[#0b1e36] dark:text-white">
                All 38 National Radar Station Directory
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Inspect operating parameters, frequency bands, transmit power, and active forecasters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter station..."
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-sans text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#c59b48] shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 text-xs font-sans">
                {['ALL', 'S-Band', 'C-Band', 'X-Band'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilterBand(b)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      filterBand === b
                        ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Station Code & Name</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Band / Freq</th>
                  <th className="py-3 px-3">TX Power / PRF</th>
                  <th className="py-3 px-3">Reflectivity</th>
                  <th className="py-3 px-3">Latency</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                {filteredTableNodes.map((node) => {
                  const isCurrent = selectedNode.id === node.id;
                  return (
                    <tr
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-[#0b1e36]/10 dark:bg-white/10 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[#c59b48] font-bold">{node.code}</span>
                          <span className="font-sans text-slate-900 dark:text-white font-medium">
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-sans">
                        {node.city}, {node.state}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            node.band === 'S-Band'
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                              : node.band === 'C-Band'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {node.band} ({node.frequencyGhz})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {node.peakPowerKw} kW / {node.prfHz} Hz
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {node.reflectivityDbz} dBZ
                        </span>
                      </td>
                      <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400">
                        {node.latencyMs} ms
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {node.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                            setIsDiagnosticsOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0b1e36] text-[#dfb76c] hover:bg-[#142e50] text-[10px] font-sans font-bold transition-all"
                        >
                          Test Node
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostics Modal */}
        <RadarDiagnosticsModal
          node={selectedNode}
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      </main>
    </div>
  );
}
