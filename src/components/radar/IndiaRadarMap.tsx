'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarNode, RadarBand, RadarRegion } from '@/types/radar';
import {
  Radio,
  Layers,
  Sparkles,
  Search,
  Filter,
  Eye,
  Info,
  Activity,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface IndiaRadarMapProps {
  nodes: RadarNode[];
  selectedNode: RadarNode;
  onSelectNode: (node: RadarNode) => void;
}

export function IndiaRadarMap({ nodes, selectedNode, onSelectNode }: IndiaRadarMapProps) {
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showEchoes, setShowEchoes] = useState<boolean>(true);

  // Map coordinates projection for India
  // Latitude: ~8°N to ~37°N
  // Longitude: ~68°E to ~97°E
  const minLat = 6.5;
  const maxLat = 37.5;
  const minLng = 67.0;
  const maxLng = 98.0;

  const projectCoord = (lat: number, lng: number) => {
    // Project into SVG 0-1000 x 0-1100 space
    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 980 + 60;
    return { x, y };
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchBand = selectedBand === 'ALL' || node.band === selectedBand;
      const matchRegion = selectedRegion === 'ALL' || node.region === selectedRegion;
      const matchQuery =
        !searchQuery ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBand && matchRegion && matchQuery;
    });
  }, [nodes, selectedBand, selectedRegion, searchQuery]);

  const getBandColor = (band: RadarBand) => {
    switch (band) {
      case 'S-Band':
        return '#38bdf8'; // Sky blue / Deep coastal
      case 'C-Band':
        return '#34d399'; // Emerald / Inland plains
      case 'X-Band':
        return '#f59e0b'; // Amber / High-altitude Himalayan
      default:
        return '#38bdf8';
    }
  };

  const getEchoColor = (dbz: number) => {
    if (dbz >= 60) return '#dc2626'; // Red / Extreme Hail
    if (dbz >= 50) return '#ea580c'; // Orange / Severe Convective
    if (dbz >= 40) return '#eab308'; // Yellow / Heavy Rain
    if (dbz >= 30) return '#22c55e'; // Green / Moderate Rain
    if (dbz >= 20) return '#06b6d4'; // Cyan / Light Rain
    return '#3b82f6'; // Blue / Drizzle
  };

  const selectedPos = projectCoord(selectedNode.lat, selectedNode.lng);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#060c16] via-[#091424] to-[#040810] border border-white/10 p-5 lg:p-6 shadow-2xl space-y-4 text-white font-sans relative overflow-hidden">
      {/* Background Ambience & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Filter Controls Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-sans font-black text-emerald-400 uppercase tracking-widest">
              Live National Radar Mosaic (38 Nodes)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            India Doppler Weather Radar (DWR) Grid
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Band Selector */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-xl p-1 text-xs font-sans font-medium">
            {['ALL', 'S-Band', 'C-Band', 'X-Band'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBand(b)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedBand === b
                    ? 'bg-[#0b1e36] text-[#dfb76c] border border-[#c59b48]/60 font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Toggle Switches */}
          <button
            onClick={() => setShowRangeRings(!showRangeRings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all ${
              showRangeRings
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold'
                : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Range Rings</span>
          </button>

          <button
            onClick={() => setShowEchoes(!showEchoes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all ${
              showEchoes
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Reflectivity Echoes</span>
          </button>
        </div>
      </div>

      {/* Search & Region Row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city (e.g., Chennai, Delhi, Mumbai, Cherrapunji)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#c59b48] transition-all font-sans"
          />
        </div>

        <div className="sm:col-span-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'Northern Himalayas', 'Bay of Bengal Coast', 'Arabian Sea Coast', 'Central & Plains', 'Northeast India'].map(
            (reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-sans font-medium border transition-all ${
                  selectedRegion === reg
                    ? 'bg-white/20 border-white/40 text-white font-bold'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
                }`}
              >
                {reg}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative z-10 w-full aspect-[4/3] sm:aspect-[16/10] bg-[#02050b] rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
        {/* SVG National Grid Map */}
        <svg
          viewBox="0 0 1000 1100"
          className="w-full h-full object-contain filter drop-shadow"
        >
          <defs>
            {/* National Land Gradient */}
            <linearGradient id="indiaLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b2444" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#103a6b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#081d38" stopOpacity="0.95" />
            </linearGradient>

            {/* Radar Radial Sweep Gradient */}
            <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Glowing selected station filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Border glow filter */}
            <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Oceanic Regional Labels */}
          <g fontFamily="monospace" fontWeight="bold" opacity="0.4" fill="#38bdf8" letterSpacing="4">
            <text x="90" y="750" fontSize="15" className="select-none">ARABIAN SEA</text>
            <text x="610" y="750" fontSize="15" className="select-none">BAY OF BENGAL</text>
            <text x="290" y="1045" fontSize="14" letterSpacing="6" className="select-none">INDIAN OCEAN</text>
            <text x="350" y="75" fontSize="12" letterSpacing="3" fill="#dfb76c" opacity="0.6" className="select-none">HIMALAYAN ARC</text>
          </g>

          {/* Complete Detailed Mainland India Vector Boundary */}
          <g>
            {/* Outer Glow Halo */}
            <path
              d="M 330 82 L 367 123 L 406 155 L 415 208 L 443 281 L 432 329 L 565 386 L 670 367 L 764 373 L 840 335 L 912 361 L 855 424 L 835 481 L 798 551 L 753 519 L 764 453 L 662 472 L 679 560 L 628 570 L 619 604 L 568 636 L 520 687 L 460 734 L 435 813 L 437 832 L 423 902 L 423 921 L 409 952 L 359 991 L 341 977 L 324 933 L 298 873 L 281 838 L 253 756 L 239 708 L 224 648 L 225 576 L 205 560 L 156 585 L 117 544 L 148 535 L 94 497 L 159 481 L 171 395 L 253 300 L 284 247 L 284 212 L 264 168 L 318 152 Z"
              fill="url(#indiaLandGradient)"
              stroke="#0284c7"
              strokeWidth="5"
              opacity="0.6"
              filter="url(#borderGlow)"
            />

            {/* Sharp Primary Boundary Stroke */}
            <path
              d="M 330 82 L 367 123 L 406 155 L 415 208 L 443 281 L 432 329 L 565 386 L 670 367 L 764 373 L 840 335 L 912 361 L 855 424 L 835 481 L 798 551 L 753 519 L 764 453 L 662 472 L 679 560 L 628 570 L 619 604 L 568 636 L 520 687 L 460 734 L 435 813 L 437 832 L 423 902 L 423 921 L 409 952 L 359 991 L 341 977 L 324 933 L 298 873 L 281 838 L 253 756 L 239 708 L 224 648 L 225 576 L 205 560 L 156 585 L 117 544 L 148 535 L 94 497 L 159 481 L 171 395 L 253 300 L 284 247 L 284 212 L 264 168 L 318 152 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Internal Regional Weather Cadre Demarcation Lines */}
          <g stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.5" fill="none">
            {/* Himalayan Foothill Arc */}
            <path d="M 284 212 Q 360 250 443 281" />
            {/* Gangetic Basin / Northern Plains */}
            <path d="M 253 300 Q 400 360 662 472" />
            {/* Central MP / Vindhya Ridge */}
            <path d="M 171 395 Q 360 450 568 636" />
            {/* Deccan Plateau */}
            <path d="M 224 648 Q 360 680 460 734" />
            {/* Southern Peninsula */}
            <path d="M 253 756 Q 340 790 435 813" />
            {/* Northeast Corridor */}
            <path d="M 670 367 L 764 453" />
          </g>

          {/* Andaman & Nicobar Islands */}
          <g fill="#0b2444" stroke="#38bdf8" strokeWidth="2" filter="url(#borderGlow)">
            <ellipse cx="788" cy="810" rx="9" ry="24" />
            <ellipse cx="790" cy="878" rx="10" ry="32" />
            <ellipse cx="792" cy="935" rx="8" ry="12" />
            <ellipse cx="802" cy="980" rx="9" ry="22" />
            <ellipse cx="808" cy="1025" rx="11" ry="16" />
          </g>

          {/* Lakshadweep Islands */}
          <g fill="#0b2444" stroke="#38bdf8" strokeWidth="1.5">
            <circle cx="215" cy="830" r="4.5" />
            <circle cx="210" cy="860" r="4.5" />
            <circle cx="205" cy="895" r="5" />
            <circle cx="208" cy="940" r="4.5" />
          </g>

          {/* Latitude & Longitude Coordinate Lines */}
          <g className="stroke-cyan-500/20" strokeWidth="0.8" strokeDasharray="3 4">
            <line x1="60" y1="200" x2="940" y2="200" />
            <line x1="60" y1="400" x2="940" y2="400" />
            <line x1="60" y1="600" x2="940" y2="600" />
            <line x1="60" y1="800" x2="940" y2="800" />
            <line x1="250" y1="60" x2="250" y2="1040" />
            <line x1="500" y1="60" x2="500" y2="1040" />
            <line x1="750" y1="60" x2="750" y2="1040" />
          </g>

          {/* Coordinate Labels */}
          <text x="70" y="205" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">32°N</text>
          <text x="70" y="405" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">24°N</text>
          <text x="70" y="605" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">16°N</text>
          <text x="70" y="805" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">8°N</text>
          <text x="255" y="1035" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">74°E</text>
          <text x="505" y="1035" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">82°E</text>
          <text x="755" y="1035" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">90°E</text>

          {/* Range Rings for Selected Station */}
          {showRangeRings && (
            <g className="transition-all duration-500">
              {/* 100 km Ring */}
              <circle
                cx={selectedPos.x}
                cy={selectedPos.y}
                r="35"
                fill="none"
                stroke={getBandColor(selectedNode.band)}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              {/* 250 km Ring */}
              <circle
                cx={selectedPos.x}
                cy={selectedPos.y}
                r="85"
                fill="none"
                stroke={getBandColor(selectedNode.band)}
                strokeWidth="1.2"
                opacity="0.7"
              />
              {/* 500 km Max Range Ring for S-Band */}
              {selectedNode.maxRangeKm >= 500 && (
                <circle
                  cx={selectedPos.x}
                  cy={selectedPos.y}
                  r="165"
                  fill="none"
                  stroke={getBandColor(selectedNode.band)}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
              )}
            </g>
          )}

          {/* Active 360° Rotating Radar Beam from Selected Station */}
          <g transform={`translate(${selectedPos.x}, ${selectedPos.y})`}>
            {/* Spinning beam animation */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            >
              {/* Sweeping Cone */}
              <path
                d="M 0 0 L 140 -40 A 150 150 0 0 1 150 0 Z"
                fill="url(#sweepGradient)"
                opacity="0.5"
              />
              <line x1="0" y1="0" x2="150" y2="0" stroke="#38bdf8" strokeWidth="2" />
            </motion.g>
          </g>

          {/* Weather Reflectivity Echo Clusters */}
          {showEchoes &&
            nodes.map((node) => {
              const pos = projectCoord(node.lat, node.lng);
              const color = getEchoColor(node.reflectivityDbz);
              const size = (node.reflectivityDbz / 70) * 24 + 10;
              return (
                <g key={`echo-${node.id}`} opacity="0.35">
                  <circle
                    cx={pos.x + 8}
                    cy={pos.y - 6}
                    r={size}
                    fill={color}
                    filter="blur(6px)"
                  />
                  <circle
                    cx={pos.x - 10}
                    cy={pos.y + 8}
                    r={size * 0.7}
                    fill={color}
                    filter="blur(4px)"
                  />
                </g>
              );
            })}

          {/* Radar Station Marker Pins (All 38 Nodes) */}
          {filteredNodes.map((node) => {
            const pos = projectCoord(node.lat, node.lng);
            const isSelected = selectedNode.id === node.id;
            const bandColor = getBandColor(node.band);

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode(node)}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Ping rings on all live stations */}
                <circle
                  r={isSelected ? 16 : 8}
                  fill={bandColor}
                  opacity={isSelected ? 0.25 : 0.12}
                  className="animate-pulse"
                />

                {isSelected && (
                  <circle
                    r="22"
                    fill="none"
                    stroke="#c59b48"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Radar Icon / Dot */}
                <circle
                  r={isSelected ? 6 : 4.5}
                  fill={isSelected ? '#c59b48' : bandColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1}
                  filter={isSelected ? 'url(#glow)' : undefined}
                />

                {/* City Label Badge */}
                <text
                  x="8"
                  y="3"
                  fill={isSelected ? '#dfb76c' : '#e2e8f0'}
                  fontSize={isSelected ? '12' : '10'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                  className="transition-all select-none group-hover:fill-cyan-300"
                >
                  {node.city}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Reflectivity Scale Legend */}
        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-2.5 space-y-1.5 text-[10px] font-mono z-20">
          <div className="text-white font-bold flex items-center justify-between gap-4">
            <span>Reflectivity (dBZ)</span>
            <span className="text-cyan-300">WMO Scale</span>
          </div>
          <div className="flex items-center h-3 w-48 rounded overflow-hidden border border-white/20">
            <div className="h-full flex-1 bg-[#3b82f6]" title="10-20 dBZ Drizzle" />
            <div className="h-full flex-1 bg-[#06b6d4]" title="20-30 dBZ Light Rain" />
            <div className="h-full flex-1 bg-[#22c55e]" title="30-40 dBZ Moderate" />
            <div className="h-full flex-1 bg-[#eab308]" title="40-50 dBZ Heavy" />
            <div className="h-full flex-1 bg-[#ea580c]" title="50-60 dBZ Convective" />
            <div className="h-full flex-1 bg-[#dc2626]" title="60-75 dBZ Hail Core" />
          </div>
          <div className="flex justify-between text-[9px] text-slate-200 font-bold">
            <span>15</span>
            <span>30</span>
            <span>45</span>
            <span>60</span>
            <span>75+</span>
          </div>
        </div>

        {/* Selected Station Quick Summary Overlay */}
        <div className="absolute top-3 left-3 bg-[#060e1c]/95 backdrop-blur-md border border-[#c59b48]/60 rounded-2xl p-3.5 space-y-2 text-xs font-mono max-w-xs z-20 shadow-2xl">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#dfb76c] font-black">{selectedNode.code}</span>
            <span className="text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {selectedNode.status}
            </span>
          </div>
          <div className="text-sm font-bold text-white leading-tight font-sans">
            {selectedNode.name}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px] border-t border-white/15 text-slate-200">
            <div>
              <span className="text-slate-400">Band:</span>{' '}
              <span className="font-bold text-white">{selectedNode.band}</span>
            </div>
            <div>
              <span className="text-slate-400">Range:</span>{' '}
              <span className="font-bold text-cyan-300">{selectedNode.maxRangeKm} km</span>
            </div>
            <div>
              <span className="text-slate-400">Reflectivity:</span>{' '}
              <span className="font-bold text-amber-300">{selectedNode.reflectivityDbz} dBZ</span>
            </div>
            <div>
              <span className="text-slate-400">Trainees:</span>{' '}
              <span className="font-bold text-purple-300">{selectedNode.traineesConnected} Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
