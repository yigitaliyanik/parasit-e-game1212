"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Search, CheckCircle2, XCircle, AlertTriangle, Terminal } from "lucide-react";
import { TRANSFORMER_DATA } from "@/lib/types";

interface AnalystPanelProps {
  foundIds: string[];
  onSubmitId: (id: string) => Promise<boolean>;
}

export default function AnalystPanel({ foundIds, onSubmitId }: AnalystPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    if (inputValue.trim().length !== 4) return;
    setIsSubmitting(true);

    const id = inputValue.trim().toUpperCase();
    const success = await onSubmitId(id);
    if (success) {
      setFeedback({ type: "success", message: `TRANSFORMER [${id}] IDENTIFIED — DATA TRANSMITTED TO EXECUTIVE` });
    } else {
      // Check if already found
      if (foundIds.includes(id)) {
        setFeedback({ type: "error", message: `ID [${id}] ALREADY ISOLATED — DUPLICATE ENTRY` });
      } else {
        setFeedback({ type: "error", message: `ID [${id}] INVALID — 30 SECOND PENALTY APPLIED` });
      }
    }

    setInputValue("");
    setIsSubmitting(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
          <Map className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Grid Analysis Terminal</h3>
          <p className="text-lg font-black text-green-400 uppercase tracking-wider">Signal Isolation</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-green-500/30 pl-4 mb-4">
        The Journalist will relay <span className="text-green-400 font-bold">district names</span> from citizen reports.
        Cross-reference the reports and enter the correct 4-digit <span className="text-green-400 font-bold">Transformer ID</span> to
        isolate the parasitic signal.
      </p>

      {/* Terminal Input Section */}
      <div className="bg-black/80 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-green-500" />
          <span className="font-mono text-xs text-green-500/70 uppercase tracking-widest">Signal Isolation Console</span>
        </div>

        {/* Terminal-style log */}
        <div className="bg-[#001100]/60 border border-green-900/40 rounded p-4 mb-4 font-mono text-xs space-y-1">
          <p className="text-green-600/60">{`>`} SYS: Parasitic signals detected across city grid</p>
          <p className="text-green-600/60">{`>`} SYS: Awaiting transformer ID input from analyst...</p>
          <p className="text-green-600/60">{`>`} SYS: Cross-reference journalist reports to identify codes</p>
          {foundIds.map((id) => (
            <p key={id} className="text-green-400">{`>`} MATCH: Transformer [{id}] — signal isolated ✓</p>
          ))}
          <p className="text-green-500 animate-pulse">{`>`} _</p>
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <div className="flex-grow relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-mono text-sm">{`>`}</span>
            <input
              type="text"
              maxLength={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="_ _ _ _"
              className="w-full bg-black border border-green-500/30 rounded px-4 py-3 pl-8 font-mono text-lg text-green-300 placeholder-green-900/60 focus:outline-none focus:border-green-400 focus:shadow-[0_0_15px_rgba(74,222,128,0.15)] tracking-[0.3em] uppercase"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={inputValue.length !== 4 || isSubmitting}
            className="px-6 py-3 bg-green-500/20 border border-green-500/40 text-green-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Isolate
          </button>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 rounded border font-mono text-sm ${
              feedback.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identified Transformers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs mb-2">
          <AlertTriangle className="w-3 h-3" />
          <span>Signals Isolated: {foundIds.length} / 3</span>
        </div>
        {foundIds.map((id) => {
          const tData = TRANSFORMER_DATA.find(t => t.id === id);
          return (
            <div
              key={id}
              className="bg-green-500/5 border border-green-500/20 rounded px-4 py-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="font-mono text-sm text-green-300">Transformer [{id}]</span>
              </div>
              <span className="font-mono text-xs text-green-500/60 uppercase tracking-widest">
                {tData?.district || "Unknown"} — Isolated
              </span>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[11px] text-red-400/70 leading-relaxed">
          WARNING: Each incorrect submission triggers Parasit[e] countermeasures — 30 second time penalty per failed attempt.
        </p>
      </div>
    </div>
  );
}
