"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameSession } from "@/hooks/useGameSession";
import { Role, Player } from "@/lib/types";
import { Zap, Activity, Shield, Search, Loader2, Copy, Check } from "lucide-react";
import clsx from "clsx";
import { useAudio } from "@/contexts/AudioContext";

interface LobbyPhaseProps {
  roomId: string;
}

interface RoleTheme {
  text: string;
  border: string;
  bgHover: string;
  bgSelected: string;
  shadowIdle: string;
  shadowSelected: string;
  iconDropShadow: string;
  barcodeFill: string;
  tagBg: string;
  idleGlow: string;
  iconBgSelected: string;
  iconHover: string;
  borderHover: string;
}

const ROLES: { id: Role; name: string; icon: React.ElementType; theme: RoleTheme }[] = [
  { 
    id: "journalist", 
    name: "JOURNALIST", 
    icon: Search, 
    theme: {
      text: "text-amber-400",
      border: "border-amber-400/50",
      bgHover: "hover:bg-amber-950/30",
      bgSelected: "bg-amber-950/20",
      shadowIdle: "hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]",
      shadowSelected: "shadow-[0_0_30px_rgba(251,191,36,0.4)]",
      iconDropShadow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
      barcodeFill: "fill-amber-400",
      tagBg: "bg-amber-400 text-slate-950",
      idleGlow: "shadow-[0_0_15px_rgba(251,191,36,0.05)]",
      iconBgSelected: "bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.3)]",
      iconHover: "group-hover:text-amber-400/50",
      borderHover: "hover:border-amber-400/30"
    }
  },
  { 
    id: "analyst", 
    name: "DATA ANALYST", 
    icon: Activity, 
    theme: {
      text: "text-green-400",
      border: "border-green-400/50",
      bgHover: "hover:bg-green-950/30",
      bgSelected: "bg-green-950/20",
      shadowIdle: "hover:shadow-[0_0_25px_rgba(74,222,128,0.15)]",
      shadowSelected: "shadow-[0_0_30px_rgba(74,222,128,0.4)]",
      iconDropShadow: "drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]",
      barcodeFill: "fill-green-400",
      tagBg: "bg-green-400 text-slate-950",
      idleGlow: "shadow-[0_0_15px_rgba(74,222,128,0.05)]",
      iconBgSelected: "bg-green-400/10 shadow-[0_0_30px_rgba(74,222,128,0.3)]",
      iconHover: "group-hover:text-green-400/50",
      borderHover: "hover:border-green-400/30"
    }
  },
  { 
    id: "engineer", 
    name: "ENGINEER", 
    icon: Zap, 
    theme: {
      text: "text-cyan-400",
      border: "border-cyan-400/50",
      bgHover: "hover:bg-cyan-950/30",
      bgSelected: "bg-cyan-950/20",
      shadowIdle: "hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]",
      shadowSelected: "shadow-[0_0_30px_rgba(34,211,238,0.4)]",
      iconDropShadow: "drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]",
      barcodeFill: "fill-cyan-400",
      tagBg: "bg-cyan-400 text-slate-950",
      idleGlow: "shadow-[0_0_15px_rgba(34,211,238,0.05)]",
      iconBgSelected: "bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]",
      iconHover: "group-hover:text-cyan-400/50",
      borderHover: "hover:border-cyan-400/30"
    }
  },
  { 
    id: "executive", 
    name: "EXECUTIVE", 
    icon: Shield, 
    theme: {
      text: "text-fuchsia-400",
      border: "border-fuchsia-400/50",
      bgHover: "hover:bg-fuchsia-950/30",
      bgSelected: "bg-fuchsia-950/20",
      shadowIdle: "hover:shadow-[0_0_25px_rgba(232,121,249,0.15)]",
      shadowSelected: "shadow-[0_0_30px_rgba(232,121,249,0.4)]",
      iconDropShadow: "drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]",
      barcodeFill: "fill-fuchsia-400",
      tagBg: "bg-fuchsia-400 text-slate-950",
      idleGlow: "shadow-[0_0_15px_rgba(232,121,249,0.05)]",
      iconBgSelected: "bg-fuchsia-400/10 shadow-[0_0_30px_rgba(232,121,249,0.3)]",
      iconHover: "group-hover:text-fuchsia-400/50",
      borderHover: "hover:border-fuchsia-400/30"
    }
  },
];

