"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Radio } from "lucide-react";
import { TRANSFORMER_DATA } from "@/lib/types";

export default function JournalistPanel() {
  const [visibleClues, setVisibleClues] = useState<number[]>([]);
  const [typedTexts, setTypedTexts] = useState<Record<number, string>>({});

  const typeClue = useCallback(async (index: number, text: string) => {
    let current = "";
    for (let i = 0; i < text.length; i++) {
      current += text[i];
      setTypedTexts(prev => ({ ...prev, [index]: current }));
      await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
    }
  }, []);

  useEffect(() => {
    const revealClues = async () => {
      for (let i = 0; i < TRANSFORMER_DATA.length; i++) {
        await new Promise(r => setTimeout(r, i === 0 ? 500 : 2000));
        setVisibleClues(prev => [...prev, i]);
        await typeClue(i, TRANSFORMER_DATA[i].clue);
      }
    };
    revealClues();
  }, [typeClue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/10 rounded border border-amber-500/30">
          <Radio className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Incoming Transmissions</h3>
          <p className="text-lg font-black text-amber-400 uppercase tracking-wider">Citizen Reports</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-mono border-l-2 border-amber-500/30 pl-4 mb-6">
        Intercepted citizen reports from affected districts. Read carefully and relay 
        the <span className="text-amber-400 font-bold">district names</span> to the Data Analyst.
      </p>

      {/* Clue Cards */}
      <div className="space-y-4">
        {TRANSFORMER_DATA.map((t, i) => (
          <div
            key={t.id}
            className={`transition-all duration-500 ${
              visibleClues.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="bg-black/60 border border-amber-500/20 rounded-lg p-5 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full" />
              
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                  Report #{i + 1} — {new Date().toLocaleDateString()} // PRIORITY: HIGH
                </span>
              </div>

              <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed pl-7">
                {typedTexts[i] || ""}
                {visibleClues.includes(i) && (!typedTexts[i] || typedTexts[i].length < t.clue.length) && (
                  <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-amber-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleClues.length === 3 && typedTexts[2]?.length === TRANSFORMER_DATA[2].clue.length && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded text-center">
          <p className="text-amber-400 font-mono text-sm tracking-widest uppercase animate-pulse">
            All reports received — relay district names to Data Analyst
          </p>
        </div>
      )}
    </div>
  );
}
