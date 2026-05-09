"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

interface GameTimerProps {
  startTime: number;
  penaltyTime?: number;
  onTimeUp: () => void;
}

export default function GameTimer({ startTime, penaltyTime = 0, onTimeUp }: GameTimerProps) {
  const TOTAL_DURATION = 30 * 60; // 30 minutes in seconds

  const calcRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const effective = TOTAL_DURATION - elapsed - penaltyTime;
    return Math.max(0, effective);
  }, [startTime, penaltyTime, TOTAL_DURATION]);

  const [remaining, setRemaining] = useState(calcRemaining);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0 && !hasEnded) {
        setHasEnded(true);
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining, hasEnded, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isUrgent = remaining < 300; // < 5 minutes
  const isCritical = remaining < 60; // < 1 minute

  return (
    <div className="flex items-center justify-center gap-3 py-3 px-6 bg-[#030712]/90 border-b border-white/10 relative z-20">
      <Clock className={`w-5 h-5 ${isCritical ? "text-red-500 animate-pulse" : isUrgent ? "text-amber-400" : "text-[#00ffff]"}`} />
      <div
        className={`font-mono text-2xl font-black tracking-[0.3em] ${
          isCritical
            ? "text-red-500 animate-pulse"
            : isUrgent
            ? "text-amber-400"
            : "text-[#00ffff]"
        }`}
        style={{
          textShadow: isCritical
            ? "0 0 20px rgba(239,68,68,0.8)"
            : isUrgent
            ? "0 0 15px rgba(251,191,36,0.5)"
            : "0 0 10px rgba(0,255,255,0.3)",
        }}
      >
        {timeStr}
      </div>
      {penaltyTime > 0 && (
        <span className="text-red-400 text-[10px] font-mono uppercase tracking-wider opacity-70">
          (-{penaltyTime}s penalty)
        </span>
      )}
    </div>
  );
}