const BarcodeSVG = ({ isSelected, colorClass }: { isSelected: boolean, colorClass: string }) => (
  <svg width="100%" height="30" preserveAspectRatio="none" viewBox="0 0 100 30" className={clsx("transition-colors duration-300", isSelected ? colorClass : "fill-slate-600")}>
    <rect x="0" y="0" width="3" height="30" />
    <rect x="5" y="0" width="1" height="30" />
    <rect x="8" y="0" width="4" height="30" />
    <rect x="14" y="0" width="2" height="30" />
    <rect x="18" y="0" width="5" height="30" />
    <rect x="25" y="0" width="1" height="30" />
    <rect x="28" y="0" width="3" height="30" />
    <rect x="33" y="0" width="6" height="30" />
    <rect x="41" y="0" width="2" height="30" />
    <rect x="45" y="0" width="1" height="30" />
    <rect x="48" y="0" width="4" height="30" />
    <rect x="54" y="0" width="2" height="30" />
    <rect x="58" y="0" width="3" height="30" />
    <rect x="63" y="0" width="1" height="30" />
    <rect x="66" y="0" width="5" height="30" />
    <rect x="73" y="0" width="2" height="30" />
    <rect x="77" y="0" width="4" height="30" />
    <rect x="83" y="0" width="1" height="30" />
    <rect x="86" y="0" width="3" height="30" />
    <rect x="91" y="0" width="2" height="30" />
    <rect x="95" y="0" width="5" height="30" />
  </svg>
);

