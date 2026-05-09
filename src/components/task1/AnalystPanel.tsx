"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { CITY_GRID, GRID_TRANSFORMER_IDS, TRANSFORMER_DATA } from "@/lib/types";

interface AnalystPanelProps {
  foundIds: string[];
  onSubmitId: (id: string) => Promise<boolean>;
}

export default function AnalystPanel({ foundIds, onSubmitId }: AnalystPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetIds: string[] = TRANSFORMER_DATA.map(t => t.id);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const success = await onSubmitId(inputValue.trim());
    if (success) {
      setFeedback({ type: "success", message: `TRANSFORMER [${inputValue}] IDENTIFIED — DATA TRANSMITTED` });
    } else {
      setFeedback({ type: "error", message: `ID [${inputValue}] INVALID — 30 SECOND PENALTY APPLIED` });
    }

    setInputValue("");
    setIsSubmitting(false);
    setTimeout(() => setFeedback(null), 3000);
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
          <p className="text-lg font-black text-green-400 uppercase tracking-wider">City Grid Map</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-green-500/30 pl-4 mb-4">
        The Journalist will tell you the <span className="text-green-400 font-bold">district names</span>. 
        Find the district on the map below and enter the 4-digit <span className="text-green-400 font-bold">Transformer ID</span>.
      </p>

      {/* City Grid Map */}
      <div className="bg-black/60 border border-green-500/20 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-2">
          {CITY_GRID.flat().map((district) => {
            const tid = GRID_TRANSFORMER_IDS[district];
            const isTarget = targetIds.includes(tid);
            const isFound = foundIds.includes(tid);
            const isSelected = selectedDistrict === district;

            return (
              <button
                key={district}
                onClick={() => setSelectedDistrict(isSelected ? null : district)}
                className={`p-3 rounded border font-mono text-[10px] uppercase tracking-wider transition-all text-left relative ${
                  isFound
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : isSelected
                    ? "bg-green-500/10 border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    : isTarget
                    ? "bg-slate-900/60 border-amber-500/20 text-slate-300 hover:border-green-500/40 hover:bg-green-950/20"
                    : "bg-slate-900/40 border-slate-700/50 text-slate-500 hover:border-slate-600"
                }`}
              >
                <span className="block font-bold text-xs mb-1">{district}</span>
                <span className="block opacity-60">ID: {tid}</span>
                {isFound && (
                  <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input & Submit */}
      <div className="flex gap-3">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            maxLength={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter 4-digit Transformer ID"
            className="w-full bg-black/60 border border-green-500/30 rounded px-4 py-3 pl-10 font-mono text-sm text-green-300 placeholder-slate-600 focus:outline-none focus:border-green-400 focus:shadow-[0_0_15px_rgba(74,222,128,0.15)]"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={inputValue.length !== 4 || isSubmitting}
          className="px-6 py-3 bg-green-500/20 border border-green-500/40 text-green-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Submit
        </button>
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

      {/* Progress */}
      <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
        <AlertTriangle className="w-3 h-3" />
        <span>Transformers Identified: {foundIds.length} / 3</span>
      </div>
    </div>
  );
}
