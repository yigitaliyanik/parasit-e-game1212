"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Search, Network } from "lucide-react";

export default function Task4AnalystPanel() {
  const [trainId, setTrainId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainId.trim()) return;

    setIsSearching(true);
    setError(false);
    setShowResult(false);

    setTimeout(() => {
      setIsSearching(false);
      if (trainId.trim() === "77") {
        setShowResult(true);
      } else {
        setError(true);
      }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col relative bg-black/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-green-500/30">
        <div>
          <h2 className="text-2xl font-black text-green-500 uppercase tracking-widest flex items-center gap-3">
            <Map className="w-8 h-8" />
            Railway Routing System
          </h2>
          <p className="text-green-400/60 font-mono text-sm mt-1 uppercase tracking-wider">
            Network Status: Active
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
        {/* Search Form */}
        <div className="bg-black/40 border border-green-500/30 p-6 rounded-lg">
          <p className="font-mono text-sm text-green-400 mb-4 uppercase tracking-widest">
            Input Target Train ID to view routing options.
          </p>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={trainId}
              onChange={(e) => setTrainId(e.target.value)}
              placeholder="e.g. 01"
              className="flex-1 bg-black/50 border border-green-500/50 rounded px-4 py-3 font-mono text-green-100 placeholder:text-green-900 focus:outline-none focus:border-green-400"
            />
            <button
              type="submit"
              disabled={isSearching || !trainId.trim()}
              className="bg-green-500/10 border border-green-500 text-green-500 px-6 py-3 rounded font-mono uppercase tracking-widest hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <span className="animate-pulse">Searching...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Locate
                </>
              )}
            </button>
          </form>
          {error && (
            <p className="font-mono text-sm text-red-500 mt-3 animate-pulse">
              ERROR: Train ID not found in active network.
            </p>
          )}
        </div>

        {/* Results */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/40 border border-cyan-500/50 p-6 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Network className="w-6 h-6 text-cyan-400" />
              <h3 className="font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Route Analysis: Train 77
              </h3>
            </div>

            <div className="space-y-4 font-mono text-cyan-100/80">
              <p>
                <strong>Current Trajectory:</strong> City Center (Collision Imminent)
              </p>
              <p>
                <strong>Alternative Route:</strong> The Wastelands (Safe Zone)
              </p>
              
              <div className="mt-6 p-4 bg-cyan-950/30 border border-cyan-500/30 rounded">
                <p className="text-cyan-300 font-bold mb-3 uppercase tracking-wider">
                  Required Switch Configuration:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    NODE A: <span className="text-white font-bold bg-cyan-500/20 px-2 py-0.5 rounded">LEFT</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    NODE B: <span className="text-slate-400 italic">No effect on target route</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    NODE C: <span className="text-white font-bold bg-cyan-500/20 px-2 py-0.5 rounded">RIGHT</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-950/20 border-l-4 border-green-500 text-sm font-mono text-green-200">
              <p className="uppercase tracking-wider font-bold">
                Directive:
              </p>
              <p className="opacity-80 mt-1">
                Relay switch directions to EXECUTIVE to divert the train.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
