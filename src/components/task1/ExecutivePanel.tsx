"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Unlock, CheckCircle2, ShieldAlert } from "lucide-react";
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

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => {
          const foundT = analystFoundIds[i] ? TRANSFORMER_DATA.find(t => t.id === analystFoundIds[i]) : null;
          const tid = foundT?.id;
          const isFound = !!tid;
          const isAuth = tid ? authorizedIds.includes(tid) : false;
          const isFixed = tid ? repairedIds.includes(tid) : false;

          let borderCls = "border-slate-800/60";
          if (isFixed) borderCls = "border-green-500/40";
          else if (isAuth) borderCls = "border-fuchsia-500/40 shadow-[0_0_15px_rgba(232,121,249,0.1)]";
          else if (isFound) borderCls = "border-amber-500/30";

          let iconBg = "bg-slate-800/50";
          if (isFixed) iconBg = "bg-green-500/20";
          else if (isAuth) iconBg = "bg-fuchsia-500/20";
          else if (isFound) iconBg = "bg-amber-500/10";

          let nameCls = "text-slate-700";
          if (isFixed) nameCls = "text-green-400";
          else if (isAuth) nameCls = "text-fuchsia-400";
          else if (isFound) nameCls = "text-amber-400";

          return (
            <motion.div key={isFound ? tid : `ph-${i}`} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`bg-black/60 border rounded-lg p-5 transition-all ${borderCls}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded ${iconBg}`}>
                    {isFixed ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : isAuth ? <Unlock className="w-5 h-5 text-fuchsia-400" /> : isFound ? <ShieldAlert className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                      {isFound ? `Transformer [${tid}]` : "Transformer [████]"}
                    </p>
                    <p className={`font-bold text-sm ${nameCls}`}>
                      {isFound ? `${foundT?.district} District` : "██████████ District"}
                    </p>
                  </div>
                </div>
                <div>
                  {isFixed ? (
                    <span className="text-green-400 font-mono text-xs tracking-widest uppercase">Repaired</span>
                  ) : isAuth ? (
                    <span className="text-fuchsia-400 font-mono text-xs tracking-widest uppercase animate-pulse">Awaiting Repair...</span>
                  ) : isFound && tid ? (
                    <button onClick={() => onAuthorize(tid)} className="px-5 py-2.5 bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-mono text-xs uppercase tracking-wider rounded hover:bg-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(232,121,249,0.2)] transition-all">
                      Authorize Field Repair
                    </button>
                  ) : (
                    <span className="text-slate-600 font-mono text-xs tracking-widest uppercase">Awaiting Analyst...</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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
