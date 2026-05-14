"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { Role, ALL_DISTRICTS } from "@/lib/types";
import GameTimer from "@/components/GameTimer";
import JournalistPanel from "@/components/task1/JournalistPanel";
import AnalystPanel from "@/components/task1/AnalystPanel";
import ExecutivePanel from "@/components/task1/ExecutivePanel";
import EngineerPanel from "@/components/task1/EngineerPanel";
import Task2JournalistPanel from "@/components/task2/JournalistPanel";
import Task2AnalystPanel from "@/components/task2/AnalystPanel";
import Task2ExecutivePanel from "@/components/task2/ExecutivePanel";
import Task2EngineerPanel from "@/components/task2/EngineerPanel";
import Task3JournalistPanel from "@/components/task3/JournalistPanel";
import Task3AnalystPanel from "@/components/task3/AnalystPanel";
import Task3ExecutivePanel from "@/components/task3/ExecutivePanel";
import Task3EngineerPanel from "@/components/task3/EngineerPanel";
import Task4JournalistPanel from "@/components/task4/JournalistPanel";
import Task4AnalystPanel from "@/components/task4/AnalystPanel";
import Task4ExecutivePanel from "@/components/task4/ExecutivePanel";
import Task4EngineerPanel from "@/components/task4/EngineerPanel";
import VictoryScreen from "@/components/phases/VictoryScreen";
import { Cpu, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

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
    removeAuthorization,
    completeRepair,
    updateGameStatus,
    setMission2Ready,
    startMission2,
    requestAnalystUnlock,
    completeAnalystUnlock,
    submitExecutiveManualChoice,
    submitEngineerCodeTask2,
    requestPipeAccess,
    grantPipeAccess,
    completeTask2Puzzle,
    setMission3Ready,
    startMission3,
    setTask3ExecutiveAccess,
    setTask3EngineerLogged,
    setTask3PowerRestored,
    setTask3Completed,
    setMission4Ready,
    startMission4,
    setTask4RouteChanged,
    setTask4WagonsDetached,
    setTask4Completed,
  } = useGameSession(roomId);

  const [task1Complete, setTask1Complete] = useState(false);

  const role = currentPlayer?.role as Role;
  const task1 = session?.task1;
  const task2 = session?.task2;
  const task3 = session?.task3;
  const task4 = session?.task4;
  const foundIds = task1?.analystFoundIds || [];
  const authorizedIds = task1?.executiveAuthorized || [];
  const repairedIds = task1?.engineerRepaired || [];
  const selectedDistrictIds = task1?.selectedDistrictIds || [];

  // Resolve the 3 selected districts from the master list for sidebar display
  const selectedDistricts = useMemo(() => {
    return selectedDistrictIds
      .map(id => ALL_DISTRICTS.find(d => d.id === id))
      .filter(Boolean);
  }, [selectedDistrictIds]);

  // Check Task 1 completion
  useEffect(() => {
    if (session?.currentMission === 1 && repairedIds.length === 3 && !task1Complete) {
      setTask1Complete(true);
    }
  }, [repairedIds.length, task1Complete, session?.currentMission]);

  // Handle all players ready for Mission 2
  useEffect(() => {
    if (session?.currentMission === 1 && task1Complete) {
      const allReady = Object.values(session.players || {}).every(
        (p) => session.mission2Ready?.[p.id]
      );
      if (allReady && currentPlayer?.isHost) {
        startMission2();
      }
    }
  }, [session, task1Complete, currentPlayer, startMission2]);

  // Handle all players ready for Mission 3
  useEffect(() => {
    if (session?.currentMission === 2 && task2?.puzzleSolved) {
      const allReady = Object.values(session.players || {}).every(
        (p) => session.mission3Ready?.[p.id]
      );
      if (allReady && currentPlayer?.isHost) {
        startMission3();
      }
    }
  }, [session, task2?.puzzleSolved, currentPlayer, startMission3]);

  // Handle all players ready for Mission 4
  useEffect(() => {
    if (session?.currentMission === 3 && task3?.completed) {
      const allReady = Object.values(session.players || {}).every(
        (p) => session.mission4Ready?.[p.id]
      );
      if (allReady && currentPlayer?.isHost) {
        startMission4();
      }
    }
  }, [session, task3?.completed, currentPlayer, startMission4]);

  // Handle Mission 4 Victory Condition
  useEffect(() => {
    if (session?.currentMission === 4 && task4?.routeChanged && task4?.wagonsDetached && !task4?.completed) {
      if (currentPlayer?.isHost) {
        setTask4Completed(true);
      }
    }
  }, [session?.currentMission, task4?.routeChanged, task4?.wagonsDetached, task4?.completed, currentPlayer?.isHost, setTask4Completed]);

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
          <div className="bg-black border border-[#00ffff]/20 p-6 rounded-lg">
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

          {/* Mission Status — depends on currentMission */}
          <div className="bg-black border border-[#00ffff]/20 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                {session.currentMission === 4 ? "Mission 04: The Toxic Express" : session.currentMission === 3 ? "Mission 03: Central Hospital" : session.currentMission === 2 ? "Mission 02: Water Treatment" : "Mission 01: Power Grid"}
              </h4>
            </div>

            <div className="space-y-3">
              {session.currentMission === 4 ? (
                <div className="space-y-2">
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task4?.routeChanged ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task4?.routeChanged ? "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Route Diverted</span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task4?.wagonsDetached ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task4?.wagonsDetached ? "bg-cyan-500 shadow-[0_0_8px_#22d3ee]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Wagons Decoupled</span>
                  </div>
                </div>
              ) : session.currentMission === 3 ? (
                <div className="space-y-2">
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task3?.executiveAccessGranted ? "border-green-500/30 bg-green-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task3?.executiveAccessGranted ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Security Firewall</span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task3?.engineerLogged ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task3?.engineerLogged ? "bg-cyan-500 shadow-[0_0_8px_#22d3ee]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Mainframe Override</span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task3?.powerRestored ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task3?.powerRestored ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Power Rerouted</span>
                  </div>
                </div>
              ) : session.currentMission === 2 ? (
                <div className="space-y-2">
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task2?.analystUnlocked ? "border-green-500/30 bg-green-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task2?.analystUnlocked ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Handbook Decryption</span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task2?.executiveGrantedPipeAccess ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task2?.executiveGrantedPipeAccess ? "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Safety Override</span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded border transition-all ${task2?.puzzleSolved ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-800 bg-black/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${task2?.puzzleSolved ? "bg-cyan-500 shadow-[0_0_8px_#22d3ee]" : "bg-slate-700"}`} />
                    <span className="font-mono text-[10px] text-slate-400">Manifold Rerouted</span>
                  </div>
                </div>
              ) : selectedDistricts.length > 0 ? (
                selectedDistricts.map((t, idx) => {
                  if (!t) return null;
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
                })
              ) : (
                <div className="text-slate-600 font-mono text-[10px] text-center py-2 animate-pulse">
                  Initializing targets...
                </div>
              )}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-black border border-[#00ffff]/20 p-4 rounded-lg">
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
        <div className="flex-grow bg-black border border-[#00ffff]/20 p-8 rounded-lg shadow-2xl relative overflow-hidden">
          {session.currentMission === 1 && task1Complete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
              <h2 className="text-3xl font-black text-green-400 uppercase tracking-[0.3em] mb-4">
                Grid Stabilized
              </h2>
              <p className="text-slate-400 font-mono text-sm max-w-md mb-8">
                All 3 transformers have been repaired. The power grid is back online.
                Parasit[e]&apos;s hold on the infrastructure is weakening.
              </p>

              <button
                onClick={() => setMission2Ready(!session.mission2Ready?.[currentPlayer.id])}
                className={`px-8 py-4 font-mono uppercase tracking-widest transition-all border ${
                  session.mission2Ready?.[currentPlayer.id]
                    ? "bg-green-500/20 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    : "bg-black text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                {session.mission2Ready?.[currentPlayer.id] ? "Standing By..." : "Ready for Next Directive"}
              </button>

              <p className="text-[#00ff9d] font-mono text-xs uppercase tracking-widest mt-8 animate-pulse">
                Mission 01 Complete &mdash; Awaiting Next Directive...
              </p>
            </motion.div>
          ) : session.currentMission === 2 && task2?.puzzleSolved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-cyan-400 mb-6" />
              <h2 className="text-3xl font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">
                Water Pressure Stabilized
              </h2>
              <p className="text-slate-400 font-mono text-sm max-w-md">
                The water treatment facility has bypassed the corrupted sector. 
                Parasit[e] infection localized.
              </p>
              <button
                onClick={() => setMission3Ready(!session.mission3Ready?.[currentPlayer.id])}
                className={`mt-8 px-8 py-4 font-mono uppercase tracking-widest transition-all border ${
                  session.mission3Ready?.[currentPlayer.id]
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "bg-black text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                {session.mission3Ready?.[currentPlayer.id] ? "Standing By..." : "Ready for Next Directive"}
              </button>
            </motion.div>
          ) : session.currentMission === 3 && task3?.completed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-fuchsia-400 mb-6" />
              <h2 className="text-3xl font-black text-fuchsia-400 uppercase tracking-[0.3em] mb-4">
                Hospital Secured
              </h2>
              <p className="text-slate-400 font-mono text-sm max-w-md">
                Central Hospital power grid has been successfully rerouted.
                Critical patients are stable. Parasit[e] has been expelled from this sector.
              </p>
              <button
                onClick={() => setMission4Ready(!session.mission4Ready?.[currentPlayer.id])}
                className={`mt-8 px-8 py-4 font-mono uppercase tracking-widest transition-all border ${
                  session.mission4Ready?.[currentPlayer.id]
                    ? "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                    : "bg-black text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                {session.mission4Ready?.[currentPlayer.id] ? "Standing By..." : "Ready for Next Directive"}
              </button>
            </motion.div>
          ) : session.currentMission === 4 ? (
            <>
              {role === "journalist" && <Task4JournalistPanel />}
              {role === "analyst" && <Task4AnalystPanel />}
              {role === "executive" && (
                <Task4ExecutivePanel
                  routeChanged={task4?.routeChanged || false}
                  onUpdateRoute={() => setTask4RouteChanged(true)}
                />
              )}
              {role === "engineer" && (
                <Task4EngineerPanel
                  routeChanged={task4?.routeChanged || false}
                  wagonsDetached={task4?.wagonsDetached || false}
                  onComplete={() => setTask4WagonsDetached(true)}
                />
              )}
            </>
          ) : session.currentMission === 3 ? (
            <>
              {role === "journalist" && <Task3JournalistPanel />}
              {role === "analyst" && (
                <Task3AnalystPanel
                  executiveAccessGranted={task3?.executiveAccessGranted || false}
                />
              )}
              {role === "executive" && (
                <Task3ExecutivePanel
                  executiveAccessGranted={task3?.executiveAccessGranted || false}
                  powerRestored={task3?.powerRestored || false}
                  onGrantAccess={() => setTask3ExecutiveAccess(true)}
                  onComplete={() => setTask3Completed(true)}
                />
              )}
              {role === "engineer" && (
                <Task3EngineerPanel
                  engineerLogged={task3?.engineerLogged || false}
                  powerRestored={task3?.powerRestored || false}
                  onLogin={() => setTask3EngineerLogged(true)}
                  onPowerRestored={() => setTask3PowerRestored(true)}
                />
              )}
            </>
          ) : session.currentMission === 2 ? (
            <>
              {role === "journalist" && <Task2JournalistPanel />}
              {role === "analyst" && (
                <Task2AnalystPanel
                  unlockRequested={task2?.analystUnlockRequested || false}
                  unlocked={task2?.analystUnlocked || false}
                  onRequestUnlock={requestAnalystUnlock}
                />
              )}
              {role === "executive" && (
                <Task2ExecutivePanel
                  analystUnlockRequested={task2?.analystUnlockRequested || false}
                  analystUnlocked={task2?.analystUnlocked || false}
                  onUnlockAnalyst={completeAnalystUnlock}
                  engineerPipeAccessRequested={task2?.pipeAccessRequested || false}
                  engineerPipeAccessGranted={task2?.executiveGrantedPipeAccess || false}
                  onGrantPipeAccess={grantPipeAccess}
                  executiveManualChoice={task2?.executiveManualChoice}
                  onSubmitManualChoice={submitExecutiveManualChoice}
                />
              )}
              {role === "engineer" && (
                <Task2EngineerPanel
                  codeEntered={task2?.engineerCodeEntered || false}
                  onSubmitCode={submitEngineerCodeTask2}
                  pipeAccessRequested={task2?.pipeAccessRequested || false}
                  pipeAccessGranted={task2?.executiveGrantedPipeAccess || false}
                  onRequestPipeAccess={requestPipeAccess}
                  puzzleSolved={task2?.puzzleSolved || false}
                  onPuzzleComplete={completeTask2Puzzle}
                />
              )}
            </>
          ) : (
            <>
              {role === "journalist" && (
                <JournalistPanel selectedDistrictIds={selectedDistrictIds} />
              )}
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
                  selectedDistrictIds={selectedDistrictIds}
                  onCompleteRepair={completeRepair}
                  onRemoveAuthorization={removeAuthorization}
                />
              )}
            </>
          )}
        </div>
      </div>
      {session.task4?.completed && (
        <VictoryScreen roomId={roomId} />
      )}
    </div>
  );
}
