"use client";

import { useState, useEffect } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BriefingPhaseProps {
  roomId: string;
}

export default function BriefingPhase({ roomId }: BriefingPhaseProps) {
  const { session, currentPlayer, updateGameStatus } = useGameSession(roomId);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Timeline sequence
    const t1 = setTimeout(() => setStep(1), 1500); // 1.5s: Impact Flash
    const t2 = setTimeout(() => setStep(2), 2500); // 2.5s: Surge (Data/Grid)
    const t3 = setTimeout(() => setStep(3), 5500); // 5.5s: Voice 1
    const t4 = setTimeout(() => setStep(4), 8500); // 8.5s: Voice 2
    const t5 = setTimeout(() => setStep(5), 11500); // 11.5s: Voice 3
    const t6 = setTimeout(() => setStep(6), 14500); // 14.5s: Reveal
    const t7 = setTimeout(() => endIntro(), 18500); // 18.5s: Start Game

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7);
    };
  }, []);

  if (!session || !currentPlayer) return null;

  const endIntro = () => {
    // Only host triggers the global state change to avoid race conditions
    if (currentPlayer.isHost) {
      updateGameStatus("playing");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col items-center justify-center font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes heavy-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-10px, -10px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translate(10px, 10px) rotate(2deg); }
        }
        @keyframes glitch-heavy {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-5px, 5px); color: #a855f7; }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(5px, -5px); color: #10b981; }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-5px, 5px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(5px, -5px); color: #ef4444; }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-5px, 5px); }
          100% { clip-path: inset(30% 0 20% 0); transform: translate(5px, -5px); }
        }
        @keyframes toxic-flicker {
          0%, 100% { background-color: black; }
          50% { background-color: rgba(168, 85, 247, 0.2); }
          60% { background-color: black; }
          70% { background-color: rgba(16, 185, 129, 0.1); }
        }
        .animate-shake { animation: heavy-shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .glitch-text { animation: glitch-heavy 0.2s infinite; text-shadow: 2px 0 red, -2px 0 cyan; }
        .bg-toxic { animation: toxic-flicker 0.4s infinite; }
      `}} />

      {/* Skip Button */}
      <button 
        onClick={endIntro}
        className="absolute bottom-8 right-8 text-slate-500 font-mono text-xs tracking-widest hover:text-white z-50 transition-colors"
      >
        SKIP INTRO [ESC]
      </button>

      <AnimatePresence mode="wait">
        {/* SCENE START: Huzur (0s - 1.5s) */}
        {step === 0 && (
          <motion.div 
            key="huzur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <Sun className="w-24 h-24 text-amber-400" />
            <h1 className="text-6xl font-black text-white tracking-tighter">ECOVILLE</h1>
            <p className="text-xl text-slate-300 font-medium">A Brighter Tomorrow.</p>
          </motion.div>
        )}

        {/* IMPACT (1.5s - 2.5s) */}
        {step === 1 && (
          <motion.div 
            key="impact"
            className="absolute inset-0 bg-white z-40 animate-shake flex items-center justify-center mix-blend-difference"
          >
            <Sun className="w-64 h-64 text-black" />
          </motion.div>
        )}

        {/* SCENE 2: The Surge (2.5s - 5.5s) */}
        {step === 2 && (
          <motion.div 
            key="surge"
            className="absolute inset-0 bg-toxic flex flex-col items-center justify-center font-mono space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black text-fuchsia-500 tracking-widest drop-shadow-[0_0_20px_#a855f7]"
            >
              [DATA]: IMPACT DETECTED.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-black text-emerald-500 tracking-widest drop-shadow-[0_0_20px_#10b981]"
            >
              [GRID]: ALL SYSTEMS GOING OFFLINE.
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 3: The Narrative */}
        {step === 3 && (
          <motion.div 
            key="voice1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-serif italic text-slate-300 text-center max-w-4xl leading-relaxed"
          >
            "It was a sunny Wednesday...<br/>until the impact."
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="voice2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-center max-w-5xl glitch-text"
          >
            "The Parasite is eating the light."
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="voice3"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-5xl md:text-7xl font-black text-red-500 uppercase tracking-widest text-center animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
          >
            45 minutes of oxygen<br/>and power left.
          </motion.div>
        )}

        {/* SCENE 4: The Reveal */}
        {step >= 6 && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 2 }}
            className="flex flex-col items-center justify-center relative w-full h-full"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_70%)] animate-pulse pointer-events-none" />
            
            <h1 className="text-7xl md:text-[12rem] font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-fuchsia-600 relative z-10 glitch-text" style={{ animationDuration: '3s' }}>
              PARASIT[E]
            </h1>
            
            {step === 6 && !currentPlayer.isHost && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-12 text-slate-500 font-mono tracking-widest uppercase text-xl animate-pulse"
              >
                Initializing Subsystems...
              </motion.p>
            )}

            {step === 6 && currentPlayer.isHost && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={endIntro}
                className="mt-12 px-12 py-6 bg-transparent border-4 border-emerald-500 text-emerald-400 font-black text-2xl tracking-[0.3em] uppercase hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-pulse relative z-20"
              >
                DESCEND
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