export default function LobbyPhase({ roomId }: LobbyPhaseProps) {
  const router = useRouter();
  const { session, currentUser, currentPlayer, selectRole, toggleReady, updateGameStatus, randomizeRoles, lockRoles, leaveLobby } = useGameSession(roomId);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, msg: string}[]>([]);
  const { setBGM, playSFX } = useAudio();
  const prevPlayersRef = useRef<Record<string, Player>>({});

  useEffect(() => {
    setBGM(true);
  }, []);

  // Generate a random stable PRST ID for the cards based on roomId so it doesn't flicker
  const prstId = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString().padStart(6, '0').substring(0, 6);
  }, [roomId]);

  useEffect(() => {
    if (!session?.players) return;
    const currentPlayers = session.players;
    const prevPlayers = prevPlayersRef.current;
    const currentIds = Object.keys(currentPlayers);
    const prevIds = Object.keys(prevPlayers);
    const joined = currentIds.filter(id => !prevIds.includes(id));
    const left = prevIds.filter(id => !currentIds.includes(id));

    const newNotifs: {id: string, msg: string}[] = [];
    if (prevIds.length > 0) {
      joined.forEach(id => {
        if (id !== currentUser?.id) newNotifs.push({ id: Date.now() + Math.random().toString(), msg: `[${currentPlayers[id].name}] has joined the lobby` });
      });
      left.forEach(id => {
        if (id !== currentUser?.id) newNotifs.push({ id: Date.now() + Math.random().toString(), msg: `[${prevPlayers[id].name}] has left the lobby` });
      });
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => [...prev, ...newNotifs]);
      newNotifs.forEach(n => {
        setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 4000);
      });
    }
    prevPlayersRef.current = currentPlayers;
  }, [session?.players, currentUser?.id]);

  if (!session || !currentUser || !currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const players = Object.values(session.players);
  const allReady = players.length === 4 && players.every(p => p.isReady && p.role);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrimaryAction = () => {
    playSFX("click");
    if (allReady && currentPlayer.isHost) {
      updateGameStatus("briefing");
    } else {
      toggleReady();
    }
  };

  const handleLeaveLobby = async () => {
    playSFX("click");
    await leaveLobby();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6 md:p-12 flex flex-col font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

      {/* Header & Player List */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 w-full max-w-7xl mx-auto">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black uppercase tracking-widest text-slate-100">Parasit[e]</h1>
              <div className="h-4 w-[1px] bg-slate-700" />
              <button 
                onClick={copyCode}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm tracking-widest"
              >
                <span>ID: {roomId}</span>
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <button 
              onClick={handleLeaveLobby}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded font-mono text-xs uppercase tracking-widest transition-colors"
            >
              Leave Lobby
            </button>
          </div>

          {/* Simple Player List */}
          <div className="flex flex-wrap gap-3">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-black border border-slate-800 px-3 py-1.5 rounded font-mono text-xs uppercase">
                <div className={clsx(
                  "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                  p.isReady ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
                )} />
                <span className={p.id === currentUser.id ? "text-emerald-400 font-bold" : "text-slate-300"}>{p.name}</span>
              </div>
            ))}
            {/* Fill empty slots visually */}
            {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 bg-black/30 border border-slate-800/50 px-3 py-1.5 rounded font-mono text-xs uppercase opacity-50">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="text-slate-600">AWAITING...</span>
              </div>
            ))}
          </div>
        </div>
        
        {currentPlayer.isHost && (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Host Controls</span>
            <button 
              onClick={randomizeRoles}
              disabled={session.rolesLocked || (session.randomizeCount || 0) >= 2}
              className={clsx(
                "px-4 py-2 border rounded font-mono text-xs uppercase tracking-widest transition-all",
                session.rolesLocked || (session.randomizeCount || 0) >= 2
                  ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-500/30 text-indigo-400"
              )}
            >
              Randomize Roles ({2 - (session.randomizeCount || 0)})
            </button>
            <button 
              onClick={lockRoles}
              disabled={session.rolesLocked}
              className={clsx(
                "px-4 py-2 border rounded font-mono text-xs uppercase tracking-widest transition-all",
                session.rolesLocked
                  ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/30 text-amber-400"
              )}
            >
              {session.rolesLocked ? "Roles Locked" : "Lock Roles"}
            </button>
          </div>
        )}
      </div>

      {/* ID Cards Layout */}
      <div className="relative z-10 flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl w-full">
          {ROLES.map((role) => {
            const occupant = players.find(p => p.role === role.id);
            const isTaken = occupant && occupant.id !== currentUser.id;
            const isSelected = currentPlayer.role === role.id;

            return (
              <button
                key={role.id}
                onClick={() => {
                  if (!isTaken) {
                    playSFX("click");
                    selectRole(role.id);
                  }
                }}
                disabled={isTaken}
                className={clsx(
                  "relative flex flex-col justify-between h-96 p-6 rounded-xl border transition-all duration-300 font-mono text-left group overflow-hidden",
                  isSelected 
                    ? clsx(role.theme.bgSelected, role.theme.border, role.theme.shadowSelected, "scale-[1.02]")
                    : isTaken 
                      ? "bg-black border-slate-900 opacity-50 cursor-not-allowed grayscale"
                      : clsx("bg-black border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]", role.theme.borderHover, role.theme.bgHover, role.theme.shadowIdle, role.theme.idleGlow)
                )}
              >
                {/* Top: Role Name */}
                <div className="flex justify-between items-start w-full">
                  <h3 className={clsx(
                    "text-2xl font-black uppercase tracking-widest",
                    isSelected ? role.theme.text : isTaken ? "text-slate-500" : "text-slate-300"
                  )}>
                    {role.name.split(' ').map((word, idx) => (
                      <span key={idx} className="block">{word}</span>
                    ))}
                  </h3>
                  {isSelected && (
                    <span className={clsx(
                      "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                      role.theme.tagBg
                    )}>
                      SELECTED
                    </span>
                  )}
                </div>

                {/* Center: Glowing Icon */}
                <div className="flex-grow flex items-center justify-center my-4">
                  <div className={clsx(
                    "p-6 rounded-full transition-all duration-500",
                    isSelected ? role.theme.iconBgSelected : "bg-neutral-900/30 group-hover:bg-neutral-900/60"
                  )}>
                    <role.icon className={clsx(
                      "w-16 h-16 transition-all duration-500",
                      isSelected ? clsx(role.theme.text, role.theme.iconDropShadow) : clsx("text-slate-600", role.theme.iconHover)
                    )} />
                  </div>
                </div>

                {/* Lower-Mid: Username */}
                <div className="h-12 flex items-center w-full mb-4 border-l-2 pl-3 border-slate-700">
                  {(isSelected || isTaken) ? (
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Username</span>
                      <span className={clsx(
                        "text-sm font-bold uppercase tracking-wider truncate block w-full",
                        isSelected ? role.theme.text : "text-slate-400"
                      )}>
                        {occupant?.name}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">Status</span>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">AVAILABLE</span>
                    </div>
                  )}
                </div>

                {/* Bottom: ID and Barcode */}
                <div className="w-full pt-4 border-t border-slate-800/50">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest">ID: PRST-{prstId}</span>
                    {/* Tiny decorative squares */}
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-700" />
                      <div className="w-1.5 h-1.5 bg-slate-700" />
                    </div>
                  </div>
                  <BarcodeSVG isSelected={isSelected} colorClass={role.theme.barcodeFill} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Giant Primary Action Button */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        <button
          onClick={handlePrimaryAction}
          disabled={!currentPlayer.role}
          className={clsx(
            "w-full max-w-lg py-6 px-8 rounded-xl font-black text-2xl uppercase tracking-[0.3em] transition-all border-2",
            !currentPlayer.role 
              ? "bg-slate-900/50 border-slate-800 text-slate-700 cursor-not-allowed"
              : allReady && currentPlayer.isHost
                ? "bg-emerald-500 border-emerald-400 text-slate-950 hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105"
                : currentPlayer.isReady
                  ? "bg-emerald-950 border-emerald-500 text-emerald-400 hover:bg-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700 shadow-xl"
          )}
        >
          {allReady && currentPlayer.isHost ? "START OPERATION" : currentPlayer.isReady ? "SYSTEM READY" : "PRESS TO START"}
        </button>
        <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mt-4">
          Verify your status to start the mission.
        </p>
      </div>

      {/* Notifications Area */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
           <div key={n.id} className="bg-slate-900/90 border border-slate-700 text-slate-300 px-4 py-3 rounded shadow-lg font-mono text-xs uppercase tracking-widest animate-in fade-in slide-in-from-bottom-5">
             {n.msg}
           </div>
        ))}
      </div>
    </div>
  );
}
