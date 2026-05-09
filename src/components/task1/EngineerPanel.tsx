"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, Lock } from "lucide-react";
import { TRANSFORMER_DATA, WIRE_COLORS } from "@/lib/types";

interface EngineerPanelProps {
  authorizedIds: string[];
  repairedIds: string[];
  onCompleteRepair: (id: string) => void;
}

interface WirePuzzle {
  transformerId: string;
  // Shuffled order for the right-side ports
  shuffledOrder: number[];
  // Player's current connections: leftIndex -> rightIndex
  connections: Record<number, number>;
}

export default function EngineerPanel({ authorizedIds, repairedIds, onCompleteRepair }: EngineerPanelProps) {
  const [activePuzzle, setActivePuzzle] = useState<WirePuzzle | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  const startPuzzle = useCallback((tid: string) => {
    // Create a shuffled order for the right side
    const order = [0, 1, 2, 3];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setActivePuzzle({
      transformerId: tid,
      shuffledOrder: order,
      connections: {},
    });
    setSelectedLeft(null);
  }, []);

  const handleLeftClick = (index: number) => {
    if (!activePuzzle) return;
    // If already connected, disconnect
    if (activePuzzle.connections[index] !== undefined) {
      const newConns = { ...activePuzzle.connections };
      delete newConns[index];
      setActivePuzzle({ ...activePuzzle, connections: newConns });
      return;
    }
    setSelectedLeft(index);
  };

  const handleRightClick = (shuffledIndex: number) => {
    if (!activePuzzle || selectedLeft === null) return;

    const actualColor = activePuzzle.shuffledOrder[shuffledIndex];

    // Check if this right port is already taken
    const rightTaken = Object.values(activePuzzle.connections).includes(shuffledIndex);
    if (rightTaken) return;

    const newConns = { ...activePuzzle.connections, [selectedLeft]: shuffledIndex };
    setActivePuzzle({ ...activePuzzle, connections: newConns });
    setSelectedLeft(null);

    // Check if all 4 are connected
    if (Object.keys(newConns).length === 4) {
      // Verify: each left[i] should connect to the right port whose actual color index matches i
      const isCorrect = Object.entries(newConns).every(([left, right]) => {
        return activePuzzle.shuffledOrder[right] === Number(left);
      });

      if (isCorrect) {
        setTimeout(() => {
          onCompleteRepair(activePuzzle.transformerId);
          setActivePuzzle(null);
        }, 500);
      } else {
        setWrongFlash(true);
        setTimeout(() => {
          setWrongFlash(false);
          // Reset connections
          setActivePuzzle({ ...activePuzzle, connections: {} });
        }, 800);
      }
    }
  };

  // If actively solving a puzzle
  if (activePuzzle) {
    const tData = TRANSFORMER_DATA.find(t => t.id === activePuzzle.transformerId);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Wire Repair Module</h3>
            <p className="text-lg font-black text-white">
              Transformer [{activePuzzle.transformerId}] — {tData?.district}
            </p>
          </div>
          <button
            onClick={() => setActivePuzzle(null)}
            className="text-slate-500 font-mono text-xs hover:text-slate-300 transition-colors"
          >
            [Cancel]
          </button>
        </div>

        <p className="text-slate-400 text-sm font-mono border-l-2 border-cyan-500/30 pl-4">
          Match each colored wire on the left to its matching port on the right. 
          Click a wire, then click the matching port.
        </p>

        <div className={`bg-black/80 border rounded-xl p-8 transition-all ${
          wrongFlash ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-cyan-500/20"
        }`}>
          <div className="flex items-center justify-between gap-12">
            {/* Left side: Wires */}
            <div className="space-y-4 flex-1">
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-2">Wires</p>
              {WIRE_COLORS.map((color, i) => {
                const isConnected = activePuzzle.connections[i] !== undefined;
                const isActive = selectedLeft === i;
                return (
                  <button
                    key={`left-${i}`}
                    onClick={() => handleLeftClick(i)}
                    className={`w-full h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider ${
                      isConnected
                        ? "opacity-50 cursor-default"
                        : isActive
                        ? "scale-105 shadow-lg"
                        : "hover:scale-102"
                    }`}
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: isActive ? color : `${color}60`,
                      color: color,
                      boxShadow: isActive ? `0 0 20px ${color}40` : undefined,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    Wire {i + 1}
                    {isConnected && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {/* Center: Connection lines (visual only) */}
            <div className="flex flex-col items-center gap-4 opacity-30">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-16 h-12 flex items-center">
                  <div className="w-full h-[2px] bg-slate-600 border-dashed" />
                </div>
              ))}
            </div>

            {/* Right side: Ports (shuffled colors) */}
            <div className="space-y-4 flex-1">
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-2">Ports</p>
              {activePuzzle.shuffledOrder.map((actualColorIdx, shuffledIdx) => {
                const color = WIRE_COLORS[actualColorIdx];
                const isTarget = Object.values(activePuzzle.connections).includes(shuffledIdx);
                return (
                  <button
                    key={`right-${shuffledIdx}`}
                    onClick={() => handleRightClick(shuffledIdx)}
                    disabled={isTarget || selectedLeft === null}
                    className={`w-full h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider ${
                      isTarget
                        ? "opacity-50 cursor-default"
                        : selectedLeft !== null
                        ? "hover:scale-102 cursor-pointer"
                        : "cursor-default opacity-60"
                    }`}
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: `${color}60`,
                      color: color,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: color }} />
                    Port {shuffledIdx + 1}
                    {isTarget && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {wrongFlash && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 font-mono text-sm text-center uppercase tracking-widest animate-shake"
          >
            Incorrect wiring — resetting connections...
          </motion.p>
        )}
      </div>
    );
  }

  // Default view: list of transformers
  return (
    <div className="space-y-6">
      {/* Header */}
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
        {TRANSFORMER_DATA.map((t) => {
          const isAuthorized = authorizedIds.includes(t.id);
          const isRepaired = repairedIds.includes(t.id);

          return (
            <div
              key={t.id}
              className={`bg-black/60 border rounded-lg p-5 flex items-center justify-between transition-all ${
                isRepaired
                  ? "border-green-500/40"
                  : isAuthorized
                  ? "border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                  : "border-slate-800 opacity-40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded ${
                  isRepaired ? "bg-green-500/20" : isAuthorized ? "bg-cyan-500/20" : "bg-slate-800"
                }`}>
                  {isRepaired ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : isAuthorized ? (
                    <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                    Transformer [{t.id}]
                  </p>
                  <p className={`font-bold text-sm ${
                    isRepaired ? "text-green-400" : isAuthorized ? "text-cyan-400" : "text-slate-600"
                  }`}>
                    {t.district} District
                  </p>
                </div>
              </div>

              {isRepaired ? (
                <span className="text-green-400 font-mono text-xs tracking-widest uppercase">Stabilized</span>
              ) : isAuthorized ? (
                <button
                  onClick={() => startPuzzle(t.id)}
                  className="px-5 py-2.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all animate-pulse"
                >
                  Begin Repair
                </button>
              ) : (
                <span className="text-slate-600 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-4 p-3 bg-black/40 border border-slate-800 rounded text-center">
        <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
          Grid Stability: {repairedIds.length} / 3 Transformers Repaired
        </p>
        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(repairedIds.length / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
