"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTypewriter } from "@/hooks/useTypewriter";

interface VictoryScreenProps {
  roomId: string;
}

export default function VictoryScreen({ roomId }: VictoryScreenProps) {
  const { session } = useGameSession(roomId);
  const router = useRouter();

  const victoryText = "The Parasit[e] has been permanently erased from the mainframe. The city's water is clean, the grid is stable, and the Toxic Express has been safely dismantled. You have saved the city from the infection. Operation Success.";
  const { displayedText: typedVictory } = useTypewriter(victoryText, 30);

  const elapsed = session?.startTime
    ? Math.floor((Date.now() - session.startTime) / 1000)
    : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-emerald-900/10" />
      <div className="scanline" />
      <div className="noise-bg" />

      {/* Cyberpunk Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />

      {/* Frame */}
      <div className="absolute inset-4 border border-emerald-500/20 rounded-lg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-8 max-w-3xl w-full"
      >
        {/* Achievement Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="mb-8 relative inline-block"
        >
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-black border-2 border-emerald-500 rounded-full p-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Trophy className="w-16 h-16 text-emerald-500" />
          </div>
        </motion.div>

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-emerald-500 mb-6"
          style={{ textShadow: "0 0 30px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2)" }}
        >
          System Purified
        </h1>

        <div className="bg-emerald-950/10 border border-emerald-500/30 rounded-lg p-8 mb-12 backdrop-blur-sm min-h-[120px] flex items-center justify-center">
          <p className="text-emerald-100 font-mono text-lg leading-relaxed tracking-wide">
            {typedVictory}
            <span className="inline-block w-2 h-5 bg-emerald-500 ml-1 animate-pulse align-middle" />
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12 max-w-md mx-auto">
          <div className="bg-black border border-emerald-500/20 rounded-lg p-6 group hover:border-emerald-500/50 transition-colors">
            <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-3 opacity-60" />
            <p className="text-emerald-400 font-mono text-3xl font-black">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              Time to Purge
            </p>
          </div>
          <div className="bg-black border border-emerald-500/20 rounded-lg p-6 group hover:border-emerald-500/50 transition-colors">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-3 opacity-60" />
            <p className="text-emerald-400 font-mono text-3xl font-black">100%</p>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              Grid Integrity
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-10 py-4 bg-emerald-500 text-black font-mono font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <RotateCcw className="w-5 h-5" />
            Return to Headquarters
          </button>
        </div>
      </motion.div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-emerald-500/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-emerald-500/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-emerald-500/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-emerald-500/40" />
    </div>
  );
}
