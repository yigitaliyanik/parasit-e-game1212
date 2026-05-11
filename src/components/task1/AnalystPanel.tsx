"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, X, Cpu, Crosshair } from "lucide-react";
import { ALL_DISTRICTS, GRID_TRANSFORMER_IDS } from "@/lib/types";

interface AnalystPanelProps {
  foundIds?: string[];
  onSubmitId?: (id: string) => Promise<boolean>;
}

// Road network connecting districts — decorative SVG paths
const ROAD_PATHS = [
  // Main horizontal artery
  "M 5,50 L 95,50",
  // Main vertical artery
  "M 50,5 L 50,95",
  // Diagonal connectors
  "M 18,18 L 35,12",
  "M 35,12 L 50,48",
  "M 50,48 L 88,45",
  "M 50,48 L 62,85",
  "M 12,50 L 50,48",
  "M 22,80 L 50,48",
  "M 50,48 L 82,82",
  "M 18,18 L 12,50",
  "M 22,80 L 62,85",
  "M 62,85 L 82,82",
  "M 88,45 L 82,82",
  "M 35,12 L 88,45",
];

// Block outlines — decorative building clusters
const BLOCKS = [
  { x: 28, y: 28, w: 14, h: 10 },
  { x: 58, y: 20, w: 12, h: 8 },
  { x: 68, y: 55, w: 10, h: 14 },
  { x: 32, y: 60, w: 16, h: 10 },
  { x: 40, y: 38, w: 8, h: 8 },
  { x: 72, y: 30, w: 10, h: 8 },
  { x: 14, y: 62, w: 8, h: 10 },
  { x: 75, y: 70, w: 10, h: 6 },
  { x: 42, y: 72, w: 12, h: 8 },
  { x: 8, y: 30, w: 6, h: 12 },
];

