"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, User } from "lucide-react";
import clsx from "clsx";

type IntroPhase = "boot" | "glitch" | "main";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("boot");
  const [bootStep, setBootStep] = useState(0);
  
  const [alias, setAlias] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem("eco_player_name");
    if (storedName) setAlias(storedName);

    // Intro sequence logic
    const hasSeenIntro = sessionStorage.getItem("parasite_intro_seen");
    if (hasSeenIntro) {
      setIntroPhase("main");
      return;
    }

    // Phase 1: Terminal Boot (0-2s)
    const t1 = setTimeout(() => setBootStep(1), 400); // BOOTING SYSTEM...
    const t2 = setTimeout(() => setBootStep(2), 900); // LOADING PROTOCOLS...
    const t3 = setTimeout(() => setBootStep(3), 1400); // ERROR
    
    // Phase 2: Glitch Reveal (2s-3.5s)
    const t4 = setTimeout(() => setIntroPhase("glitch"), 2000);

    // Phase 3: Main UI (3.5s+)
    const t5 = setTimeout(() => {
      setIntroPhase("main");
      sessionStorage.setItem("parasite_intro_seen", "true");
    }, 3500);

    // Allow escape to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipIntro();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

  const skipIntro = () => {
    setIntroPhase("main");
    sessionStorage.setItem("parasite_intro_seen", "true");
  };

  const saveAlias = (name: string) => {
    localStorage.setItem("eco_player_name", name.trim());
  };

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleCreate = () => {
    if (!alias.trim()) { setError("Username is required."); return; }
    setError("");
    setIsLoading(true);
    saveAlias(alias);
    const code = generateRoomCode();
    setTimeout(() => router.push(`/room/${code}?host=true`), 500);
  };

  const handleJoin = () => {
    if (!alias.trim()) { setError("Username is required."); return; }
    if (!showJoinInput) {
      setShowJoinInput(true);
      return;
    }
    if (joinCode.length < 5) { setError("Enter a valid 5-character code."); return; }
    setError("");
    setIsLoading(true);
    saveAlias(alias);
    setTimeout(() => router.push(`/room/${joinCode.toUpperCase()}`), 500);
  };

  // Render Phase 1: Terminal Boot
  if (introPhase === "boot") {
    return (
      <div className="min-h-screen bg-black text-emerald-500 font-mono p-6 relative overflow-hidden flex flex-col">
        <div className="space-y-2 text-sm md:text-lg">
          {bootStep >= 1 && <p>{">"} BOOTING SYSTEM...</p>}
          {bootStep >= 2 && <p>{">"} LOADING PROTOCOLS...</p>}
          {bootStep >= 3 && <p className="text-red-500">{">"} [ERROR] UNKNOWN ENTITY DETECTED.</p>}
          <p>{">"} <span className="w-2 h-4 bg-emerald-500 inline-block animate-pulse" /></p>
        </div>
        <button onClick={skipIntro} className="absolute bottom-6 right-6 text-slate-600 text-xs tracking-widest hover:text-slate-400">
          SKIP [ESC]
        </button>
      </div>
    );
  }

  // Render Phase 2: Glitch Reveal
  if (introPhase === "glitch") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes hard-glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-5px, 5px) }
            40% { transform: translate(-5px, -5px) }
            60% { transform: translate(5px, 5px) }
            80% { transform: translate(5px, -5px) }
            100% { transform: translate(0) }
          }
          .glitch-text {
            animation: hard-glitch 0.2s infinite;
            text-shadow: 4px 0 #a855f7, -4px 0 #10b981;
          }
        `}} />
        <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white glitch-text">
          Parasit[e]
        </h1>
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay animate-pulse" />
      </div>
    );
  }

  // Render Phase 3: Main UI
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-intro {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      
      <div className="max-w-4xl w-full space-y-12 animate-intro relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <ShieldAlert className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">
            Parasit<span className="text-emerald-400">[</span>e<span className="text-emerald-400">]</span>
          </h1>
          <p className="text-slate-500 font-mono text-sm tracking-[0.3em] uppercase">System Initialization Required</p>
        </div>

        {/* Username Input */}
        <div className="max-w-md mx-auto w-full space-y-3">
          <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest text-center">Identity Verification</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={alias}
              onChange={(e) => { setAlias(e.target.value); setError(""); }}
              className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl py-6 pl-12 pr-6 text-xl font-bold focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="ENTER USERNAME"
            />
          </div>
          {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}
        </div>

        {/* Big Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="group relative flex flex-col items-center justify-center bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-[0.98]"
          >
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 group-hover:scale-110 transition-transform">Create Game</h2>
            <p className="text-emerald-400/60 font-mono text-xs uppercase tracking-widest">Start New Session</p>
          </button>

          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="group relative flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-slate-700 transition-all active:scale-[0.98]"
          >
            {showJoinInput ? (
              <div className="flex flex-col items-center gap-4 w-full px-8">
                <input
                  autoFocus
                  maxLength={5}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-b-2 border-slate-700 text-center text-4xl font-black focus:border-emerald-500 focus:outline-none transition-all tracking-[0.5em]"
                  placeholder="CODE"
                />
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Press again to Join</p>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 group-hover:scale-110 transition-transform">Join Game</h2>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Enter Operation Code</p>
              </>
            )}
          </button>
        </div>

        {/* Verification Card */}
        <div className="max-w-xs mx-auto pt-8">
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">System Role</span>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
              <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">JOURNALIST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}