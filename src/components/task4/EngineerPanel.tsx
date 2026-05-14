"use client";

import { useState, useEffect } from "react";
import { Wrench, ShieldAlert, CheckCircle2, Lock } from "lucide-react";

interface Task4EngineerPanelProps {
  routeChanged: boolean;
  wagonsDetached: boolean;
  onComplete: () => void;
}

export default function Task4EngineerPanel({ routeChanged, wagonsDetached, onComplete }: Task4EngineerPanelProps) {
  const [wagon1, setWagon1] = useState("");
  const [wagon2, setWagon2] = useState("");
  const [wagon3, setWagon3] = useState("");
  const [error, setError] = useState(false);
  
  const [stage, setStage] = useState<'input' | 'reflex'>('input');
  const [successCount, setSuccessCount] = useState(0);
  const [markerPos, setMarkerPos] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reflexError, setReflexError] = useState(false);

  const ZONE_START = 40;
  const ZONE_END = 60;

  useEffect(() => {
    if (stage === 'reflex' && !wagonsDetached) {
      const interval = setInterval(() => {
        setMarkerPos((prev) => {
          let next = prev + direction * 2;
          if (next >= 100) {
            setDirection(-1);
            return 100;
          }
          if (next <= 0) {
            setDirection(1);
            return 0;
          }
          return next;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [stage, direction, wagonsDetached]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputs = [wagon1.trim(), wagon2.trim(), wagon3.trim()].sort();
    const correct = ["04", "08", "15"].sort();

    if (JSON.stringify(inputs) === JSON.stringify(correct)) {
      setError(false);
      setStage('reflex');
    } else {
      setError(true);
    }
  };

  const handleDecouple = () => {
    if (markerPos >= ZONE_START && markerPos <= ZONE_END) {
      setReflexError(false);
      const newCount = successCount + 1;
      setSuccessCount(newCount);
      if (newCount >= 3) {
        onComplete();
      }
    } else {
      setReflexError(true);
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
          WAITING FOR ROUTE CHANGE.
        </p>
      </div>
    );
  }

  if (wagonsDetached) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/50">
        <CheckCircle2 className="w-20 h-20 text-cyan-400 mb-6" />
        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest mb-4">
          Wagons Detached
        </h2>
        <p className="font-mono text-cyan-100/80 mb-6 max-w-md">
          Toxic wagons detached! Threat neutralized!
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
        {stage === 'input' && (
          <div className="bg-black/40 border border-cyan-500/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Target Acquisition
              </h3>
            </div>
            
            <p className="font-mono text-sm text-cyan-100/80 mb-4 uppercase tracking-widest">
              Enter Toxic Wagon Numbers:
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={wagon1}
                  onChange={(e) => setWagon1(e.target.value)}
                  placeholder="ID 1"
                  className="flex-1 bg-black/50 border border-cyan-500/50 rounded px-4 py-3 font-mono text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={wagon2}
                  onChange={(e) => setWagon2(e.target.value)}
                  placeholder="ID 2"
                  className="flex-1 bg-black/50 border border-cyan-500/50 rounded px-4 py-3 font-mono text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={wagon3}
                  onChange={(e) => setWagon3(e.target.value)}
                  placeholder="ID 3"
                  className="flex-1 bg-black/50 border border-cyan-500/50 rounded px-4 py-3 font-mono text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="bg-cyan-500/10 border border-cyan-500 text-cyan-500 px-6 py-4 mt-2 rounded font-mono uppercase tracking-widest font-bold hover:bg-cyan-500/20 transition-colors"
              >
                Confirm Targets
              </button>
            </form>
            {error && (
              <p className="font-mono text-sm text-red-500 mt-3 animate-pulse font-bold">
                ERROR: INVALID WAGON IDS DETECTED.
              </p>
            )}
            
            <div className="mt-8 p-4 bg-cyan-950/20 border-l-4 border-cyan-500 text-sm font-mono text-cyan-200">
              <p className="uppercase tracking-wider font-bold">
                Directive:
              </p>
              <p className="opacity-80 mt-1">
                Ask the Journalist for the wagon IDs.
              </p>
            </div>
          </div>
        )}

        {stage === 'reflex' && (
          <div className="bg-black/40 border border-cyan-500/30 p-6 rounded-lg text-center">
            <h3 className="font-mono text-cyan-400 uppercase tracking-widest font-bold mb-6">
              Decoupling Sequence Initiated
            </h3>
            
            <p className="font-mono text-sm text-cyan-100/80 mb-8 uppercase tracking-widest">
              Click DECOUPLE when marker is in GREEN zone.<br/>
              Successes needed: {3 - successCount}
            </p>

            <div className="relative h-12 bg-slate-800 rounded-full mb-8 overflow-hidden border border-cyan-900">
              {/* Target Zone */}
              <div 
                className="absolute h-full bg-green-500/40 border-x-2 border-green-400"
                style={{ left: `${ZONE_START}%`, width: `${ZONE_END - ZONE_START}%` }}
              />
              
              {/* Moving Marker */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_#fff]"
                style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
              />
            </div>

            <button
              onClick={handleDecouple}
              className="w-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 font-bold font-mono text-xl py-6 rounded hover:bg-cyan-500/40 active:bg-cyan-400 active:text-black transition-all"
            >
              DECOUPLE
            </button>

            {reflexError && (
              <p className="font-mono text-sm text-red-500 mt-4 animate-pulse font-bold">
                MISS! Timing off. Try again.
              </p>
            )}
            
            <div className="mt-8 flex justify-center gap-4">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full border-2 ${
                    i < successCount 
                      ? 'bg-green-500 border-green-400 shadow-[0_0_10px_#22c55e]' 
                      : 'bg-transparent border-slate-600'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
