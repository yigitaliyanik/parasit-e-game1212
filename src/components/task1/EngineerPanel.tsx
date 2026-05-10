"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { TRANSFORMER_DATA } from "@/lib/types";

interface EngineerPanelProps {
  authorizedIds: string[];
  repairedIds: string[];
  onCompleteRepair: (id: string) => void;
  onRemoveAuthorization: (id: string) => void;
}

const WIRE_DEFS = [
  { name: "RED", hex: "#ef4444", glow: "rgba(239,68,68,0.5)" },
  { name: "BLUE", hex: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
  { name: "YELLOW", hex: "#eab308", glow: "rgba(234,179,8,0.5)" },
  { name: "GREEN", hex: "#22c55e", glow: "rgba(34,197,94,0.5)" },
];

interface WirePuzzle {
  transformerId: string;
  isValid: boolean;
  shuffledRight: number[];
  connections: Record<number, number>;
}

export default function EngineerPanel({ authorizedIds, repairedIds, onCompleteRepair, onRemoveAuthorization }: EngineerPanelProps) {
  const [puzzle, setPuzzle] = useState<WirePuzzle | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startPuzzle = useCallback((id: string) => {
    const isValid = TRANSFORMER_DATA.some(t => t.id === id);
    
    if (isValid) {
      const order = [0, 1, 2, 3];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      setPuzzle({ transformerId: id, isValid: true, shuffledRight: order, connections: {} });
    } else {
      // Invalid ID - show already connected wires
      const order = [0, 1, 2, 3];
      const connections: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3 };
      setPuzzle({ transformerId: id, isValid: false, shuffledRight: order, connections });
    }
    
    setSelectedLeft(null);
    setWrongFlash(false);
    setSuccessFlash(false);
  }, []);

  // Handle invalid puzzle timeout
  useEffect(() => {
    if (puzzle && !puzzle.isValid) {
      const timer = setTimeout(() => {
        onRemoveAuthorization(puzzle.transformerId);
        setPuzzle(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [puzzle, onRemoveAuthorization]);

  const handleLeftClick = (idx: number) => {
    if (!puzzle || !puzzle.isValid) return;
    if (puzzle.connections[idx] !== undefined) {
      const c = { ...puzzle.connections };
      delete c[idx];
      setPuzzle({ ...puzzle, connections: c });
      return;
    }
    setSelectedLeft(idx);
  };

  const handleRightClick = (shuffledIdx: number) => {
    if (!puzzle || !puzzle.isValid || selectedLeft === null) return;
    const taken = Object.values(puzzle.connections).includes(shuffledIdx);
    if (taken) return;

    const c = { ...puzzle.connections, [selectedLeft]: shuffledIdx };
    setPuzzle({ ...puzzle, connections: c });
    setSelectedLeft(null);

    if (Object.keys(c).length === 4) {
      const correct = Object.entries(c).every(
        ([left, right]) => puzzle.shuffledRight[right] === Number(left)
      );
      if (correct) {
        setSuccessFlash(true);
        setTimeout(() => {
          onCompleteRepair(puzzle.transformerId);
          setPuzzle(null);
          setSuccessFlash(false);
        }, 600);
      } else {
        setWrongFlash(true);
        setTimeout(() => {
          setWrongFlash(false);
          setPuzzle({ ...puzzle, connections: {} });
        }, 800);
      }
    }
  };

  // ── Puzzle View ──
  if (puzzle) {
    const tData = TRANSFORMER_DATA.find(t => t.id === puzzle.transformerId);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Wire Repair Module</h3>
            <p className="text-lg font-black text-white">
              Transformer [{puzzle.transformerId}] {tData ? `— ${tData.district}` : ""}
            </p>
          </div>
          {puzzle.isValid && (
            <button onClick={() => setPuzzle(null)} className="text-slate-500 font-mono text-xs hover:text-slate-300 transition-colors">[Cancel]</button>
          )}
        </div>

        {puzzle.isValid ? (
          <p className="text-slate-400 text-sm font-mono border-l-2 border-cyan-500/30 pl-4">
            Match each <span className="text-cyan-400">color name</span> on the left to its matching <span className="text-cyan-400">colored node</span> on the right.
          </p>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm font-mono tracking-widest uppercase font-bold">
              SYSTEM STATUS: OPERATIONAL - NO FAULT DETECTED
            </p>
          </div>
        )}

        <div ref={containerRef} className={`bg-black/80 border-2 rounded-xl p-8 transition-all relative overflow-hidden ${
          successFlash || !puzzle.isValid ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]" : wrongFlash ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-cyan-500/20"
        }`}>
          {/* Connection Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {Object.entries(puzzle.connections).map(([leftStr, rightIdx]) => {
              const leftIdx = Number(leftStr);
              const leftY = 12.5 + leftIdx * 25;
              const rightY = 12.5 + rightIdx * 25;
              const wire = WIRE_DEFS[leftIdx];
              return (
                <line
                  key={`wire-${leftStr}`}
                  x1="30%" y1={`${leftY}%`}
                  x2="70%" y2={`${rightY}%`}
                  stroke={wire.hex}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${wire.glow})` }}
                />
              );
            })}
          </svg>

          <div className="flex items-stretch justify-between gap-6 relative z-20">
            {/* Left: Color NAMES */}
            <div className="flex flex-col gap-6 w-[35%]">
              <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-1">Wires</p>
              {WIRE_DEFS.map((wire, i) => {
                const isConnected = puzzle.connections[i] !== undefined;
                const isActive = selectedLeft === i;
                return (
                  <button
                    key={`L-${i}`}
                    onClick={() => handleLeftClick(i)}
                    disabled={!puzzle.isValid}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-mono font-black text-sm uppercase tracking-[0.2em] transition-all ${
                      isConnected ? "opacity-40" : isActive ? "scale-105" : puzzle.isValid ? "hover:scale-[1.02]" : ""
                    }`}
                    style={{
                      borderColor: isActive || (!puzzle.isValid) ? wire.hex : `${wire.hex}50`,
                      backgroundColor: isActive || (!puzzle.isValid) ? `${wire.hex}20` : "rgba(0,0,0,0.5)",
                      color: wire.hex,
                      boxShadow: isActive ? `0 0 20px ${wire.glow}, inset 0 0 10px ${wire.glow}` : "none",
                    }}
                  >
                    {wire.name}
                    {isConnected && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: wire.hex }} />}
                    {/* Connector dot */}
                    <div
                      className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-30"
                      style={{ borderColor: wire.hex, backgroundColor: isActive || isConnected ? wire.hex : "black" }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Right: Color CIRCLES (shuffled) */}
            <div className="flex flex-col gap-6 w-[35%]">
              <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-1 text-right">Ports</p>
              {puzzle.shuffledRight.map((actualIdx, shuffledIdx) => {
                const wire = WIRE_DEFS[actualIdx];
                const isTarget = Object.values(puzzle.connections).includes(shuffledIdx);
                const canClick = selectedLeft !== null && !isTarget && puzzle.isValid;
                return (
                  <button
                    key={`R-${shuffledIdx}`}
                    onClick={() => handleRightClick(shuffledIdx)}
                    disabled={!canClick}
                    className={`relative flex items-center justify-end gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                      isTarget ? "opacity-40" : canClick ? "hover:scale-[1.02] cursor-pointer" : "cursor-default opacity-60"
                    }`}
                    style={{
                      borderColor: isTarget || !puzzle.isValid ? `${wire.hex}60` : `${wire.hex}30`,
                      backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Connector dot */}
                    <div
                      className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-30"
                      style={{ borderColor: wire.hex, backgroundColor: isTarget ? wire.hex : "black" }}
                    />
                    {/* Physical colored node */}
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                         backgroundColor: wire.hex,
                         boxShadow: `0 0 12px ${wire.glow}, 0 0 24px ${wire.glow}`,
                      }}
                    />
                    {isTarget && <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {wrongFlash && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-red-400 font-mono text-sm text-center uppercase tracking-widest animate-shake">
            Incorrect wiring — resetting connections...
          </motion.p>
        )}
        {successFlash && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-green-400 font-mono text-sm text-center uppercase tracking-widest">
            Circuit aligned — transformer stabilized!
          </motion.p>
        )}
        {!puzzle.isValid && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-slate-400 font-mono text-xs text-center uppercase tracking-widest">
            Clearing false authorization in 3 seconds...
          </motion.p>
        )}
      </div>
    );
  }

  // ── Default List View ──
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/30">
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Field Repair Terminal</h3>
          <p className="text-lg font-black text-cyan-400 uppercase tracking-wider">Repair Tool</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-cyan-500/30 pl-4 mb-6">
        Wait for the Executive to authorize transformers for repair.
        Then complete the <span className="text-cyan-400 font-bold">wire-matching puzzle</span> to stabilize each one.
      </p>

      <div className="space-y-4">
        <h4 className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">
          Authorized Repairs
        </h4>
        <AnimatePresence>
          {authorizedIds.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-600 font-mono text-sm text-center py-4">
               No pending repairs.
             </motion.p>
          ) : (
            authorizedIds.map((id) => {
              const isDone = repairedIds.includes(id);
              const validTransformer = TRANSFORMER_DATA.find(t => t.id === id);

              return (
                <motion.div key={id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-black/60 border rounded-lg p-5 flex items-center justify-between transition-all ${
                  isDone ? "border-green-500/40" : "border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded ${isDone ? "bg-green-500/20" : "bg-cyan-500/20"}`}>
                      {isDone ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Transformer [{id}]</p>
                      <p className={`font-bold text-sm ${isDone ? "text-green-400" : "text-cyan-400"}`}>
                        {validTransformer ? `${validTransformer.district} District` : "Unknown Origin"}
                      </p>
                    </div>
                  </div>
                  {isDone ? (
                    <span className="text-green-400 font-mono text-xs tracking-widest uppercase">Stabilized</span>
                  ) : (
                    <button onClick={() => startPuzzle(id)} className="px-5 py-2.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all animate-pulse">
                      Begin Repair
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-3 bg-black/40 border border-slate-800 rounded text-center">
        <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
          Grid Stability: {repairedIds.length} / 3 Transformers Repaired
        </p>
        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${(repairedIds.length / 3) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
