"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Newspaper, Signal, AlertTriangle, Zap } from "lucide-react";
import { TRANSFORMER_DATA } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function JournalistPanel() {
  const [visibleClues, setVisibleClues] = useState<number[]>([]);
  const [typedTexts, setTypedTexts] = useState<Record<number, string>>({});
  const abortRef = useRef(false);

  // Stable random source IDs — generated once, not on every render
  const sourceIds = useMemo(
    () => TRANSFORMER_DATA.map(() => Math.floor(Math.random() * 900) + 100),
    []
  );

  const typeClue = useCallback(async (index: number, text: string, abort: React.MutableRefObject<boolean>) => {
    let current = "";
    for (let i = 0; i < text.length; i++) {
      if (abort.current) return;
      current += text[i];
      setTypedTexts(prev => ({ ...prev, [index]: current }));
      await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
    }
  }, []);

  useEffect(() => {
    abortRef.current = false;
    const revealClues = async () => {
      for (let i = 0; i < TRANSFORMER_DATA.length; i++) {
        if (abortRef.current) return;
        await new Promise(r => setTimeout(r, i === 0 ? 500 : 2000));
        if (abortRef.current) return;
        setVisibleClues(prev => [...prev, i]);
        await typeClue(i, TRANSFORMER_DATA[i].clue, abortRef);
      }
    };
    revealClues();
    return () => {
      abortRef.current = true;
    };
  }, [typeClue]);

  const headlines = [
    "POWER GRID UNDER SIEGE — PARASIT[E] OVERLOADS INFRASTRUCTURE",
    "INDUSTRIAL DISTRICT SPARKS EVACUATION — TRANSFORMER CRISIS DEEPENS",
    "SOUTHERN BORDER DECLARES EMERGENCY — UNDERGROUND SURGE DETECTED",
  ];

  const dates = [
    "VOL. XLVII • NO. 2891",
    "VOL. XLVII • NO. 2892",
    "VOL. XLVII • NO. 2893",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-amber-500/30 pb-4">
        <div className="p-3 bg-amber-500/10 rounded border border-amber-500/30 relative overflow-hidden">
          <Signal className="w-6 h-6 text-amber-400 animate-pulse relative z-10" />
          <div className="absolute inset-0 bg-amber-400/10 animate-ping" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Intercepted Media</h3>
          <p className="text-lg font-black text-amber-400 uppercase tracking-wider">Field Reports</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-amber-500/30 pl-4 mb-6">
        Intercepted citizen reports from Parasit[e]-affected districts. Read carefully and relay
        the <span className="text-amber-400 font-bold">district names</span> to the Data Analyst.
      </p>

      {/* Newspaper Clippings */}
      <div className="space-y-6 overflow-y-auto pr-2 pb-8">
        <AnimatePresence>
          {TRANSFORMER_DATA.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, rotateZ: -1 }}
              animate={{
                opacity: visibleClues.includes(i) ? 1 : 0,
                y: visibleClues.includes(i) ? 0 : 30,
                rotateZ: 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`${!visibleClues.includes(i) ? "pointer-events-none" : ""}`}
            >
              {/* Newspaper Card */}
              <div className="relative overflow-hidden rounded-lg border border-amber-800/40 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
                {/* Paper texture overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: "150px 150px",
                  }}
                />

                {/* Grunge border effect */}
                <div className="absolute inset-0 border-2 border-amber-900/20 rounded-lg pointer-events-none" />
                {/* Neon accent lines — cyberpunk enhancement */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-cyan-500/20 via-transparent to-amber-500/20" />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-amber-500/20 via-transparent to-cyan-500/20" />

                {/* Newspaper content */}
                <div className="bg-[#0d0a05] relative z-10 p-0">
                  {/* Masthead */}
                  <div className="bg-gradient-to-r from-amber-900/30 via-amber-800/40 to-amber-900/30 px-5 py-3 border-b border-amber-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-amber-600" />
                        <span
                          className="text-amber-500 text-[11px] tracking-[0.4em] uppercase font-bold"
                          style={{ fontFamily: "var(--font-headline), Georgia, serif" }}
                        >
                          Ecoville Daily
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-500/50 text-[8px] font-mono tracking-widest uppercase flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          Parasit[e] Alert
                        </span>
                        <span
                          className="text-amber-700/60 text-[9px] tracking-widest uppercase"
                          style={{ fontFamily: "var(--font-headline), Georgia, serif" }}
                        >
                          {dates[i]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative line */}
                  <div className="flex items-center gap-2 px-5 py-2 border-b border-amber-900/20">
                    <div className="flex-grow h-[1px] bg-amber-800/30" />
                    <AlertTriangle className="w-3 h-3 text-red-500/60" />
                    <span className="text-[8px] text-red-500/60 font-mono uppercase tracking-widest">Breaking</span>
                    <AlertTriangle className="w-3 h-3 text-red-500/60" />
                    <div className="flex-grow h-[1px] bg-amber-800/30" />
                  </div>

                  {/* Headline */}
                  <div className="px-5 pt-4 pb-2">
                    <h2
                      className="text-lg md:text-xl font-black text-amber-200/90 leading-tight tracking-tight"
                      style={{
                        fontFamily: "var(--font-headline), Georgia, 'Times New Roman', serif",
                        textShadow: "0 0 20px rgba(245,158,11,0.15), 0 0 40px rgba(6,182,212,0.05)",
                      }}
                    >
                      {headlines[i]}
                    </h2>
                  </div>

                  {/* Rule line — neon accent */}
                  <div className="mx-5 h-[2px] bg-gradient-to-r from-amber-700/40 via-cyan-500/15 to-transparent mb-3" />

                  {/* Article body */}
                  <div className="px-5 pb-5">
                    <div
                      className="text-sm text-amber-100/70 leading-relaxed whitespace-pre-wrap"
                      style={{
                        fontFamily: "var(--font-headline), Georgia, 'Times New Roman', serif",
                        columnCount: 1,
                      }}
                    >
                      {typedTexts[i] || ""}
                      {visibleClues.includes(i) && (!typedTexts[i] || typedTexts[i].length < t.clue.length) && (
                        <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-amber-400" />
                      )}
                    </div>

                    {/* Footer tagline */}
                    {typedTexts[i]?.length === t.clue.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 pt-3 border-t border-amber-800/20 flex items-center justify-between"
                      >
                        <span className="font-mono text-[9px] text-amber-600/40 tracking-widest uppercase">
                          Source: Citizen_Net_{sourceIds[i]}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                          <span className="font-mono text-[9px] text-cyan-500/60 uppercase tracking-widest">
                            Verified
                          </span>
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleClues.length === 3 && typedTexts[2]?.length === TRANSFORMER_DATA[2].clue.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded text-center relative overflow-hidden"
        >
          {/* Neon scan accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
          <p className="text-amber-400 font-mono text-sm tracking-widest uppercase animate-pulse relative z-10">
            All reports received — relay district names to Data Analyst
          </p>
        </motion.div>
      )}
    </div>
  );
}
