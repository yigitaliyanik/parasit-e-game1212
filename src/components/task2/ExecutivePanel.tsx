"use client";

import { useState } from "react";
import { KeyRound, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ExecutivePanelProps {
  analystUnlockRequested: boolean;
  analystUnlocked: boolean;
  onUnlockAnalyst: () => Promise<void>;
  engineerPipeAccessRequested: boolean;
  engineerPipeAccessGranted: boolean;
  onGrantPipeAccess: (granted: boolean) => Promise<void>;
  executiveManualChoice?: string;
  onSubmitManualChoice: (choice: string) => Promise<void>;
}

export default function ExecutivePanel({
  analystUnlockRequested,
  analystUnlocked,
  onUnlockAnalyst,
  engineerPipeAccessRequested,
  engineerPipeAccessGranted,
  onGrantPipeAccess,
  executiveManualChoice,
  onSubmitManualChoice,
}: ExecutivePanelProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(executiveManualChoice || null);

  const systems = [
    { id: "1984", name: "MAIN INTAKE VALVE" },
    { id: "2042", name: "FILTRATION BYPASS" },
    { id: "0000", name: "PRESSURE RELEASE" },
  ];

  const handleSelectSystem = (id: string) => {
    if (executiveManualChoice) return; // Locked in
    setSelectedSystem(id);
    onSubmitManualChoice(id);
  };

  return (
    <div className="h-full flex flex-col relative z-10 text-slate-200">
      <div className="mb-6 flex items-center justify-between border-b border-fuchsia-500/30 pb-4">
        <div>
          <h2 className="text-2xl font-black text-fuchsia-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <KeyRound className="w-6 h-6" />
            Executive Override
          </h2>
          <p className="text-fuchsia-400/60 font-mono text-sm mt-1">
            System Authorization & Access Control
          </p>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-2 gap-8">
        {/* Access Requests */}
        <div className="space-y-6">
          <h3 className="font-mono text-sm text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            Pending Authorizations
          </h3>

          {/* Analyst Request */}
          <div className={`p-4 border rounded relative overflow-hidden ${
            analystUnlocked ? "border-green-500/50 bg-green-500/5" : "border-slate-800 bg-black"
          }`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="font-mono text-xs text-slate-500 mb-1">USER: DATA ANALYST</p>
                <p className="font-mono text-sm">Facility Handbook Decryption</p>
              </div>
              {analystUnlocked ? (
                <div className="flex items-center gap-2 text-green-400 font-mono text-xs">
                  <CheckCircle className="w-4 h-4" /> APPROVED
                </div>
              ) : analystUnlockRequested ? (
                <button
                  onClick={onUnlockAnalyst}
                  className="px-4 py-2 bg-fuchsia-500 text-black font-bold uppercase tracking-wider text-xs hover:bg-fuchsia-400 transition-colors"
                >
                  Approve
                </button>
              ) : (
                <div className="text-slate-600 font-mono text-xs">NO REQUEST</div>
              )}
            </div>
          </div>

          {/* Engineer Pipe Access Request */}
          <div className={`p-4 border rounded relative overflow-hidden ${
            engineerPipeAccessGranted ? "border-green-500/50 bg-green-500/5" : "border-slate-800 bg-black"
          }`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="font-mono text-xs text-slate-500 mb-1">USER: ENGINEER</p>
                <p className="font-mono text-sm">Manual Valve Override</p>
              </div>
              {engineerPipeAccessGranted ? (
                <div className="flex items-center gap-2 text-green-400 font-mono text-xs">
                  <CheckCircle className="w-4 h-4" /> APPROVED
                </div>
              ) : engineerPipeAccessRequested ? (
                <button
                  onClick={() => onGrantPipeAccess(true)}
                  className="px-4 py-2 bg-fuchsia-500 text-black font-bold uppercase tracking-wider text-xs hover:bg-fuchsia-400 transition-colors"
                >
                  Approve
                </button>
              ) : (
                <div className="text-slate-600 font-mono text-xs">NO REQUEST</div>
              )}
            </div>
          </div>
        </div>

        {/* System Code Transmitter */}
        <div className="space-y-6">
          <h3 className="font-mono text-sm text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            Target System Designation
          </h3>
          <p className="font-mono text-xs text-slate-500">
            Select the system to transmit its access code to the Engineer's terminal.
          </p>

          <div className="space-y-3">
            {systems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => handleSelectSystem(sys.id)}
                disabled={!!executiveManualChoice}
                className={`w-full p-4 border rounded flex justify-between items-center transition-all ${
                  selectedSystem === sys.id
                    ? "border-fuchsia-500 bg-fuchsia-500/10"
                    : "border-slate-800 bg-black hover:border-slate-600"
                } ${executiveManualChoice && selectedSystem !== sys.id ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span className="font-mono text-sm">{sys.name}</span>
                {selectedSystem === sys.id && (
                  <CheckCircle className="w-4 h-4 text-fuchsia-400" />
                )}
              </button>
            ))}
          </div>

          {executiveManualChoice && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="p-3 border border-amber-500/30 bg-amber-500/10 rounded flex items-start gap-3 mt-4"
             >
               <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
               <p className="font-mono text-xs text-amber-200/80">
                 Code transmitted to Engineering terminal. Selection locked.
               </p>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
