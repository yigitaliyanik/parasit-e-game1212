"use client";

import { useState } from "react";
import { ShieldAlert, Terminal, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ExecutivePanelProps {
  executiveAccessGranted: boolean;
  powerRestored: boolean;
  onGrantAccess: () => void;
  onComplete: () => void;
}

export default function ExecutivePanel({
  executiveAccessGranted,
  powerRestored,
  onGrantAccess,
  onComplete,
}: ExecutivePanelProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  // Department order state
  const DEPARTMENTS = ["Adult Ward", "Emergency Room", "Intensive Care", "Newborn Unit"];
  const [priorities, setPriorities] = useState<Record<string, number>>({
    "Adult Ward": 0,
    "Emergency Room": 0,
    "Intensive Care": 0,
    "Newborn Unit": 0,
  });
  const [routingError, setRoutingError] = useState(false);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === "HOSPITAL-77") {
      onGrantAccess();
      setError(false);
    } else {
      setError(true);
      setCode("");
    }
  };

  const handlePriorityChange = (dept: string, val: number) => {
    // If the value is already assigned elsewhere, swap it or clear the other one
    setPriorities(prev => {
      const next = { ...prev };
      // Clear any department that had this value
      Object.keys(next).forEach(k => {
        if (next[k] === val) next[k] = 0;
      });
      next[dept] = val;
      return next;
    });
    setRoutingError(false);
  };

  const checkRouting = () => {
    // Correct order:
    // 1. Newborn Unit
    // 2. Intensive Care
    // 3. Emergency Room
    // 4. Adult Ward
    if (
      priorities["Newborn Unit"] === 1 &&
      priorities["Intensive Care"] === 2 &&
      priorities["Emergency Room"] === 3 &&
      priorities["Adult Ward"] === 4
    ) {
      onComplete();
    } else {
      setRoutingError(true);
    }
  };

  if (!powerRestored) {
    if (!executiveAccessGranted) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 relative">
          <ShieldAlert className="w-16 h-16 text-fuchsia-500 mb-6" />
          <h2 className="text-2xl font-black text-fuchsia-500 uppercase tracking-[0.2em] mb-2 text-center">
            Security Firewall
          </h2>
          <p className="font-mono text-sm text-slate-400 mb-8 text-center max-w-sm">
            Hospital data archive locked. Enter maintenance override code to grant Analyst access.
          </p>

          <form onSubmit={handleCodeSubmit} className="w-full max-w-sm">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER OVERRIDE CODE"
                className={`w-full bg-black border p-4 text-center font-mono text-xl tracking-widest text-fuchsia-400 uppercase outline-none focus:border-fuchsia-400 transition-colors ${
                  error ? "border-red-500 text-red-500" : "border-fuchsia-500/30"
                }`}
                maxLength={20}
              />
              <button
                type="submit"
                className="w-full border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 py-4 font-mono font-bold tracking-widest uppercase hover:bg-fuchsia-500/20 transition-colors"
              >
                Verify Code
              </button>
            </div>
            {error && (
              <p className="text-red-500 font-mono text-xs mt-3 text-center uppercase tracking-widest animate-pulse">
                Access Denied. Invalid Code.
              </p>
            )}
          </form>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-black text-fuchsia-500 uppercase tracking-widest mb-2">
          Firewall Bypassed
        </h2>
        <p className="font-mono text-sm text-slate-400 max-w-md">
          Analyst has been granted data access. Waiting for Engineer to restore main power before routing can begin.
        </p>
        <div className="mt-8 flex items-center gap-2 text-amber-500 animate-pulse">
          <Zap className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-widest">Power Offline</span>
        </div>
      </div>
    );
  }

  // Phase 2: Power Restored, arrange departments
  return (
    <div className="h-full flex flex-col p-6 relative">
      <div className="flex items-center gap-3 mb-6 border-b border-fuchsia-500/30 pb-4">
        <Terminal className="w-6 h-6 text-fuchsia-500" />
        <h2 className="text-xl font-black text-fuchsia-500 uppercase tracking-widest">
          Power Routing Panel
        </h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        <p className="font-mono text-sm text-slate-400 text-center mb-8">
          Main power is active. You must route power to departments in the correct priority order to stabilize the hospital.
          Assign priority 1 (Highest) to 4 (Lowest).
        </p>

        <div className="w-full space-y-4 mb-8">
          {DEPARTMENTS.map((dept) => (
            <div key={dept} className="flex items-center justify-between bg-black border border-slate-800 p-4 rounded">
              <span className="font-mono text-slate-200 tracking-wider">{dept}</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => handlePriorityChange(dept, num)}
                    className={`w-10 h-10 flex items-center justify-center font-mono font-bold transition-all border ${
                      priorities[dept] === num
                        ? "bg-fuchsia-500 text-black border-fuchsia-500"
                        : "bg-black text-slate-500 border-slate-700 hover:border-fuchsia-500/50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={checkRouting}
          disabled={Object.values(priorities).some(v => v === 0)}
          className="w-full border border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 py-4 font-mono font-bold tracking-widest uppercase hover:bg-fuchsia-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Execute Power Routing
        </button>

        {routingError && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 font-mono text-sm mt-4 text-center uppercase tracking-widest animate-pulse border border-red-500/30 bg-red-500/10 py-2 px-4 rounded w-full"
          >
            CRITICAL ERROR: WRONG PRIORITY
          </motion.p>
        )}
      </div>
    </div>
  );
}
