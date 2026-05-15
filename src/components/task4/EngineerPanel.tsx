"use client";

import { useState, useEffect } from "react";
import { Wrench, ShieldAlert, CheckCircle2, Lock, Train } from "lucide-react";

interface Task4EngineerPanelProps {
  routeChanged: boolean;
  wagonsDetached: boolean;
  onComplete: () => void;
}

/**
 * Task4EngineerPanel Component
 * 
 * Implements the physical intervention phase for the Engineer in Mission 4 (EcoRail).
 * 
 * Key Features:
 * - Train Visualization: A fixed grid-based SVG/CSS visualization of the Engine and Wagons.
 * - Reflex Challenge: A timing-based mini-game requiring the user to click when a marker 
 *   aligns with a calibration zone (linear volume ramping logic for UI feedback).
 * - State Sync: Notifies the parent phase of successful wagon decoupling to trigger 
 *   global mission progression.
 */
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
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-8">
            {/* Main Train Visualization */}
            <div className="grid grid-cols-4 gap-4 justify-center items-end w-full max-w-2xl min-h-[160px]">
              {/* Engine */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-20 bg-cyan-900/40 border-2 border-cyan-400 rounded-t-xl relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)] animate-pulse" />
                  <Train className="w-10 h-10 text-cyan-400 relative z-10" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-cyan-500/20 border border-cyan-500/50 rounded-t" />
                </div>
                <div className="w-28 h-6 bg-slate-800 border-2 border-cyan-900 rounded-b-lg -mt-1 shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
                <span className="text-[10px] font-mono text-cyan-500 mt-2 font-bold tracking-widest uppercase">Engine</span>
              </div>

              {/* Wagons */}
              {[0, 1, 2].map((i) => {
                const isDetached = i < successCount;
                return (
                  <div key={i} className={`flex flex-col items-center transition-all duration-700 ease-in-out ${isDetached ? 'opacity-20 translate-y-12 rotate-3 scale-95 pointer-events-none' : 'opacity-100'}`}>
                    <div className="w-24 h-16 bg-slate-900/60 border-2 border-cyan-500/40 rounded relative flex items-center justify-center group overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 bg-green-500/10 transition-all duration-500" style={{ height: '60%' }} />
                       <span className="relative z-10 font-mono text-cyan-300/80 font-bold text-lg">W-{["04", "08", "15"][i]}</span>
                       {isDetached && <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-green-500" />}
                    </div>
                    <div className="w-28 h-4 bg-slate-800 border-x-2 border-b-2 border-cyan-900 rounded-b -mt-1" />
                    <span className="text-[10px] font-mono text-cyan-700 mt-2 uppercase">{isDetached ? 'Detached' : 'Wagon'}</span>
                  </div>
                );
              })}
            </div>

            {/* Reflex Bar */}
            <div className="w-full max-w-md">
              <div className="relative h-12 bg-slate-900 border-2 border-cyan-900 rounded-lg overflow-hidden shadow-inner">
                {/* Safe Zone */}
                <div 
                  className="absolute h-full bg-cyan-400/20 border-x border-cyan-400/40"
                  style={{ left: `${ZONE_START}%`, width: `${ZONE_END - ZONE_START}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-cyan-400 font-bold tracking-tighter">SAFE_ZONE</span>
                  </div>
                </div>

                {/* Moving Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                  style={{ left: `${markerPos}%`, transition: 'none' }}
                />
              </div>
              
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[9px] font-mono text-cyan-900">0%</span>
                <span className="text-[10px] font-mono text-cyan-500/60">T_ALGN_CALIB</span>
                <span className="text-[9px] font-mono text-cyan-900">100%</span>
              </div>
            </div>

            <div className="w-full max-w-md space-y-4">
              <button
                onClick={handleDecouple}
                disabled={successCount >= 3}
                className="w-full bg-cyan-500/10 border-2 border-cyan-400/50 text-cyan-300 font-bold font-mono text-xl py-6 rounded hover:bg-cyan-500/20 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] group disabled:opacity-20"
              >
                <span className="group-hover:tracking-widest transition-all">
                  {successCount >= 3 ? "SYSTEM_STABLE" : `DECOUPLE_WAGON_${successCount + 1}`}
                </span>
              </button>

              {reflexError && (
                <p className="font-mono text-sm text-red-500 text-center animate-pulse font-bold bg-red-500/10 py-2 border border-red-500/20 rounded">
                  MISS! CALIBRATION_ERROR. REDEPLOYING...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
