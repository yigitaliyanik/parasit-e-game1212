"use client";

import { useState, useEffect, useRef } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { Zap, Activity, Shield, Search, Cpu, Power, AlertCircle, Terminal as TerminalIcon, CheckCircle2, XCircle, Settings, Lock } from "lucide-react";
import clsx from "clsx";

interface PlayingPhaseProps {
  roomId: string;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  engineer: Zap,
  analyst: Activity,
  executive: Shield,
  journalist: Search,
};

const ROLE_COLORS: Record<string, string> = {
  engineer: "#00ff9d",
  analyst: "#3b82f6",
  executive: "#8b5cf6",
  journalist: "#ec4899",
};

const LOCATIONS = [
  "Hospital", "Water Treatment", "School", "City Square",
  "Mall", "Parasit[e] Ground Zero", "City Hall", "Central Park",
  "Power Plant", "Industrial Zone"
];

const CORRECT_LOCATIONS = ["Hospital", "Water Treatment", "School", "City Square"];

export default function PlayingPhase({ roomId }: PlayingPhaseProps) {
  const { 
    session, 
    currentPlayer, 
    incrementGenerator, 
    setMission1Ready, 
    updateMission1Status, 
    updateMission1Data,
    applyPenalty,
    setAuthStatus,
    setSystemOnline
  } = useGameSession(roomId);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [glitching, setGlitching] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [localRepairProgress, setLocalRepairProgress] = useState(0);
  const prevOnline = useRef(false);
  const prevStatus = useRef<string | undefined>(undefined);

  // Countdown logic with penalty
  useEffect(() => {
    if (!session?.startTime || !session?.isSystemOnline) return;
    const DURATION_MS = 20 * 60 * 1000;
    const penaltyMs = (session.penaltyTime || 0) * 1000;
    const endTime = session.startTime + DURATION_MS - penaltyMs;

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      setTimeLeft(diff);
      return diff;
    };

    tick();
    const timer = setInterval(() => {
      if (tick() === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.startTime, session?.isSystemOnline, session?.penaltyTime]);

  // Handle Mission 1 transitions
  useEffect(() => {
    if (!session) return;
    
    // Dramatic Reveal of Mission Complete
    if (session.mission1Status === "complete" && prevStatus.current !== "complete") {
      setGlitching(true);
      setTimeout(() => {
        setShowTimer(true);
        setGlitching(false);
      }, 2000);
    }
    
    prevStatus.current = session.mission1Status;
  }, [session?.mission1Status]);

  // Executive Repairing Bar
  useEffect(() => {
    if (session?.mission1Status === "repairing") {
      const interval = setInterval(() => {
        setLocalRepairProgress(prev => {
          const next = prev + 1;
          if (next >= 100) {
            clearInterval(interval);
            if (currentPlayer?.role === 'executive') {
              updateMission1Status("complete");
            }
            return 100;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setLocalRepairProgress(0);
    }
  }, [session?.mission1Status, currentPlayer?.role]);

  if (!session || !currentPlayer) return null;

  const progress = Math.min(100, session.generatorProgress ?? 0);
  const isOnline = session.isSystemOnline;
  const role = currentPlayer.role;
  const RoleIcon = role ? ROLE_ICONS[role] : null;
  const roleColor = role ? ROLE_COLORS[role] : "#00ff9d";
  const missionStatus = session.mission1Status || "briefing";

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  // ─── BLACKOUT PHASE (Access Sync) ───────────────────
  if (!isOnline) {
    return (
      <AccessSyncPhase 
        session={session} 
        currentPlayer={currentPlayer} 
        setAuthStatus={setAuthStatus} 
        setSystemOnline={setSystemOnline} 
      />
    );
  }

  // ─── MISSION 1: BRIEFING ──────────────────────────────────
  if (missionStatus === "briefing") {
    const readyCount = Object.values(session.mission1Ready || {}).filter(Boolean).length;
    const isLocalReady = session.mission1Ready?.[currentPlayer.id] || false;

    if (readyCount === 4 && currentPlayer.isHost) {
      updateMission1Status("in_progress");
    }

    return (
      <div className="min-h-screen bg-[#02060a] flex flex-col items-center justify-center p-8 font-mono">
        <div className="scanline" />
        <div className="text-center space-y-12 max-w-4xl">
          <div className="space-y-4">
            <h1 className="text-[#00ff9d] text-4xl md:text-6xl font-black tracking-tighter uppercase animate-pulse">
              Generators Online
            </h1>
            <p className="text-[#4a6b8c] text-xl tracking-[0.5em] uppercase">Main System Stabilized</p>
          </div>

          <div className="bg-[#050b12] border border-[#1a2c3f] p-10 rounded-3xl shadow-2xl space-y-8">
            <div className="flex items-center justify-center gap-4 text-[#8b5cf6]">
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm font-bold tracking-[0.3em] uppercase animate-pulse">Containment Protocol: Grid Infection</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
              The Parasite has reached the power grid. Authorized agents must coordinate to identify hit zones and neutralize the infection in the following sectors before the core is consumed.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setMission1Ready(!isLocalReady)}
                className={clsx(
                  "px-10 py-4 rounded-xl font-black tracking-[0.2em] uppercase transition-all duration-300 transform active:scale-95",
                  isLocalReady 
                    ? "bg-[#00ff9d] text-black shadow-[0_0_30px_#00ff9d]" 
                    : "bg-[#0a1a2f] text-[#00ff9d] border border-[#00ff9d]/30 hover:border-[#00ff9d]"
                )}
              >
                {isLocalReady ? "Ready to Deploy" : "Start Mission 1"}
              </button>

              <div className="flex gap-4">
                {Object.values(session.players).map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className={clsx(
                      "w-12 h-1 rounded-full transition-all duration-500",
                      session.mission1Ready?.[p.id] ? "bg-[#00ff9d]" : "bg-[#1a2c3f]"
                    )} />
                    <span className="text-[9px] text-[#4a6b8c] uppercase font-bold">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN MISSION CONTENT ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#02060a] flex flex-col relative overflow-hidden font-mono">
      <div className="scanline" />
      
      {/* ── GLOBAL TIMER (Hidden until complete) ── */}
      <div className={clsx(
        "relative z-50 transition-all duration-1000 transform",
        showTimer ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      )}>
        <div className="bg-[#060e18] border-b-2 border-[#1a2c3f] px-10 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[#8b5cf6] text-[10px] font-black uppercase animate-pulse">Infection Load</span>
              <span className="text-[#4a6b8c] text-[8px] uppercase">Protocol: Containment</span>
            </div>
          </div>
          <div className="text-6xl font-black text-white text-glow-neon tabular-nums">
            {timeLeft !== null ? formatTime(timeLeft) : "20:00"}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-[#00ff9d] text-[10px] font-black uppercase">Grid Status</span>
              <span className="text-[#4a6b8c] text-[8px] uppercase">Active // Online</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ff9d] animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── REPAIRING PROGRESS BAR (Global) ── */}
      {missionStatus === "repairing" && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-xl space-y-6 text-center">
            <p className="text-[#00ff9d] text-2xl font-black tracking-[0.5em] uppercase animate-pulse">Repairing Grid...</p>
            <div className="relative h-4 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ff9d]/50 to-[#00ff9d] transition-all duration-100 ease-linear"
                style={{ width: `${localRepairProgress}%` }}
              />
            </div>
            <p className="text-[#4a6b8c] text-sm uppercase tracking-widest">Global Synchronization in Progress</p>
          </div>
        </div>
      )}

      {/* ── MISSION COMPLETE ANIMATION ── */}
      {missionStatus === "complete" && !showTimer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
          <div className="text-center space-y-4">
            <p className="text-[#00ff9d] text-7xl md:text-9xl font-black italic tracking-tighter animate-bounce"
               style={{ textShadow: "0 0 50px #00ff9d" }}>
              MISSION COMPLETE
            </p>
            <p className="text-white text-xl tracking-[1em] uppercase opacity-50">Grid Restored</p>
          </div>
        </div>
      )}

      {/* ── ROLE DASHBOARDS ── */}
      <div className={clsx(
        "relative z-10 flex-grow flex flex-col p-6 transition-all duration-700",
        (missionStatus === "repairing" || missionStatus === "complete") ? "opacity-0 scale-95 blur-xl" : "opacity-100 scale-100 blur-0"
      )}>
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#060e18] border border-[#1a2c3f] flex items-center justify-center">
              {RoleIcon && <RoleIcon className="w-6 h-6" style={{ color: roleColor }} />}
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-wider uppercase">{role}</h2>
              <p className="text-[#4a6b8c] text-[10px] tracking-widest uppercase">Mission 1 // Neutralize Infection</p>
            </div>
          </div>
          
          <div className="bg-[#0a1a2f] px-4 py-2 rounded-lg border border-[#00ff9d]/20">
            <span className="text-[#00ff9d] text-[10px] font-bold uppercase tracking-widest">System Status: {missionStatus.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {role === 'journalist' && <JournalistUI />}
          {role === 'analyst' && <AnalystUI />}
          {role === 'engineer' && <EngineerUI session={session} updateMission1Data={updateMission1Data} applyPenalty={applyPenalty} updateMission1Status={updateMission1Status} />}
          {role === 'executive' && <ExecutiveUI session={session} updateMission1Status={updateMission1Status} />}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── ROLE COMPONENTS ────────────────────────────────────────

function JournalistUI() {
  return (
    <div className="w-full max-w-2xl bg-[#f5f5f5] text-black p-10 rounded shadow-2xl transform -rotate-1 relative font-serif overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      <div className="border-b-4 border-black pb-4 mb-6 text-center">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">The Daily Pulse</h1>
        <div className="flex justify-between text-xs font-bold mt-2 border-t border-black pt-1">
          <span>VOL. 84 // NO. 12</span>
          <span>EMERGENCY EDITION</span>
          <span>PRICE: STABILITY</span>
        </div>
      </div>
      <div className="space-y-6">
        <h2 className="text-4xl font-bold leading-tight uppercase underline decoration-4 underline-offset-4">BREAKING NEWS: Grid Surge Leaves Four Sectors in Darkness!</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              Witnesses report blinding flashes originating from the <span className="font-black bg-yellow-200 px-1">Hospital</span> district. Emergency services are operating on backup power.
            </p>
            <p className="text-sm leading-relaxed">
              The <span className="font-black bg-yellow-200 px-1">Water Treatment</span> facility has halted all filtration cycles. Officials warn of potential shortages.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              Panic erupted at the <span className="font-black bg-yellow-200 px-1">School</span> during the blackout. Fortunately, no injuries have been reported.
            </p>
            <p className="text-sm leading-relaxed">
              The iconic clock at <span className="font-black bg-yellow-200 px-1">City Square</span> has stopped exactly at 23:14.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalystUI() {
  return (
    <div className="w-full max-w-xl bg-[#060e18] border border-[#3b82f6]/30 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-[#3b82f6]/20 pb-4">
        <Activity className="w-6 h-6 text-[#3b82f6]" />
        <h2 className="text-[#3b82f6] font-black text-xl uppercase tracking-widest">Location Analysis Feed</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {LOCATIONS.map((loc, i) => (
          <div key={loc} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#3b82f6]/30 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#3b82f6] font-bold w-4">0{i+1}</span>
              <span className="text-white font-bold uppercase tracking-widest text-sm">{loc}</span>
            </div>
            <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#3b82f6] opacity-40 animate-pulse" style={{ width: `${Math.random() * 60 + 20}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineerUI({ session, updateMission1Data, applyPenalty, updateMission1Status }: any) {
  const [selected, setSelected] = useState<string[]>(session.selectedLocations || []);
  const [isGlitching, setIsGlitching] = useState(false);

  const toggleLocation = (loc: string) => {
    if (selected.includes(loc)) {
      setSelected(selected.filter(s => s !== loc));
    } else if (selected.length < 4) {
      setSelected([...selected, loc]);
    }
  };

  const handleRepair = () => {
    const isCorrect = selected.length === 4 && selected.every(l => CORRECT_LOCATIONS.includes(l));
    if (isCorrect) {
      updateMission1Data({ selectedLocations: selected, mission1Status: "gear_puzzle" });
    } else {
      setIsGlitching(true);
      applyPenalty(10);
      setTimeout(() => setIsGlitching(false), 500);
    }
  };

  if (session.mission1Status === "gear_puzzle") {
    return <GearPuzzle updateMission1Status={updateMission1Status} applyPenalty={applyPenalty} />;
  }

  return (
    <div className={clsx(
      "w-full max-w-2xl bg-[#060e18] border border-[#00ff9d]/30 rounded-3xl p-10 shadow-2xl transition-all duration-100",
      isGlitching && "animate-[glitch_0.1s_infinite] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
    )}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-[#00ff9d]" />
          <h2 className="text-[#00ff9d] font-black text-xl uppercase tracking-widest">Grid Selector</h2>
        </div>
        <div className="text-[10px] text-[#4a6b8c] font-bold uppercase">Select 4 Zones</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {LOCATIONS.map(loc => (
          <button
            key={loc}
            onClick={() => toggleLocation(loc)}
            className={clsx(
              "p-4 rounded-xl border font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-between",
              selected.includes(loc) 
                ? "bg-[#00ff9d] text-black border-[#00ff9d]" 
                : "bg-white/5 text-white/50 border-white/10 hover:border-[#00ff9d]/50"
            )}
          >
            {loc}
            {selected.includes(loc) && <CheckCircle2 className="w-4 h-4" />}
          </button>
        ))}
      </div>

      <button
        onClick={handleRepair}
        disabled={selected.length !== 4}
        className="w-full py-6 rounded-2xl bg-[#8b5cf6] text-white font-black text-xl tracking-[0.3em] uppercase shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] disabled:opacity-30 disabled:grayscale transition-all"
      >
        Neutralize Infection
      </button>

      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
          100% { transform: translate(2px, 2px); }
        }
      `}</style>
    </div>
  );
}

function GearPuzzle({ updateMission1Status, applyPenalty }: any) {
  const [gears, setGears] = useState([
    { id: 1, pos: { x: 50, y: 350 }, color: '#00ff9d' },
    { id: 2, pos: { x: 150, y: 350 }, color: '#3b82f6' },
    { id: 3, pos: { x: 250, y: 350 }, color: '#8b5cf6' },
  ]);
  const [slots, setSlots] = useState([
    { id: 1, x: 100, y: 150, occupiedBy: null as number | null },
    { id: 2, x: 200, y: 150, occupiedBy: null as number | null },
    { id: 3, x: 300, y: 150, occupiedBy: null as number | null },
  ]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (id: number) => setDraggingId(id);
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setGears(prev => prev.map(g => g.id === draggingId ? { ...g, pos: { x, y } } : g));
  };

  const handlePointerUp = () => {
    if (draggingId === null) return;
    const gear = gears.find(g => g.id === draggingId)!;
    
    // Check collision with slots
    let slotted = false;
    const newSlots = slots.map(s => {
      const dist = Math.sqrt(Math.pow(s.x - gear.pos.x, 2) + Math.pow(s.y - gear.pos.y, 2));
      if (dist < 40 && !s.occupiedBy) {
        slotted = true;
        // Check if correct gear for slot (just id match for simplicity or random)
        if (s.id === gear.id) {
           return { ...s, occupiedBy: gear.id };
        } else {
           // Wrong slot!
           setIsGlitching(true);
           applyPenalty(10);
           setTimeout(() => setIsGlitching(false), 500);
           return s;
        }
      }
      return s;
    });

    if (slotted) {
      setSlots(newSlots);
      setGears(prev => prev.filter(g => g.id !== draggingId));
      if (newSlots.every(s => s.occupiedBy !== null)) {
        updateMission1Status("authorizing");
      }
    }
    
    setDraggingId(null);
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={clsx(
        "relative w-[400px] h-[500px] bg-[#050b12] border-2 border-[#1a2c3f] rounded-3xl overflow-hidden touch-none",
        isGlitching && "animate-shake border-red-500"
      )}
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#1a2c3f_0%,transparent_70%)]" />
      <p className="text-center text-[#00ff9d] text-[10px] font-black uppercase tracking-[0.4em] mt-6">Circuit Re-Alignment</p>
      
      {/* Slots */}
      {slots.map(s => (
        <div 
          key={s.id}
          className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-[#1a2c3f] rounded-full flex items-center justify-center bg-black/40 shadow-inner"
          style={{ left: s.x, top: s.y }}
        >
          {s.occupiedBy ? (
            <Settings className="w-12 h-12 text-[#00ff9d] animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#1a2c3f]" />
          )}
        </div>
      ))}

      {/* Connectors */}
      <div className="absolute top-[150px] left-[100px] right-[100px] h-1 bg-[#1a2c3f]" />

      {/* Gears */}
      {gears.map(g => (
        <div
          key={g.id}
          onPointerDown={() => handlePointerDown(g.id)}
          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-50 flex items-center justify-center group"
          style={{ left: g.pos.x, top: g.pos.y, color: g.color }}
        >
          <div className="absolute inset-0 bg-current opacity-10 rounded-full blur-xl group-hover:opacity-30 transition-opacity" />
          <Settings className={clsx("w-full h-full drop-shadow-[0_0_10px_currentColor]", draggingId === g.id && "scale-110")} />
        </div>
      ))}

      <style jsx>{`
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

function ExecutiveUI({ session, updateMission1Status }: any) {
  const isAuthorized = session.mission1Status === "authorizing" || session.mission1Status === "repairing";

  return (
    <div className="w-full max-w-lg bg-[#060e18] border border-[#8b5cf6]/30 rounded-3xl p-12 shadow-2xl space-y-10">
      <div className="text-center space-y-2">
        <Shield className="w-16 h-16 text-[#8b5cf6] mx-auto mb-4" />
        <h2 className="text-white font-black text-2xl uppercase tracking-[0.2em]">High Command Authorization</h2>
        <p className="text-[#4a6b8c] text-xs uppercase tracking-widest">Awaiting Engineer Confirmation</p>
      </div>

      {!isAuthorized ? (
        <div className="bg-black/40 border border-white/5 p-8 rounded-2xl flex flex-col items-center gap-4">
          <Lock className="w-8 h-8 text-white/20" />
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Access Restricted</p>
        </div>
      ) : (
        <button
          onClick={() => updateMission1Status("repairing")}
          disabled={session.mission1Status === "repairing"}
          className="w-full py-8 rounded-2xl bg-[#8b5cf6] text-white font-black text-2xl tracking-[0.4em] uppercase shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:shadow-[0_0_70px_rgba(139,92,246,0.5)] transition-all animate-pulse"
        >
          Authorize & Permit
        </button>
      )}
    </div>
  );
}

function AccessSyncPhase({ session, currentPlayer, setAuthStatus, setSystemOnline }: any) {
  const [isInserted, setIsInserted] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [errorGlitch, setErrorGlitch] = useState(false);

  const role = currentPlayer.role || 'engineer';
  const rolePrefixes: Record<string, string> = {
    engineer: "ENGR",
    analyst: "ANLY",
    executive: "EXEC",
    journalist: "JRNL"
  };

  useEffect(() => {
    if (isInserted && !generatedCode) {
      const code = `${rolePrefixes[role]}-${Math.floor(100 + Math.random() * 900)}`;
      setGeneratedCode(code);
    }
  }, [isInserted, role, generatedCode, rolePrefixes]);

  const authCount = Object.values(session.authStatus || {}).filter(s => s === 'completed').length;
  const progressPercent = (authCount / 4) * 100;

  useEffect(() => {
    if (authCount === 4 && !session.isSystemOnline) {
      setTimeout(() => setSystemOnline(), 1500);
    }
  }, [authCount, session.isSystemOnline, setSystemOnline]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsInserted(true);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.toUpperCase() === generatedCode) {
      setAuthStatus('completed');
    } else {
      setErrorGlitch(true);
      setTimeout(() => setErrorGlitch(false), 500);
      setInputCode("");
    }
  };

  const roleColor = ROLE_COLORS[role] || "#00ff9d";
  const RoleIcon = ROLE_ICONS[role] || Zap;

  return (
    <div className={clsx("min-h-screen bg-[#010508] flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono", authCount === 4 && "animate-[glitch_0.2s_infinite]")}>
      <div className="scanline opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]" />

      {authCount === 4 ? (
         <div className="z-10 text-[#00ff9d] text-7xl font-black tracking-tighter animate-pulse text-center">
           SYSTEM ONLINE
         </div>
      ) : (
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 gap-10">
        
        {/* Left Side: The Reader & Progress */}
        <div className="flex flex-col items-center justify-center gap-12">
          {/* Card Reader Slot */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={clsx(
              "w-64 h-32 border-2 border-dashed rounded-xl flex items-center justify-center transition-all",
              isInserted ? "border-transparent shadow-2xl" : "border-[#1a2c3f] bg-black/50"
            )}
            style={isInserted ? { borderColor: roleColor, backgroundColor: `${roleColor}20`, boxShadow: `0 0 30px ${roleColor}40` } : {}}
          >
             {isInserted ? (
               <div className="flex flex-col items-center gap-2">
                 <CheckCircle2 className="w-8 h-8" style={{ color: roleColor }} />
                 <span style={{ color: roleColor }} className="text-xs font-bold uppercase tracking-widest">Card Accepted</span>
               </div>
             ) : (
               <span className="text-[#4a6b8c] text-xs font-bold uppercase tracking-widest text-center">Drag Card Here<br/>To Insert</span>
             )}
          </div>

          {/* Sync Progress Bar */}
          <div className="w-full space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-[#4a6b8c] text-[9px] uppercase tracking-[0.3em]">Access Sync Progress</span>
                <span className="text-[#00ff9d] text-xl font-black">{authCount}/4</span>
             </div>
             <div className="relative h-4 w-full bg-black/40 rounded-full border border-[#1a2c3f] overflow-hidden">
                <div 
                   className="h-full transition-all duration-700 relative overflow-hidden"
                   style={{ 
                     width: `${progressPercent}%`,
                     background: "linear-gradient(90deg, #004d30, #00ff9d)",
                     boxShadow: "0 0 20px rgba(0,255,157,0.3)"
                   }}
                >
                   <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                </div>
             </div>
          </div>

          {/* The Card (Draggable) */}
          {!isInserted && (
            <div 
              draggable
              className="mt-8 w-48 h-72 rounded-xl border border-white/10 flex flex-col p-4 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shadow-2xl"
              style={{ background: `linear-gradient(180deg, #0a111a 0%, ${roleColor}20 100%)` }}
            >
              <div className="flex-1 flex flex-col items-center justify-end gap-2 rotate-180">
                 <RoleIcon className="w-12 h-12" style={{ color: roleColor }} />
                 <span className="text-white text-xl font-black uppercase tracking-widest">{role}</span>
                 <div className="w-full h-12 mt-4 bg-white/80 rounded flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full flex gap-1 justify-center items-stretch px-2 opacity-80 mix-blend-multiply">
                       {[...Array(20)].map((_, i) => (
                         <div key={i} className="bg-black" style={{ width: Math.random() * 4 + 1 + 'px' }} />
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: The Terminal */}
        <div className="bg-[#050b12] border border-[#1a2c3f] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[400px]">
          <div className="px-4 py-2 bg-[#0a111a] border-b border-[#1a2c3f] flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-red-500/50" />
                 <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                 <div className="w-2 h-2 rounded-full bg-green-500/50" />
               </div>
               <span className="text-[#4a6b8c] text-[9px] uppercase tracking-widest font-bold ml-2">Terminal // Auth Protocol</span>
             </div>
             <TerminalIcon className="w-3 h-3 text-[#4a6b8c]" />
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-center">
            {isInserted ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-[#00ff9d] text-sm animate-pulse flex items-center gap-2"><Zap className="w-4 h-4"/> System matched credentials.</span>
                  <p className="text-[#4a6b8c] text-xs">Generated unique sync code:</p>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-6 text-center">
                    <p className="text-5xl font-black tracking-[0.2em]" style={{ color: roleColor }}>{generatedCode}</p>
                  </div>
                </div>

                {session.authStatus?.[currentPlayer.id] === 'completed' ? (
                   <div className="bg-[#00ff9d]/10 border border-[#00ff9d]/30 p-4 rounded-lg text-[#00ff9d] text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                     <CheckCircle2 className="w-5 h-5" />
                     Auth Verified. Awaiting Team.
                   </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 bg-black/30 p-6 rounded-xl border border-white/5">
                    <p className="text-[#4a6b8c] text-xs uppercase tracking-widest">Enter code below to verify:</p>
                    <div className="flex gap-4 items-center">
                      <span className="text-[#00ff9d] text-xl">❯</span>
                      <input 
                        type="text" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        autoFocus
                        placeholder="____-___"
                        className={clsx(
                          "bg-transparent border-b-2 outline-none text-white text-2xl uppercase tracking-[0.2em] pb-2 w-full transition-colors",
                          errorGlitch ? "border-red-500 text-red-500 animate-shake" : "border-[#1a2c3f] focus:border-[#00ff9d]"
                        )}
                      />
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-4">
                 <span className="text-[#00ff9d] animate-pulse text-xl">❯</span>
                 <div className="space-y-4">
                   <p className="text-[#00ff9d] text-base leading-relaxed uppercase tracking-wider font-bold">
                     [SYSTEM]: WAITING FOR AUTH...
                   </p>
                   <p className="text-[#4a6b8c] text-sm uppercase">
                     Please insert your ID Card into the Reader Slot.
                   </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
