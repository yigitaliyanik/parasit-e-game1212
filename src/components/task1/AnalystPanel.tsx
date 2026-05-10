"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, X, Radar, Cpu } from "lucide-react";
import { GRID_TRANSFORMER_IDS } from "@/lib/types";

// Note: The Analyst no longer submits IDs. They just discover them and communicate them verbally.
interface AnalystPanelProps {
  foundIds?: string[]; // Kept for compatibility if passed
  onSubmitId?: (id: string) => Promise<boolean>; // Kept for compatibility if passed
}

const DISTRICTS = [
  { name: "Northgate", id: "northgate", x: 10, y: 10, w: 40, h: 40, path: "M10,10 L50,10 L50,50 L10,50 Z", color: "rgba(16, 185, 129, 0.4)", stroke: "#10b981", code: GRID_TRANSFORMER_IDS["Northgate"] },
  { name: "Eastend", id: "eastend", x: 50, y: 10, w: 40, h: 40, path: "M50,10 L90,10 L90,50 L50,50 Z", color: "rgba(16, 185, 129, 0.4)", stroke: "#10b981", code: GRID_TRANSFORMER_IDS["Eastend"] },
  { name: "Westbridge", id: "westbridge", x: 10, y: 50, w: 40, h: 40, path: "M10,50 L50,50 L50,90 L10,90 Z", color: "rgba(16, 185, 129, 0.4)", stroke: "#10b981", code: GRID_TRANSFORMER_IDS["Westbridge"] },
  { name: "Southside", id: "southside", x: 50, y: 50, w: 40, h: 40, path: "M50,50 L90,50 L90,90 L50,90 Z", color: "rgba(16, 185, 129, 0.4)", stroke: "#10b981", code: GRID_TRANSFORMER_IDS["Southside"] },
];

export default function AnalystPanel({}: AnalystPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<typeof DISTRICTS[0] | null>(null);

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
          <p className="text-lg font-black text-green-400 uppercase tracking-wider">Bird's Eye View</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-green-500/30 pl-4 flex-shrink-0">
        Listen to the Journalist's reports to identify the compromised districts. Click on a district in the map below to discover its <span className="text-green-400 font-bold">Transformer ID</span> and communicate it to the Executive.
      </p>

      {/* Interactive Map Section */}
      <div className="flex-grow bg-[#000500] border-2 border-green-500/20 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
        {/* Radar sweep effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full border border-green-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />
          <div className="w-full h-full rounded-full border border-green-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100" />
          <div className="w-full h-full rounded-full border border-green-500/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50" />
          <div className="w-[200%] h-[200%] bg-gradient-to-t from-green-500/10 to-transparent absolute top-1/2 left-1/2 origin-bottom-left animate-spin" style={{ animationDuration: '4s', transform: 'translateX(-50%) translateY(-50%)' }} />
        </div>

        <svg viewBox="0 0 100 100" className="w-full max-w-md h-auto drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10">
          <defs>
            <pattern id="gridPattern" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          
          <rect width="100" height="100" fill="url(#gridPattern)" />
          
          {/* Main frame */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1" />
          <rect x="8" y="8" width="84" height="84" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.5" />
          
          {DISTRICTS.map((d) => (
            <g key={d.id} className="cursor-pointer group" onClick={() => setSelectedDistrict(d)}>
              <path
                d={d.path}
                className="transition-all duration-300"
                fill="rgba(16, 185, 129, 0.05)"
                stroke={d.stroke}
                strokeWidth="0.5"
              />
              <rect 
                x={d.x} y={d.y} width={d.w} height={d.h} 
                className="opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                fill="#10b981" 
              />
              {/* Central node */}
              <circle cx={d.x + d.w/2} cy={d.y + d.h/2} r="2" fill={d.stroke} className="group-hover:animate-ping" />
              <circle cx={d.x + d.w/2} cy={d.y + d.h/2} r="1" fill="#fff" />
              {/* Text label */}
              <text x={d.x + d.w/2} y={d.y + d.h/2 + 8} fontSize="3.5" fill="#10b981" textAnchor="middle" className="font-mono font-bold tracking-widest uppercase opacity-70 group-hover:opacity-100">
                {d.name}
              </text>
            </g>
          ))}

          {/* Crosshairs */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>

        {/* Selected District Popup */}
        <AnimatePresence>
          {selectedDistrict && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDistrict(null)}
            >
              <div 
                className="bg-[#0a1a0a] border-2 border-green-500 rounded-xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Glitch lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_2px,#10b981_2px,#10b981_4px)]" />
                
                <button 
                  onClick={() => setSelectedDistrict(null)}
                  className="absolute top-4 right-4 text-green-500 hover:text-green-300 transition-colors z-20"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <Radar className="w-8 h-8 text-green-400 animate-spin-slow" />
                  <div>
                    <p className="text-green-500/70 font-mono text-xs tracking-widest uppercase">Target Locked</p>
                    <h4 className="text-2xl font-black text-white uppercase">{selectedDistrict.name}</h4>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="bg-black/80 border border-green-500/30 rounded p-4 text-center">
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-1">Transformer ID</p>
                    <p className="text-5xl font-black text-green-400 tracking-[0.2em] font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      {selectedDistrict.code}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <Cpu className="w-4 h-4 text-green-400" />
                    <p className="text-green-300 font-mono text-[10px] uppercase tracking-widest">
                      Relay this code to the Executive immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
