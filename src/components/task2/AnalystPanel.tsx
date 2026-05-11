"use client";

import { Lock, Unlock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface AnalystPanelProps {
  unlockRequested: boolean;
  unlocked: boolean;
  onRequestUnlock: () => Promise<void>;
}

export default function AnalystPanel({
  unlockRequested,
  unlocked,
  onRequestUnlock
}: AnalystPanelProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center relative z-10 text-slate-200">
      {!unlocked ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="mx-auto w-24 h-24 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest">
            Handbook Encrypted
          </h2>
          <p className="font-mono text-sm text-slate-400">
            The Water Treatment Facility Operations Handbook requires Executive Level Clearance to decrypt.
          </p>

          {!unlockRequested ? (
            <button
              onClick={onRequestUnlock}
              className="w-full py-4 border border-green-500 text-green-500 font-mono tracking-widest hover:bg-green-500/10 transition-colors uppercase"
            >
              Request Decryption
            </button>
          ) : (
            <div className="w-full py-4 border border-amber-500/50 text-amber-500/80 font-mono tracking-widest uppercase animate-pulse">
              Request Sent — Awaiting Executive...
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full flex flex-col"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-green-500/30 pb-4">
            <BookOpen className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-black text-green-400 uppercase tracking-[0.2em]">
              Facility Handbook
            </h2>
          </div>

          <div className="flex-grow grid grid-cols-2 gap-6 font-mono text-sm">
            <div className="bg-black border border-slate-800 p-6 rounded">
              <h3 className="text-green-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
                Emergency Codes
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li>
                  <span className="text-slate-500 block text-xs">WATER INTAKE VALVE</span>
                  <span className="text-lg">1984</span>
                </li>
                <li>
                  <span className="text-slate-500 block text-xs">FILTRATION BYPASS</span>
                  <span className="text-lg">2042</span>
                </li>
                <li>
                  <span className="text-slate-500 block text-xs">PRESSURE RELEASE</span>
                  <span className="text-lg">0000</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-slate-800 p-6 rounded">
              <h3 className="text-green-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
                Routing Protocol
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                To stabilize pressure during a system anomaly, flow must be redirected from the Main Intake to the Filtration Bypass.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Connect the <span className="text-cyan-400">BLUE</span> intake node directly to the <span className="text-emerald-400">GREEN</span> bypass node. Avoid damaged sectors (red).
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
