"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, AlertTriangle, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface EngineerPanelProps {
  codeEntered: boolean;
  onSubmitCode: () => Promise<void>;
  pipeAccessRequested: boolean;
  pipeAccessGranted: boolean;
  onRequestPipeAccess: () => Promise<void>;
  puzzleSolved: boolean;
  onPuzzleComplete: () => Promise<void>;
}

export default function EngineerPanel({
  codeEntered,
  onSubmitCode,
  pipeAccessRequested,
  pipeAccessGranted,
  onRequestPipeAccess,
  puzzleSolved,
  onPuzzleComplete,
}: EngineerPanelProps) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState(false);
  const TARGET_CODE = "2042"; // Filtration Bypass code from Analyst handbook

  // Pipe puzzle state (5x5 grid)
  type PipeType = 'straight' | 'angle' | 't' | 'cross' | 'empty';
  interface Cell {
    type: PipeType;
    rot: number;
    locked: boolean;
  }

  const [grid, setGrid] = useState<Cell[]>([]);
  const [filledNodes, setFilledNodes] = useState<Set<number>>(new Set());

  // Initialize grid on mount
  useEffect(() => {
    const INITIAL_TYPES: PipeType[] = [
      'straight', 'angle', 'straight', 't', 'angle',
      'angle', 'angle', 'angle', 'straight', 't',
      'straight', 'cross', 'straight', 'angle', 'angle',
      't', 'angle', 'angle', 'angle', 'straight',
      'angle', 'straight', 't', 'angle', 'straight'
    ];
    
    const initial = INITIAL_TYPES.map((type, i) => {
      if (i === 0) return { type, rot: 90, locked: true };
      if (i === 24) return { type, rot: 90, locked: true };
      const randomRot = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      return { type, rot: randomRot, locked: false };
    });
    setGrid(initial);
  }, []);

  const handleKeypad = (digit: string) => {
    if (codeEntered) return;
    if (inputCode.length < 4) {
      setInputCode(prev => prev + digit);
      setError(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setError(false);
  };

  const handleSubmit = () => {
    if (inputCode === TARGET_CODE) {
      onSubmitCode();
    } else {
      setError(true);
      setTimeout(() => setInputCode(""), 1000);
    }
  };

  const handleNodeRotate = (index: number) => {
    if (puzzleSolved || grid[index].locked) return;
    setGrid(prev => {
      const next = [...prev];
      next[index] = { ...next[index], rot: (next[index].rot + 90) % 360 };
      return next;
    });
  };

  // Calculate flow and check win condition
  useEffect(() => {
    if (!codeEntered || !pipeAccessGranted || puzzleSolved || grid.length === 0) return;

    const DIRS = ['N', 'E', 'S', 'W'];
    const OPPOSITE: Record<string, string> = { 'N': 'S', 'E': 'W', 'S': 'N', 'W': 'E' };
    const DELTAS: Record<string, [number, number]> = { 'N': [0, -1], 'E': [1, 0], 'S': [0, 1], 'W': [-1, 0] };

    const getDirs = (type: string, rot: number) => {
      let base: string[] = [];
      if (type === 'straight') base = ['N', 'S'];
      if (type === 'angle') base = ['N', 'E'];
      if (type === 't') base = ['N', 'E', 'S'];
      if (type === 'cross') base = ['N', 'E', 'S', 'W'];
      
      const shifts = rot / 90;
      return base.map(d => DIRS[(DIRS.indexOf(d) + shifts) % 4]);
    };

    const filled = new Set<number>();
    const queue = [{ x: 0, y: 0, fromDir: 'W' }]; // Water enters from West into (0,0)
    let solved = false;
    
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x < 0 || curr.x > 4 || curr.y < 0 || curr.y > 4) continue;
      
      const idx = curr.y * 5 + curr.x;
      if (filled.has(idx)) continue;
      
      const cell = grid[idx];
      const dirs = getDirs(cell.type, cell.rot);
      
      if (dirs.includes(curr.fromDir)) {
        filled.add(idx);
        for (const d of dirs) {
          if (d !== curr.fromDir) {
            const nx = curr.x + DELTAS[d][0];
            const ny = curr.y + DELTAS[d][1];
            if (nx === 5 && ny === 4 && d === 'E') {
              solved = true;
            }
            queue.push({ x: nx, y: ny, fromDir: OPPOSITE[d] });
          }
        }
      }
    }

    setFilledNodes(filled);

    if (solved) {
      onPuzzleComplete();
    }
  }, [grid, codeEntered, pipeAccessGranted, puzzleSolved, onPuzzleComplete]);


  if (!codeEntered) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative z-10 text-slate-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs w-full space-y-6"
        >
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="font-mono text-xl text-slate-300 uppercase tracking-widest">
              Manual Override
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-2">
              Enter 4-digit system target code to proceed.
            </p>
          </div>

          <div className="bg-black p-4 border border-slate-800 rounded">
            <div className={`text-center font-mono text-3xl tracking-[0.5em] h-12 flex items-center justify-center mb-6 border-b pb-4 ${error ? 'text-red-500 border-red-500/50' : 'text-cyan-400 border-cyan-500/30'}`}>
              {inputCode.padEnd(4, '_')}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') handleClear();
                    else if (key === 'OK') handleSubmit();
                    else handleKeypad(key.toString());
                  }}
                  className={`p-4 font-mono text-xl rounded transition-colors ${
                    key === 'C' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' :
                    key === 'OK' ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' :
                    'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!pipeAccessGranted) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative z-10 text-slate-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="mx-auto w-24 h-24 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest mb-4">
            Safety Lockout Active
          </h2>
          <p className="font-mono text-sm text-slate-400 mb-8">
            Filtration Bypass targeted. Physical access to valve manifold requires Executive authorization.
          </p>

          {!pipeAccessRequested ? (
            <button
              onClick={onRequestPipeAccess}
              className="w-full py-4 border border-cyan-500 text-cyan-500 font-mono tracking-widest hover:bg-cyan-500/10 transition-colors uppercase"
            >
              Request Access
            </button>
          ) : (
            <div className="w-full py-4 border border-fuchsia-500/50 text-fuchsia-400/80 font-mono tracking-widest uppercase animate-pulse">
              Request Sent — Awaiting Executive...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10 text-slate-200">
      <div className="mb-6 flex items-center gap-3 border-b border-cyan-500/30 pb-4">
        <Settings className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-[0.2em]">
          Valve Manifold Interface
        </h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="mb-8 text-center max-w-md">
          <p className="font-mono text-sm text-slate-400">
            Route water flow from INTAKE (top-left) to BYPASS (bottom-right). Avoid damaged sectors.
          </p>
        </div>

        <div className="relative">
          {puzzleSolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black backdrop-blur-sm rounded-lg"
            >
              <div className="text-center">
                <Activity className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="font-black text-2xl text-green-400 tracking-widest uppercase">
                  Flow Redirected
                </h3>
              </div>
            </motion.div>
          )}

          <div className="relative bg-black p-6 border-2 border-slate-800 rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
            {/* IN/OUT Indicators */}
            <div className="absolute -left-6 top-[24px] md:top-[32px] flex items-center gap-1 z-20">
              <span className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-widest bg-slate-900 px-1 border border-blue-500/30">IN</span>
              <div className="w-4 h-2 bg-blue-500 animate-pulse" />
            </div>
            <div className="absolute -right-8 bottom-[24px] md:bottom-[32px] flex items-center gap-1 z-20">
              <div className={`w-4 h-2 ${puzzleSolved ? "bg-green-500 animate-pulse" : "bg-slate-700"}`} />
              <span className={`text-[10px] font-black font-mono uppercase tracking-widest px-1 border ${puzzleSolved ? "text-green-400 bg-slate-900 border-green-500/30" : "text-slate-500 bg-slate-900 border-slate-700"}`}>OUT</span>
            </div>

            <div className="grid grid-cols-5 gap-1 md:gap-2 relative z-10">
              {grid.map((cell, i) => {
                const isFilled = filledNodes.has(i);
                
                // Calculate visual rotation
                let base: string[] = [];
                if (cell.type === 'straight') base = ['N', 'S'];
                if (cell.type === 'angle') base = ['N', 'E'];
                if (cell.type === 't') base = ['N', 'E', 'S'];
                if (cell.type === 'cross') base = ['N', 'E', 'S', 'W'];
                
                const DIRS = ['N', 'E', 'S', 'W'];
                const shifts = cell.rot / 90;
                const activeDirs = base.map(d => DIRS[(DIRS.indexOf(d) + shifts) % 4]);

                const pipeColor = isFilled ? "#3b82f6" : "#475569"; // blue-500 : slate-600
                const glow = isFilled ? "drop-shadow(0 0 4px rgba(59,130,246,0.8))" : "none";

                return (
                  <div
                    key={i}
                    onClick={() => handleNodeRotate(i)}
                    className={`relative w-12 h-12 md:w-16 md:h-16 rounded transition-colors ${
                      cell.locked ? "bg-slate-900/80 cursor-not-allowed border border-slate-700/50" : "bg-slate-800 cursor-pointer hover:bg-slate-700"
                    } ${isFilled ? "bg-blue-900/20" : ""}`}
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: glow }}>
                      {/* Center Hub */}
                      <circle cx="50%" cy="50%" r={isFilled ? "8" : "6"} fill={pipeColor} />
                      
                      {/* Pipe Segments */}
                      {activeDirs.includes('N') && <line x1="50%" y1="50%" x2="50%" y2="0%" stroke={pipeColor} strokeWidth={isFilled ? "10" : "8"} strokeLinecap="round" />}
                      {activeDirs.includes('S') && <line x1="50%" y1="50%" x2="50%" y2="100%" stroke={pipeColor} strokeWidth={isFilled ? "10" : "8"} strokeLinecap="round" />}
                      {activeDirs.includes('E') && <line x1="50%" y1="50%" x2="100%" y2="50%" stroke={pipeColor} strokeWidth={isFilled ? "10" : "8"} strokeLinecap="round" />}
                      {activeDirs.includes('W') && <line x1="50%" y1="50%" x2="0%" y2="50%" stroke={pipeColor} strokeWidth={isFilled ? "10" : "8"} strokeLinecap="round" />}
                    </svg>
                    
                    {cell.locked && (
                      <Lock className="absolute top-1 right-1 w-3 h-3 text-slate-600 opacity-50 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
