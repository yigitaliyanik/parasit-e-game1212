"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { Role, TRANSFORMER_DATA } from "@/lib/types";
import GameTimer from "@/components/GameTimer";
import JournalistPanel from "@/components/task1/JournalistPanel";
import AnalystPanel from "@/components/task1/AnalystPanel";
import ExecutivePanel from "@/components/task1/ExecutivePanel";
import EngineerPanel from "@/components/task1/EngineerPanel";
import { Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PlayingPhaseProps {
  roomId: string;
}

export default function PlayingPhase({ roomId }: PlayingPhaseProps) {
  const {
    session,
    currentUser,
    currentPlayer,
    setGameOver,
    submitAnalystId,
    authorizeRepair,
    completeRepair,
    updateGameStatus,
  } = useGameSession(roomId);

  const [task1Complete, setTask1Complete] = useState(false);

  const role = currentPlayer?.role as Role;
  const task1 = session?.task1;
  const foundIds = task1?.analystFoundIds || [];
  const authorizedIds = task1?.executiveAuthorized || [];
  const repairedIds = task1?.engineerRepaired || [];

  // Check Task 1 completion
  useEffect(() => {
    if (repairedIds.length === 3 && !task1Complete) {
      setTask1Complete(true);
    }
  }, [repairedIds.length, task1Complete]);

  if (!session || !currentPlayer || !currentUser) return null;

  const roleColors: Record<Role, string> = {
    journalist: "text-amber-400",
    analyst: "text-green-400",
    engineer: "text-cyan-400",
    executive: "text-fuchsia-400",
  };

  const roleLabels: Record<Role, string> = {
    journalist: "JOURNALIST",
    analyst: "DATA ANALYST",
    engineer: "ENGINEER",
    executive: "EXECUTIVE",
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col relative overflow-hidden">
      {/* Background FX */}
      <div className="scanline" />
      <div className="noise-bg" />

      {/* Global Timer */}
      {session.startTime && (
        <GameTimer
          startTime={session.startTime}
          penaltyTime={session.penaltyTime}
          onTimeUp={setGameOver}
        />
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 p-6 relative z-10">
        {/* Left Sidebar: Role Identity + Transformer Status */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Role Card */}
          <div className="bg-[#030712]/80 border border-[#00ffff]/20 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#00ffff]/10 rounded border border-[#00ffff]/30">
                <Cpu className="w-6 h-6 text-[#00ff9d]" />
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Terminal</h3>
                <p className={`text-lg font-black uppercase tracking-wider ${roleColors[role]}`}>
                  {roleLabels[role]}
                </p>
              </div>
            </div>
            <div className="font-mono text-[10px] text-slate-500 space-y-1">
              <p>AGENT: {currentUser.name}</p>
              <p>ID: PRST_{currentUser.id.substring(0, 6)}</p>
            </div>
          </div>

          {/* Mission Status */}
          <div className="bg-[#030712]/80 border border-[#00ffff]/20 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                Mission 01: Power Grid
              </h4>
            </div>

            <div className="space-y-3">
              {TRANSFORMER_DATA.map((t, idx) => {
                const isFound = foundIds.includes(t.id);
                const isAuthorized = authorizedIds.includes(t.id);
                const isRepaired = repairedIds.includes(t.id);

                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 p-2 rounded border transition-all ${
                      isRepaired
                        ? "border-green-500/30 bg-green-500/5"
                        : isAuthorized
                        ? "border-fuchsia-500/30 bg-fuchsia-500/5"
                        : isFound
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-slate-800 bg-black/20"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      isRepaired
                        ? "bg-green-500 shadow-[0_0_8px_#22c55e]"
                        : isAuthorized
                        ? "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]"
                        : isFound
                        ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                        : "bg-slate-700"
                    }`} />
                    <div className="flex-grow">
                      <p className="font-mono text-[10px] text-slate-400">
                        {isFound ? t.district : `Sector ${String(idx + 1).padStart(2, "0")}`}
                      </p>
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${
                      isRepaired ? "text-green-400" : isAuthorized ? "text-fuchsia-400" : isFound ? "text-amber-400" : "text-slate-600"
                    }`}>
                      {isRepaired ? "OK" : isAuthorized ? "AUTH" : isFound ? "ID" : "???"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-[#030712]/80 border border-[#00ffff]/20 p-4 rounded-lg">
            <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Team</h4>
            <div className="space-y-2">
              {Object.values(session.players).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Panel: Role-Specific Content */}
        <div className="flex-grow bg-[#030712]/80 border border-[#00ffff]/20 p-8 rounded-lg shadow-2xl relative overflow-hidden">
          {task1Complete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
              <h2 className="text-3xl font-black text-green-400 uppercase tracking-[0.3em] mb-4">
                Grid Stabilized
              </h2>
              <p className="text-slate-400 font-mono text-sm max-w-md">
                All 3 transformers have been repaired. The power grid is back online.
                Parasit[e]&apos;s hold on the infrastructure is weakening.
              </p>
              <p className="text-[#00ff9d] font-mono text-xs uppercase tracking-widest mt-8 animate-pulse">
                Mission 01 Complete — Awaiting Next Directive...
              </p>
            </motion.div>
          ) : (
            <>
              {role === "journalist" && <JournalistPanel />}
              {role === "analyst" && (
                <AnalystPanel
                  foundIds={foundIds}
                  onSubmitId={submitAnalystId}
                />
              )}
              {role === "executive" && (
                <ExecutivePanel
                  analystFoundIds={foundIds}
                  authorizedIds={authorizedIds}
                  repairedIds={repairedIds}
                  onAuthorize={authorizeRepair}
                />
              )}
              {role === "engineer" && (
                <EngineerPanel
                  authorizedIds={authorizedIds}
                  repairedIds={repairedIds}
                  onCompleteRepair={completeRepair}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
