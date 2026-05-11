"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Unlock, CheckCircle2, Terminal } from "lucide-react";
import { ALL_DISTRICTS } from "@/lib/types";

interface ExecutivePanelProps {
  analystFoundIds: string[]; // Unused now, but kept for compatibility
  authorizedIds: string[];
  repairedIds: string[];
  onAuthorize: (id: string) => void;
}

export default function ExecutivePanel({ authorizedIds, repairedIds, onAuthorize }: ExecutivePanelProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAuthorize = () => {
    if (inputValue.length === 4) {
      onAuthorize(inputValue.toUpperCase());
      setInputValue("");
    }
  };

  return (
    <div className="space-y-6">
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
        Communicate with the Data Analyst to receive the 4-digit transformer codes.
        Enter them below to <span className="text-fuchsia-400 font-bold">authorize field repair</span> for the Engineer.
      </p>

      {/* Input Section */}
      <div className="bg-black/80 border border-fuchsia-500/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-fuchsia-500" />
          <span className="font-mono text-xs text-fuchsia-500/70 uppercase tracking-widest">Override Command</span>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-grow relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-600 font-mono text-sm">{`>`}</span>
            <input
              type="text"
              maxLength={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleAuthorize()}
              placeholder="_ _ _ _"
              className="w-full bg-black border border-fuchsia-500/30 rounded px-4 py-3 pl-8 font-mono text-lg text-fuchsia-300 placeholder-fuchsia-900/60 focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(232,121,249,0.15)] tracking-[0.3em] uppercase"
            />
          </div>
          <button
            onClick={handleAuthorize}
            disabled={inputValue.length !== 4}
            className="px-6 py-3 bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-fuchsia-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Authorize
          </button>
        </div>
      </div>

      {/* Authorized List */}
      <div className="space-y-4">
        <h4 className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">
          Active Authorizations
        </h4>
        <AnimatePresence>
          {authorizedIds.length === 0 ? (
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-600 font-mono text-sm text-center py-4">
               No pending authorizations.
             </motion.p>
          ) : (
            authorizedIds.map((id, i) => {
              const isFixed = repairedIds.includes(id);
              const validTransformer = ALL_DISTRICTS.find(t => t.id === id);

              let borderCls = "border-fuchsia-500/40 shadow-[0_0_15px_rgba(232,121,249,0.1)]";
              let iconBg = "bg-fuchsia-500/20";
              let nameCls = "text-fuchsia-400";

              if (isFixed) {
                borderCls = "border-green-500/40";
                iconBg = "bg-green-500/20";
                nameCls = "text-green-400";
              }

              return (
                <motion.div key={id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-black/60 border rounded-lg p-5 transition-all ${borderCls}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded ${iconBg}`}>
                        {isFixed ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Unlock className="w-5 h-5 text-fuchsia-400" />}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                          ID: {id}
                        </p>
                        <p className={`font-bold text-sm ${nameCls}`}>
                          {isFixed ? "Repaired" : "Awaiting Engineer"}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isFixed ? (
                        <span className="text-green-400 font-mono text-xs tracking-widest uppercase">Secured</span>
                      ) : (
                        <span className="text-fuchsia-400 font-mono text-xs tracking-widest uppercase animate-pulse">Pending...</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
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
