"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, User } from "lucide-react";

type IntroPhase = "matrix" | "main";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("matrix");
  
  const [alias, setAlias] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const skipIntro = () => {
    setIntroPhase("main");
    sessionStorage.setItem("parasite_intro_seen", "true");
  };

  useEffect(() => {
    // Hydration fix: defer mounting to client-side only
    const mountTimeout = setTimeout(() => {
      setMounted(true);
      
      const storedName = localStorage.getItem("eco_player_name");
      if (storedName) setAlias(storedName);

      // Intro sequence logic
      const hasSeenIntro = sessionStorage.getItem("parasite_intro_seen");
      if (hasSeenIntro) {
        setIntroPhase("main");
      }
    }, 0);
    
    // Intro sequence logic (continued)
    const hasSeenIntro = sessionStorage.getItem("parasite_intro_seen");
    let introTimer: NodeJS.Timeout;

    if (!hasSeenIntro) {
      // Matrix Phase (0-4s)
      introTimer = setTimeout(() => {
        setIntroPhase("main");
        sessionStorage.setItem("parasite_intro_seen", "true");
      }, 4000);
    }

    // Allow escape to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipIntro();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(mountTimeout);
      clearTimeout(introTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

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

  // Render Matrix Intro Phase
  if (introPhase === "matrix") {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden select-none">
        <MatrixRain />
        {/* Masking Layer: White text becomes transparent, black covers the rest */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black mix-blend-multiply pointer-events-none">
          <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white">
            Parasit[e]
          </h1>
        </div>
        <button onClick={skipIntro} className="absolute bottom-6 right-6 z-20 text-slate-600 text-xs tracking-widest hover:text-slate-400">
          SKIP [ESC]
        </button>
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

      </div>
    </div>
  );
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}[]|:;"<>,.?/~\\'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    let animationFrameId: number;
    let lastDrawTime = 0;
    const drawInterval = 33; // ~30fps

    const draw = (time: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (time - lastDrawTime < drawInterval) return;
      lastDrawTime = time;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" />;
};