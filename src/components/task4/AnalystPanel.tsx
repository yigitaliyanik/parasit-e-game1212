"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Search, Network } from "lucide-react";

/**
 * Task4AnalystPanel Component
 * 
 * Provides the tactical decoding layer for the Data Analyst.
 * 
 * Responsibilities:
 * - Decodes complex system manifests to find hidden routing codes.
 * - Coordinates with the Executive to provide the required junction node states.
 */
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
      if (trainId.trim().toUpperCase() === "ECORAIL") {
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
              placeholder="e.g. ECORAIL"
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
                Route Analysis: ECORAIL
              </h3>
            </div>

            <div className="space-y-4 font-mono text-cyan-100/80">
              <p className="text-xl text-cyan-300 font-bold mb-3">
                To save the city, tell the Executive: SWITCH A = LEFT, SWITCH C = RIGHT
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
