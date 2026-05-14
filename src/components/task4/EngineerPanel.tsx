"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Wrench, ShieldAlert, CheckCircle2, AlertTriangle, Lock } from "lucide-react";

interface Task4EngineerPanelProps {
  routeChanged: boolean;
  onComplete: () => void;
}

export default function Task4EngineerPanel({ routeChanged, onComplete }: Task4EngineerPanelProps) {
  const [phase, setPhase] = useState<"ACQUISITION" | "REFLEX" | "DONE">("ACQUISITION");
  const [wagonIds, setWagonIds] = useState("");
  const [wagonError, setWagonError] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  
  // Reflex Game State
  const [sliderPos, setSliderPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [gameMsg, setGameMsg] = useState("");
  const requestRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  
  // The Safe Zone is roughly from 40% to 60%
  const SAFE_ZONE_START = 40;
  const SAFE_ZONE_END = 60;
  
  // Speed
  const SPEED = 2; // % per frame roughly

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIds = wagonIds.replace(/\s+/g, "");
    if (cleanIds === "04,08,15" || cleanIds === "04,15,08" || cleanIds === "08,04,15" || cleanIds === "08,15,04" || cleanIds === "15,04,08" || cleanIds === "15,08,04") {
      setPhase("REFLEX");
      setWagonError(false);
    } else {
      setWagonError(true);
    }
  };

  useEffect(() => {
    if (phase !== "REFLEX" || !isPlayingRef.current) return;

    const animate = () => {
      setSliderPos((prev) => {
        let nextPos = prev + direction * SPEED;
        if (nextPos >= 100) {
          nextPos = 100;
          setDirection(-1);
        } else if (nextPos <= 0) {
          nextPos = 0;
          setDirection(1);
        }
        return nextPos;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [phase, direction]);

  const handleDecouple = () => {
    if (!isPlayingRef.current) return;
    
    // Check if within safe zone
    if (sliderPos >= SAFE_ZONE_START && sliderPos <= SAFE_ZONE_END) {
      setGameMsg("HIT! WAGON SECURED.");
      const newCount = successCount + 1;
      setSuccessCount(newCount);
      
      if (newCount >= 3) {
        isPlayingRef.current = false;
        setPhase("DONE");
        onComplete();
      } else {
        // Pause briefly before continuing
        isPlayingRef.current = false;
        setTimeout(() => {
          setGameMsg("");
          isPlayingRef.current = true;
          setDirection(Math.random() > 0.5 ? 1 : -1);
        }, 1000);
      }
    } else {
      setGameMsg("MISSED! RECALCULATING...");
      isPlayingRef.current = false;
      setTimeout(() => {
        setGameMsg("");
        isPlayingRef.current = true;
      }, 1000);
    }
  };

  if (!routeChanged) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/50">
        <Lock className="w-20 h-20 text-cyan-400/50 mb-6" />
        <h2 className="text-2xl font-black text-cyan-400/50 uppercase tracking-widest mb-4">
          Awaiting Reroute
        </h2>
        <p className="font-mono text-cyan-100/50 mb-6 max-w-md">
          WAITING FOR ROUTE DIVERSION. System locked by Executive override.
        </p>
      </div>
    );
  }

  if (phase === "DONE") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/50">
        <CheckCircle2 className="w-20 h-20 text-cyan-400 mb-6" />
        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest mb-4">
          Wagons Detached
        </h2>
        <p className="font-mono text-cyan-100/80 mb-6 max-w-md">
          All toxic wagons have been successfully separated. Threat neutralized.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-black/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/30">
        <div>
          <h2 className="text-2xl font-black text-cyan-500 uppercase tracking-widest flex items-center gap-3">
            <Wrench className="w-8 h-8" />
            Decoupling System
          </h2>
          <p className="text-cyan-400/60 font-mono text-sm mt-1 uppercase tracking-wider">
            Status: Manual Override Engaged
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
        {phase === "ACQUISITION" && (
          <div className="bg-black/40 border border-cyan-500/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Target Acquisition
              </h3>
            </div>
            
            <p className="font-mono text-sm text-cyan-100/80 mb-4 uppercase tracking-widest">
              Input Toxic Wagon IDs to Decouple (Comma separated):
            </p>

            <form onSubmit={handleIdSubmit} className="flex gap-4">
              <input
                type="text"
                value={wagonIds}
                onChange={(e) => setWagonIds(e.target.value)}
                placeholder="e.g. 01,02,03"
                className="flex-1 bg-black/50 border border-cyan-500/50 rounded px-4 py-3 font-mono text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="bg-cyan-500/10 border border-cyan-500 text-cyan-500 px-6 py-3 rounded font-mono uppercase tracking-widest hover:bg-cyan-500/20 transition-colors"
              >
                Lock On
              </button>
            </form>
            {wagonError && (
              <p className="font-mono text-sm text-red-500 mt-3 animate-pulse font-bold">
                ERROR: INVALID WAGON IDS.
              </p>
            )}
            
            <div className="mt-8 p-4 bg-cyan-950/20 border-l-4 border-cyan-500 text-sm font-mono text-cyan-200">
              <p className="uppercase tracking-wider font-bold">
                Directive:
              </p>
              <p className="opacity-80 mt-1">
                Obtain target wagon IDs from the JOURNALIST to proceed with manual decoupling.
              </p>
            </div>
          </div>
        )}

        {phase === "REFLEX" && (
          <div className="bg-black/40 border border-cyan-500/30 p-6 rounded-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Precision Decouple Sequence
              </h3>
            </div>

            <div className="flex justify-between font-mono text-cyan-100/80 mb-4 uppercase tracking-widest text-sm">
              <span>Wagons Secured: {successCount} / 3</span>
              <span>Speed: HIGH</span>
            </div>

            {/* Slider Track */}
            <div className="relative w-full h-12 bg-black border-2 border-slate-700 rounded-full overflow-hidden mb-8">
              {/* Safe Zone Indicator */}
              <div 
                className="absolute top-0 bottom-0 bg-green-500/30 border-x-2 border-green-500"
                style={{ 
                  left: `${SAFE_ZONE_START}%`, 
                  width: `${SAFE_ZONE_END - SAFE_ZONE_START}%` 
                }}
              />
              
              {/* Moving Marker */}
              <div 
                className="absolute top-0 bottom-0 w-4 bg-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full transform -translate-x-1/2"
                style={{ left: `${sliderPos}%` }}
              />
            </div>

            <button
              onClick={handleDecouple}
              className="w-full bg-cyan-500/10 border-2 border-cyan-500 text-cyan-400 px-6 py-6 rounded font-mono text-xl uppercase tracking-[0.2em] font-black hover:bg-cyan-500/20 hover:shadow-[0_0_20px_#22d3ee] transition-all active:scale-95"
            >
              DECOUPLE
            </button>

            {/* Game Message */}
            <div className="h-8 mt-6">
              {gameMsg && (
                <p className={`font-mono font-bold uppercase tracking-widest ${
                  gameMsg.includes("HIT") ? "text-green-400" : "text-red-500 animate-pulse"
                }`}>
                  {gameMsg}
                </p>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-amber-950/20 border-l-4 border-amber-500 text-sm font-mono text-amber-200 text-left">
              <p className="opacity-80 mt-1">
                WARNING: Magnetic coupling unstable. Hit DECOUPLE exactly when marker enters the green safe zone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