export default function AnalystPanel({ foundIds, onSubmitId }: AnalystPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<typeof ALL_DISTRICTS[0] | null>(null);

  const handleDistrictClick = (d: typeof ALL_DISTRICTS[0]) => {
    setSelectedDistrict(prev => prev?.id === d.id ? null : d);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <div className="p-3 bg-green-500/10 rounded border border-green-500/30 relative overflow-hidden">
          <MapIcon className="w-6 h-6 text-green-400 relative z-10" />
          <div className="absolute inset-0 bg-green-400/20 animate-ping" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Grid Analysis Terminal</h3>
          <p className="text-lg font-black text-green-400 uppercase tracking-wider">Ecoville Schematic</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-green-500/30 pl-4 flex-shrink-0">
        Listen to the Journalist&apos;s reports to identify compromised districts.
        Click a district node to reveal its <span className="text-green-400 font-bold">Transformer ID</span> and relay it to the Executive.
      </p>

      {/* ── Blueprint Map ── */}
      <div className="flex-grow bg-black border-2 border-green-500/20 rounded-xl relative overflow-hidden">
        {/* Radial center glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Scanning line animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-green-400/60 to-transparent absolute left-0"
            style={{
              animation: "scanLine 4s linear infinite",
            }}
          />
        </div>

        {/* SVG Map */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* 10x10 grid pattern */}
            <pattern id="blueprintGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="0.3" />
            </pattern>
            {/* Fine sub-grid */}
            <pattern id="subGrid" width="2" height="2" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="none" stroke="rgba(16,185,129,0.025)" strokeWidth="0.15" />
            </pattern>
            {/* Glow filter for nodes */}
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Brighter glow for hover/selected */}
            <filter id="nodeGlowBright">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background grids */}
          <rect width="100" height="100" fill="url(#subGrid)" />
          <rect width="100" height="100" fill="url(#blueprintGrid)" />

          {/* Outer frame */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="0.5" />
          <rect x="3.5" y="3.5" width="93" height="93" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="0.3" strokeDasharray="1,2" />

          {/* Decorative block outlines */}
          {BLOCKS.map((b, i) => (
            <rect key={`block-${i}`} x={b.x} y={b.y} width={b.w} height={b.h}
              fill="rgba(16,185,129,0.015)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.3" rx="0.5" />
          ))}

          {/* Road network */}
          {ROAD_PATHS.map((path, i) => (
            <path key={`road-${i}`} d={path}
              fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="0.5" strokeDasharray="2,1.5" />
          ))}

          {/* Axis labels */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
            <text key={`lbl-${v}`} x={v + 5} y="99" fontSize="1.8" fill="rgba(16,185,129,0.15)" textAnchor="middle" className="font-mono">{v}</text>
          ))}

          {/* ── District Nodes ── */}
          {ALL_DISTRICTS.map((d) => {
            const isSelected = selectedDistrict?.id === d.id;
            return (
              <g key={d.id} className="cursor-pointer" onClick={() => handleDistrictClick(d)}>
                {/* Outer pulse ring */}
                <circle cx={d.mapX} cy={d.mapY} r="4" fill="none" stroke="rgba(16,185,129,0.3)"
                  strokeWidth="0.3" className={isSelected ? "" : "animate-ping"} style={{ transformOrigin: `${d.mapX}px ${d.mapY}px`, animationDuration: "3s" }} />
                {/* District zone */}
                <circle cx={d.mapX} cy={d.mapY} r="5"
                  fill={isSelected ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.04)"}
                  stroke="none"
                  className="transition-all duration-300" />
                {/* Core node */}
                <circle cx={d.mapX} cy={d.mapY} r="2.2"
                  fill={isSelected ? "#10b981" : "rgba(16,185,129,0.5)"}
                  stroke="#10b981" strokeWidth="0.5"
                  filter={isSelected ? "url(#nodeGlowBright)" : "url(#nodeGlow)"}
                  className="transition-all duration-300" />
                {/* Inner dot */}
                <circle cx={d.mapX} cy={d.mapY} r="0.8"
                  fill={isSelected ? "#ffffff" : "#10b981"} className="transition-all duration-300" />

                {/* Hover target area (invisible) */}
                <circle cx={d.mapX} cy={d.mapY} r="6" fill="transparent" />

                {/* Label */}
                <text x={d.mapX} y={d.mapY + 8} fontSize="2.6" fill={isSelected ? "#10b981" : "rgba(16,185,129,0.6)"}
                  textAnchor="middle" className="font-mono uppercase transition-all duration-300"
                  style={{ fontWeight: isSelected ? 900 : 600, letterSpacing: "0.05em" }}>
                  {d.district}
                </text>
                {/* Coordinate tag */}
                <text x={d.mapX} y={d.mapY - 5} fontSize="1.6" fill="rgba(16,185,129,0.25)"
                  textAnchor="middle" className="font-mono">
                  [{d.mapX},{d.mapY}]
                </text>
              </g>
            );
          })}

          {/* Center crosshair */}
          <line x1="48" y1="50" x2="52" y2="50" stroke="rgba(16,185,129,0.2)" strokeWidth="0.3" />
          <line x1="50" y1="48" x2="50" y2="52" stroke="rgba(16,185,129,0.2)" strokeWidth="0.3" />

          {/* Title badge */}
          <text x="50" y="4.5" fontSize="2" fill="rgba(16,185,129,0.3)" textAnchor="middle" className="font-mono uppercase tracking-widest">
            Ecoville — Grid Schematic v4.2
          </text>
        </svg>

        {/* ── Terminal-style Popup ── */}
        <AnimatePresence>
          {selectedDistrict && (
            <motion.div
              key={selectedDistrict.id}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-4 left-4 right-4 z-50"
            >
              <div className="bg-black border border-green-500/60 rounded-lg p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden">
                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(transparent,transparent_2px,#10b981_2px,#10b981_3px)]" />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <Crosshair className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-500/60 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">Coordinate Secured</p>
                      <p className="text-green-200 font-black text-lg uppercase tracking-wide">{selectedDistrict.district}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-500/50 font-mono text-[9px] uppercase tracking-widest mb-1">Transformer_ID</p>
                    <p className="text-3xl font-black text-green-400 font-mono tracking-[0.15em] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                      {GRID_TRANSFORMER_IDS[selectedDistrict.district]}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedDistrict(null); }}
                    className="text-green-600 hover:text-green-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-green-500/20 flex items-center gap-2 relative z-10">
                  <Cpu className="w-3.5 h-3.5 text-green-500/50" />
                  <p className="text-green-400/60 font-mono text-[9px] uppercase tracking-[0.2em]">
                    Relay this code to the Executive immediately
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for scanning line */}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
