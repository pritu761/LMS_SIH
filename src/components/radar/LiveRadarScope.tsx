'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarNode, PolarimetricProduct } from '@/types/radar';
import {
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Compass,
  Layers,
  Flame,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

interface LiveRadarScopeProps {
  node: RadarNode;
  onOpenDiagnostics: () => void;
}

export function LiveRadarScope({ node, onOpenDiagnostics }: LiveRadarScopeProps) {
  const [selectedProduct, setSelectedProduct] = useState<PolarimetricProduct>('Z');
  const [elevationCut, setElevationCut] = useState<number>(node.elevationDeg || 0.5);
  const [sweepSpeed, setSweepSpeed] = useState<number>(4); // seconds per 360 deg
  const [azimuthAngle, setAzimuthAngle] = useState<number>(node.azimuthDeg || 120);

  useEffect(() => {
    const interval = setInterval(() => {
      setAzimuthAngle((prev) => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const getProductDetails = (prod: PolarimetricProduct) => {
    switch (prod) {
      case 'Z':
        return {
          title: 'Reflectivity Factor (Z)',
          unit: 'dBZ',
          val: `${node.reflectivityDbz} dBZ`,
          color: '#ea580c',
          desc: 'Quantifies echo intensity and hydrometeor precipitation rate.',
        };
      case 'V':
        return {
          title: 'Doppler Radial Velocity (V)',
          unit: 'm/s',
          val: `${node.velocityMs > 0 ? '+' : ''}${node.velocityMs} m/s`,
          color: '#38bdf8',
          desc: 'Mean radial motion towards (negative/blue) or away from radar (positive/red).',
        };
      case 'ZDR':
        return {
          title: 'Differential Reflectivity (ZDR)',
          unit: 'dB',
          val: `${node.zdrDb > 0 ? '+' : ''}${node.zdrDb} dB`,
          color: '#c59b48',
          desc: 'Measure of oblateness for hydrometeor shape discrimination (rain vs hail).',
        };
      case 'CC':
        return {
          title: 'Correlation Coefficient (ρ_HV)',
          unit: 'ratio',
          val: `${node.correlationCoeff}`,
          color: '#34d399',
          desc: 'Uniformity of scattering particles; drops <0.90 in giant hail or debris.',
        };
      case 'KDP':
        return {
          title: 'Specific Differential Phase (KDP)',
          unit: '°/km',
          val: `${node.kdpDegKm} °/km`,
          color: '#a855f7',
          desc: 'Liquid water path metric unaffected by partial beam blockage or radar calibration.',
        };
    }
  };

  const productInfo = getProductDetails(selectedProduct);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#060a14] via-[#091222] to-[#040810] border border-[#c59b48]/30 p-5 sm:p-6 shadow-2xl space-y-6 text-white font-sans relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c59b48]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#c59b48]/15 border border-[#c59b48]/40 text-[#dfb76c] font-mono text-[10px] font-bold uppercase tracking-wider">
              DUAL-POL PPI POLAR SCOPE
            </span>
            <span className="text-xs font-mono text-slate-400">Node: {node.code}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
            {node.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0b1e36] to-[#142e50] border border-[#c59b48]/50 hover:border-[#c59b48] text-xs font-mono font-bold text-[#dfb76c] transition-all shadow-md hover:scale-105"
          >
            <Zap className="h-3.5 w-3.5 text-[#c59b48]" />
            <span>Run Station Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scope View (Left) & Live Polarimetric Channels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Col: High-Tech Circular PPI Scope (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-[#02050b] border-2 border-cyan-500/30 p-2 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden">
            {/* Azimuth Compass Marks (0°, 90°, 180°, 270°) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono text-cyan-500/60 font-bold pointer-events-none">
              <span>270° W</span>
              <span>090° E</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-between py-2 text-[10px] font-mono text-cyan-500/60 font-bold pointer-events-none">
              <span>000° N</span>
              <span>180° S</span>
            </div>

            {/* Concentric Range Rings (50km, 100km, 150km, 250km) */}
            <div className="absolute w-[25%] h-[25%] rounded-full border border-cyan-500/30 pointer-events-none" />
            <div className="absolute w-[50%] h-[50%] rounded-full border border-cyan-500/40 pointer-events-none" />
            <div className="absolute w-[75%] h-[75%] rounded-full border border-cyan-500/30 pointer-events-none" />
            <div className="absolute w-[98%] h-[98%] rounded-full border border-cyan-500/50 pointer-events-none" />

            {/* Range distance markings */}
            <span className="absolute top-[26%] text-[9px] font-mono text-cyan-400/70">50 km</span>
            <span className="absolute top-[13%] text-[9px] font-mono text-cyan-400/70">150 km</span>
            <span className="absolute top-[3%] text-[9px] font-mono text-cyan-400/70">250 km</span>

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/30 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/30 pointer-events-none" />

            {/* Simulated Weather Echoes according to selected product */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <radialGradient id="productEchoGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={productInfo.color} stopOpacity="0.85" />
                  <stop offset="60%" stopColor={productInfo.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={productInfo.color} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Convective core echo */}
              <circle cx="260" cy="140" r="48" fill="url(#productEchoGrad)" filter="blur(6px)" />
              <circle cx="280" cy="120" r="28" fill="#ffffff" opacity="0.4" filter="blur(3px)" />

              {/* Stratiform rain band */}
              <path
                d="M 140 240 Q 200 310 320 280 Q 240 330 140 240 Z"
                fill={productInfo.color}
                opacity="0.55"
                filter="blur(5px)"
              />

              {/* Fine line boundary */}
              <path
                d="M 60 160 Q 120 180 180 130"
                stroke={productInfo.color}
                strokeWidth="4"
                fill="none"
                opacity="0.6"
                filter="blur(2px)"
              />
            </svg>

            {/* Rotating Radar Antenna Sweep Line */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: sweepSpeed, ease: 'linear' }}
            >
              {/* Sweep Phosphor Glow Trail */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-24 origin-top-left -translate-y-full"
                style={{
                  background: `conic-gradient(from 270deg, transparent 270deg, ${productInfo.color}40 330deg, ${productInfo.color} 360deg)`,
                }}
              />
              {/* Crisp beam line */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left -translate-y-1/2 shadow-lg"
                style={{ backgroundColor: productInfo.color }}
              />
            </motion.div>

            {/* Center Radar Transmitter Dome */}
            <div className="relative z-10 h-4 w-4 rounded-full bg-[#0b1e36] border-2 border-[#c59b48] shadow-lg flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Dynamic Azimuth HUD Readout */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-cyan-300">
              AZ: {String(azimuthAngle).padStart(3, '0')}° • EL: {elevationCut}°
            </div>
          </div>
        </div>

        {/* Right Col: Channel Selector & Live Polarimetric Diagnostics (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual-Pol Product Channel Switcher */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-200 flex items-center justify-between">
              <span>POLARIMETRIC PRODUCT CHANNEL</span>
              <span className="text-[#dfb76c] font-bold">Dual-Pol Active</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15">
              {(['Z', 'V', 'ZDR', 'CC', 'KDP'] as PolarimetricProduct[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProduct(p)}
                  className={`py-2 rounded-xl text-xs font-mono font-black transition-all ${
                    selectedProduct === p
                      ? 'bg-[#0b1e36] text-[#dfb76c] border border-[#c59b48] shadow-lg scale-105'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active Product Info Card */}
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">{productInfo.title}</span>
              <span
                className="text-sm font-black font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${productInfo.color}25`,
                  borderColor: `${productInfo.color}60`,
                  color: productInfo.color,
                }}
              >
                {productInfo.val}
              </span>
            </div>
            <p className="text-[11px] text-slate-100 leading-relaxed font-sans">{productInfo.desc}</p>
          </div>

          {/* Hydrometeor Classification Badge */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 to-[#0b1e36]/60 border border-[#c59b48]/40 p-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#dfb76c] font-bold">
              <span>HYDROMETEOR CLASSIFICATION (HCA)</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Dual-Pol Verified
              </span>
            </div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>{node.hydrometeorType}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-200">
              Operating Mode: <span className="text-white font-bold">{node.operatingMode}</span>
            </div>
          </div>

          {/* Hardware & Beam Parameters Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
              <div className="text-slate-300 text-[10px] font-bold">Frequency & Band</div>
              <div className="text-white font-bold">{node.frequencyGhz} ({node.band})</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
              <div className="text-slate-300 text-[10px] font-bold">Peak Power (TX)</div>
              <div className="text-cyan-300 font-bold">{node.peakPowerKw} kW</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
              <div className="text-slate-300 text-[10px] font-bold">PRF / V_max</div>
              <div className="text-[#dfb76c] font-bold">{node.prfHz} Hz / ±{node.vMaxMs} m/s</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
              <div className="text-slate-300 text-[10px] font-bold">Active Trainees</div>
              <div className="text-purple-300 font-bold">{node.traineesConnected} Observers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
