"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, AlertTriangle, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface EngineerPanelProps {
  codeEntered: boolean;
  onSubmitCode: () => void;
  pipeAccessRequested: boolean;
  pipeAccessGranted: boolean;
  onRequestPipeAccess: () => void;
  puzzleSolved: boolean;
  onPuzzleComplete: () => void;
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

  // Pipe puzzle state (simple 3x3 grid)
  // Goal: click valid blue/green nodes to form a path, avoid red.
  // We'll simplify: just have them select the correct nodes in sequence.
  const [activeNodes, setActiveNodes] = useState<number[]>([]);

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

  const handleNodeClick = (index: number) => {
    if (puzzleSolved) return;
    if (activeNodes.includes(index)) {
      setActiveNodes(prev => prev.filter(n => n !== index));
    } else {
      setActiveNodes(prev => [...prev, index]);
    }
  };

  // Check puzzle win condition: 
  // Nodes 0, 4, 8 selected (diagonal path), 
  // Red node (e.g. 2, 6) not selected.
  useEffect(() => {
    if (codeEntered && pipeAccessGranted && !puzzleSolved) {
      const required = [0, 4, 8];
      const invalid = [2, 6];
      const hasRequired = required.every(n => activeNodes.includes(n));
      const hasInvalid = invalid.some(n => activeNodes.includes(n));

      if (hasRequired && !hasInvalid) {
        onPuzzleComplete();
      }
    }
  }, [activeNodes, codeEntered, pipeAccessGranted, puzzleSolved, onPuzzleComplete]);


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

          <div className="bg-black/60 p-4 border border-slate-800 rounded">
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
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg"
            >
              <div className="text-center">
                <Activity className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="font-black text-2xl text-green-400 tracking-widest uppercase">
                  Flow Redirected
                </h3>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-2 bg-black/50 p-4 border border-slate-800 rounded-lg">
            {Array.from({ length: 9 }).map((_, i) => {
              const isSelected = activeNodes.includes(i);
              const isIntake = i === 0;
              const isBypass = i === 8;
              const isDamaged = i === 2 || i === 6;

              let baseClass = "w-20 h-20 border-2 rounded transition-all flex items-center justify-center font-mono text-xs ";
              
              if (isDamaged) {
                baseClass += "border-red-500/30 bg-red-500/10 text-red-500/50 cursor-not-allowed";
              } else if (isIntake) {
                baseClass += isSelected ? "border-blue-500 bg-blue-500/30 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-blue-500/50 bg-blue-500/10 text-blue-500 cursor-pointer";
              } else if (isBypass) {
                baseClass += isSelected ? "border-green-500 bg-green-500/30 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "border-green-500/50 bg-green-500/10 text-green-500 cursor-pointer";
              } else {
                baseClass += isSelected ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "border-slate-700 hover:border-cyan-400/50 bg-slate-900 cursor-pointer";
              }

              return (
                <div
                  key={i}
                  onClick={() => !isDamaged && handleNodeClick(i)}
                  className={baseClass}
                >
                  {isIntake ? "IN" : isBypass ? "OUT" : isDamaged ? "ERR" : "N-" + i}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
