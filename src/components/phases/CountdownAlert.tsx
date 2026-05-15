"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameSession } from "@/hooks/useGameSession";

interface CountdownAlertProps {
  roomId: string;
}

export default function CountdownAlert({ roomId }: CountdownAlertProps) {
  const { session, currentPlayer, startPlaying } = useGameSession(roomId);
  const [countdown, setCountdown] = useState(3);
  const [hasTriggered, setHasTriggered] = useState(false);

  // 3-second countdown then transition to intro (via startPlaying initializing Mission 1)
  useEffect(() => {
    if (countdown <= 0 && !hasTriggered && currentPlayer?.isHost) {
      setHasTriggered(true);
      startPlaying();
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, hasTriggered, currentPlayer?.isHost, startPlaying]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center overflow-hidden">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-red-900/20 animate-pulse-red" />
      
      {/* Scanline effect */}
      <div className="scanline" />
      <div className="noise-bg" />

      {/* Flashing border */}
      <div className="absolute inset-4 border-2 border-red-500/50 animate-flash-red rounded-lg" />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative z-10 text-center px-8"
      >
        {/* Warning icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-red-500 text-8xl font-black mb-8"
        >
          ⚠
        </motion.div>

        {/* Main message */}
        <h1 className="countdown-text text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.2em] leading-tight mb-6">
          You have 30 minutes
          <br />
          <span className="text-red-400">to save Ecoville</span>
        </h1>

        {/* Countdown number */}
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-9xl font-black text-red-500 mt-8"
          style={{ textShadow: "0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4)" }}
        >
          {countdown > 0 ? countdown : "GO"}
        </motion.div>

        {/* Subtitle */}
        <p className="text-red-400/60 font-mono text-sm tracking-[0.3em] uppercase mt-6 animate-pulse">
          Mission Clock Initializing...
        </p>
      </motion.div>
    </div>
  );
}
