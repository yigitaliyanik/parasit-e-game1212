"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, User, Cpu, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixRain } from "@/components/MatrixRain";
import { useAudio } from "@/contexts/AudioContext";

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

  const { setBGM, playSFX } = useAudio();

  useEffect(() => {
    setMounted(true);
    setBGM(true);
    
    const storedName = localStorage.getItem("eco_player_name");
    if (storedName) setAlias(storedName);

    const hasSeenIntro = sessionStorage.getItem("parasite_intro_seen");
    if (hasSeenIntro) {
      setIntroPhase("main");
    }

    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      if (introPhase === "matrix") {
        skipIntro();
      }
    };

    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("mousedown", handleInteraction);

    return () => {
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
    };
  }, [introPhase]);

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
    playSFX("click");
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
    playSFX("click");
    setTimeout(() => router.push(`/room/${joinCode.toUpperCase()}`), 500);
  };

  return (
    <AnimatePresence mode="wait">
      {introPhase === "matrix" ? (
        <motion.div 
          key="matrix-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1 }}
          className="relative min-h-screen bg-black overflow-hidden select-none cursor-pointer"
        >
          <MatrixRain />
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="text-8xl md:text-9xl font-black uppercase italic tracking-tighter text-white"
              style={{
                textShadow: "0 0 20px #00ff41, 0 0 40px #00ff4166",
                letterSpacing: "-0.05em"
              }}
            >
              Parasit[e]
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute bottom-20 text-[#00ff41] font-mono text-xl tracking-[0.4em] uppercase font-bold"
            >
              Initialize System
            </motion.div>
          </div>

          <div className="absolute bottom-6 right-6 z-20 text-emerald-900/40 text-[10px] tracking-widest font-mono">
            SECURE CONNECTION ESTABLISHED // PORT 8080
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="lobby-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden"
        >
          {/* Subtle Background Matrix Rain */}
          <div className="absolute inset-0 z-0 opacity-15 grayscale pointer-events-none">
            <MatrixRain />
          </div>

          <div className="max-w-4xl w-full space-y-12 relative z-10">
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-block p-4 rounded-2xl bg-[#00ff41]/10 border border-[#00ff41]/20 mb-4 shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              >
                <ShieldAlert className="w-12 h-12 text-[#00ff41]" />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">
                Parasit<span className="text-[#00ff41]">[</span>e<span className="text-[#00ff41]">]</span>
              </h1>
              <p className="text-slate-500 font-mono text-sm tracking-[0.3em] uppercase">Operations Command Center</p>
            </div>

            {/* Username Input */}
            <div className="max-w-md mx-auto w-full space-y-3">
              <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest text-center">User Identification</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#00ff41] transition-colors" />
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => { setAlias(e.target.value); setError(""); }}
                  className="w-full bg-black border-2 border-slate-800/50 rounded-2xl py-6 pl-12 pr-6 text-xl font-bold focus:border-[#00ff41]/50 focus:shadow-[0_0_15px_rgba(0,255,65,0.2)] focus:outline-none transition-all placeholder:text-slate-800 text-white font-mono"
                  placeholder="USERNAME_ID"
                />
              </div>
              {error && <p className="text-[#ff003c] text-xs font-mono text-center animate-pulse">{error}</p>}
            </div>

            {/* Neon Bordered Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="group relative h-48 flex flex-col items-center justify-center bg-black border-2 border-[#00ff41]/20 rounded-2xl hover:border-[#00ff41] hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Cpu className="w-8 h-8 text-[#00ff41]/40 group-hover:text-[#00ff41] mb-4 transition-colors" />
                <h2 className="text-3xl font-black uppercase italic tracking-tighter group-hover:scale-105 transition-transform">Create Lobby</h2>
                <p className="text-[#00ff41]/60 font-mono text-[10px] uppercase tracking-widest mt-2">New Room Access</p>
              </button>

              <button
                onClick={handleJoin}
                disabled={isLoading}
                className={`group relative h-48 flex flex-col items-center justify-center bg-black border-2 transition-all active:scale-[0.98] overflow-hidden rounded-2xl ${
                  showJoinInput ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-800 hover:border-white/20'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Network className="w-8 h-8 text-slate-600 group-hover:text-white mb-4 transition-colors" />
                
                {showJoinInput ? (
                  <div className="flex flex-col items-center gap-2 w-full px-8 animate-in fade-in zoom-in duration-300">
                    <input
                      autoFocus
                      maxLength={5}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full bg-transparent border-b-2 border-[#00ff41] text-center text-4xl font-black focus:outline-none transition-all tracking-[0.5em] text-[#00ff41]"
                      placeholder="XXXXX"
                    />
                    <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest font-bold">Transmit Code</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter group-hover:scale-105 transition-transform text-slate-400 group-hover:text-white">Join Lobby</h2>
                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mt-2 group-hover:text-slate-400">Join Active Node</p>
                  </>
                )}
              </button>
            </div>

            {/* Exit/Cancel if joining */}
            {showJoinInput && (
              <div className="flex justify-center">
                <button 
                  onClick={() => { setShowJoinInput(false); setJoinCode(""); setError(""); }}
                  className="text-[#ff003c]/40 hover:text-[#ff003c] font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-[#ff003c] rounded-full" /> 
                  Abort Join Protocol
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
