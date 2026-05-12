"use client";

import { useState } from "react";
import { Terminal, Code2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface EngineerPanelProps {
  engineerLogged: boolean;
  powerRestored: boolean;
  onLogin: () => void;
  onPowerRestored: () => void;
}

const CORRUPTED_ARRAYS = [
  { func: "init_tools", items: ["Scalpel", "Stethoscope", "Gun", "Syringe"], bad: "Gun" },
  { func: "load_organs", items: ["Heart", "Spark_Plug", "Lungs", "Liver"], bad: "Spark_Plug" },
  { func: "set_treatment", items: ["Antibiotics", "Poison", "Painkillers", "IV_Fluid"], bad: "Poison" },
  { func: "verify_staff", items: ["Nurse", "Doctor", "Surgeon", "Teacher"], bad: "Teacher" },
  { func: "check_vitals", items: ["Heart_Rate", "Blood_Pressure", "Stock_Index", "Temperature"], bad: "Stock_Index" },
  { func: "iv_fluids", items: ["Blood", "Saline", "Crude_Oil", "Plasma"], bad: "Crude_Oil" },
  { func: "route_power", items: ["Cardiology", "Neurology", "Astrology", "Oncology"], bad: "Astrology" },
  { func: "filter_air", items: ["Oxygen", "Plastic_Waste", "Nitrogen", "Steam"], bad: "Plastic_Waste" },
  { func: "dispense_meds", items: ["Paracetamol", "Insulin", "Penicillin", "Acid_Rain"], bad: "Acid_Rain" },
  { func: "log_symptoms", items: ["Cough", "Bruising", "Radiation", "Fatigue"], bad: "Radiation" },
];

export default function EngineerPanel({
  engineerLogged,
  powerRestored,
  onLogin,
  onPowerRestored,
}: EngineerPanelProps) {
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [clearedIndices, setClearedIndices] = useState<Set<number>>(new Set());

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === "ROOT-55") {
      onLogin();
      setLoginError(false);
    } else {
      setLoginError(true);
      setCode("");
    }
  };

  const handleWordClick = (index: number, word: string) => {
    if (clearedIndices.has(index)) return;

    if (CORRUPTED_ARRAYS[index].bad === word) {
      const newCleared = new Set(clearedIndices);
      newCleared.add(index);
      setClearedIndices(newCleared);

      if (newCleared.size === CORRUPTED_ARRAYS.length) {
        onPowerRestored();
      }
    }
  };

  if (!engineerLogged) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative">
        <Terminal className="w-16 h-16 text-cyan-500 mb-6" />
        <h2 className="text-2xl font-black text-cyan-500 uppercase tracking-[0.2em] mb-2 text-center">
          Mainframe Login
        </h2>
        <p className="font-mono text-sm text-slate-400 mb-8 text-center max-w-sm">
          Awaiting mainframe access credentials from the Analyst.
        </p>

        <form onSubmit={handleLoginSubmit} className="w-full max-w-sm">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER MAINFRAME CODE"
              className={`w-full bg-black border p-4 text-center font-mono text-xl tracking-widest text-cyan-400 uppercase outline-none focus:border-cyan-400 transition-colors ${
                loginError ? "border-red-500 text-red-500" : "border-cyan-500/30"
              }`}
              maxLength={20}
            />
            <button
              type="submit"
              className="w-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 py-4 font-mono font-bold tracking-widest uppercase hover:bg-cyan-500/20 transition-colors"
            >
              Access Mainframe
            </button>
          </div>
          {loginError && (
            <p className="text-red-500 font-mono text-xs mt-3 text-center uppercase tracking-widest animate-pulse">
              Access Denied. Root credentials required.
            </p>
          )}
        </form>
      </div>
    );
  }

  if (powerRestored) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-cyan-500 mb-4" />
        <h2 className="text-xl font-black text-cyan-500 uppercase tracking-widest mb-2">
          System Cleaned
        </h2>
        <p className="font-mono text-sm text-cyan-400 max-w-md animate-pulse">
          MAIN POWER ACTIVE. WAITING FOR EXECUTIVE ROUTING.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-black text-cyan-500 uppercase tracking-widest">
            Data Purification
          </h2>
        </div>
        <div className="font-mono text-sm text-cyan-400">
          Cleaned: {clearedIndices.size}/{CORRUPTED_ARRAYS.length}
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto pr-2 custom-scrollbar">
        <p className="font-mono text-sm text-slate-400 mb-6">
          System arrays contain corrupt values injected by the Parasit[e]. Click the incorrect/corrupt element in each array to isolate it.
        </p>

        <div className="space-y-3 font-mono text-xs sm:text-sm">
          {CORRUPTED_ARRAYS.map((data, index) => {
            const isCleared = clearedIndices.has(index);

            return (
              <div 
                key={index}
                className={`p-3 rounded border transition-all ${
                  isCleared 
                    ? "border-green-500/30 bg-green-500/5 text-slate-500" 
                    : "border-slate-800 bg-black text-slate-300"
                }`}
              >
                <span className={isCleared ? "text-green-500/50" : "text-cyan-400"}>
                  {data.func}
                </span>
                <span className="text-slate-500">([</span>
                
                {data.items.map((word, wordIdx) => (
                  <span key={wordIdx}>
                    <button
                      disabled={isCleared}
                      onClick={() => handleWordClick(index, word)}
                      className={`transition-colors ${
                        isCleared
                          ? word === data.bad 
                            ? "line-through text-red-500/50 decoration-red-500/50" 
                            : "text-slate-600"
                          : "text-amber-200 hover:text-white hover:bg-cyan-500/20 px-1 rounded"
                      }`}
                    >
                      &quot;{word}&quot;
                    </button>
                    {wordIdx < data.items.length - 1 && <span className="text-slate-500">, </span>}
                  </span>
                ))}
                
                <span className="text-slate-500">])</span>
                
                {isCleared && (
                  <span className="ml-4 text-[10px] text-green-500 uppercase tracking-widest border border-green-500/30 px-2 py-0.5 rounded">
                    Clean
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
