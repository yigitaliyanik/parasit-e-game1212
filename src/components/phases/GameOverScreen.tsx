"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { motion } from "framer-motion";
import { Skull, Clock, Zap, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ALL_DISTRICTS } from "@/lib/types";

interface GameOverScreenProps {
  roomId: string;
}

export default function GameOverScreen({ roomId }: GameOverScreenProps) {
  const { session } = useGameSession(roomId);
  const router = useRouter();

  const repairedCount = session?.task1?.engineerRepaired?.length || 0;
  const elapsed = session?.startTime
    ? Math.floor((Date.now() - session.startTime) / 1000)
    : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-red-900/10" />
      <div className="scanline" />
      <div className="noise-bg" />

      {/* Glitch border */}
      <div className="absolute inset-4 border border-red-500/20 rounded-lg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-8 max-w-2xl"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Skull className="w-24 h-24 text-red-500 mx-auto mb-8 opacity-80" />
        </motion.div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl font-black uppercase tracking-[0.2em] text-red-500 mb-4"
          style={{ textShadow: "0 0 30px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.2)" }}
        >
          Mission Failed
        </h1>

        <p className="text-red-400/70 font-mono text-lg tracking-widest uppercase mb-12">
          Parasit[e] has won
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-black/80 border border-red-500/20 rounded-lg p-6">
            <Clock className="w-6 h-6 text-red-400 mx-auto mb-3 opacity-60" />
            <p className="text-red-400 font-mono text-3xl font-black">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              Time Elapsed
            </p>
          </div>
          <div className="bg-black/80 border border-red-500/20 rounded-lg p-6">
            <Zap className="w-6 h-6 text-red-400 mx-auto mb-3 opacity-60" />
            <p className="text-red-400 font-mono text-3xl font-black">
              {repairedCount} / {ALL_DISTRICTS.length}
            </p>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              Transformers Repaired
            </p>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-transparent border-2 border-red-500/50 text-red-400 font-mono font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-black transition-all flex items-center gap-3 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          Return to Hub
        </button>
      </motion.div>
    </div>
  );
}
