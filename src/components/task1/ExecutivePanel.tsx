"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { TRANSFORMER_DATA } from "@/lib/types";

interface ExecutivePanelProps {
  analystFoundIds: string[];
  authorizedIds: string[];
  repairedIds: string[];
  onAuthorize: (id: string) => void;
}

export default function ExecutivePanel({ analystFoundIds, authorizedIds, repairedIds, onAuthorize }: ExecutivePanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-500/10 rounded border border-fuchsia-500/30">
          <Shield className="w-6 h-6 text-fuchsia-400" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Authorization Terminal</h3>
          <p className="text-lg font-black text-fuchsia-400 uppercase tracking-wider">Command Console</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-fuchsia-500/30 pl-4 mb-6">
        The Data Analyst has identified compromised transformers. Review and 
        <span className="text-fuchsia-400 font-bold"> authorize field repair</span> for the Engineer.
      </p>

      {/* Transformer Authorization Cards */}
      <div className="space-y-4">
        {TRANSFORMER_DATA.map((t) => {
          const isFound = analystFoundIds.includes(t.id);
          const isAuthorized = authorizedIds.includes(t.id);
          const isRepaired = repairedIds.includes(t.id);

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isFound ? 1 : 0.3, x: 0 }}
              className={`bg-black/60 border rounded-lg p-5 transition-all ${
                isRepaired
                  ? "border-green-500/40"
                  : isAuthorized
                  ? "border-fuchsia-500/40 shadow-[0_0_15px_rgba(232,121,249,0.1)]"
                  : isFound
                  ? "border-amber-500/30"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded ${
                    isRepaired ? "bg-green-500/20" : isAuthorized ? "bg-fuchsia-500/20" : "bg-slate-800"
                  }`}>
                    {isRepaired ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isAuthorized ? (
                      <Unlock className="w-5 h-5 text-fuchsia-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                      Transformer [{t.id}]
                    </p>
                    <p className={`font-bold text-sm ${
                      isRepaired ? "text-green-400" : isAuthorized ? "text-fuchsia-400" : isFound ? "text-amber-400" : "text-slate-600"
                    }`}>
                      {t.district} District
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isRepaired ? (
                    <span className="text-green-400 font-mono text-xs tracking-widest uppercase">Repaired</span>
                  ) : isAuthorized ? (
                    <span className="text-fuchsia-400 font-mono text-xs tracking-widest uppercase animate-pulse">
                      Awaiting Repair...
                    </span>
                  ) : isFound ? (
                    <button
                      onClick={() => onAuthorize(t.id)}
                      className="px-5 py-2.5 bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-mono text-xs uppercase tracking-wider rounded hover:bg-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(232,121,249,0.2)] transition-all"
                    >
                      Authorize Field Repair
                    </button>
                  ) : (
                    <span className="text-slate-600 font-mono text-xs tracking-widest uppercase">
                      Awaiting ID...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-black/40 border border-slate-800 rounded p-3 text-center">
          <p className="text-amber-400 font-mono text-2xl font-black">{analystFoundIds.length}</p>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Identified</p>
        </div>
        <div className="bg-black/40 border border-slate-800 rounded p-3 text-center">
          <p className="text-fuchsia-400 font-mono text-2xl font-black">{authorizedIds.length}</p>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Authorized</p>
        </div>
        <div className="bg-black/40 border border-slate-800 rounded p-3 text-center">
          <p className="text-green-400 font-mono text-2xl font-black">{repairedIds.length}</p>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Repaired</p>
        </div>
      </div>
    </div>
  );
}
