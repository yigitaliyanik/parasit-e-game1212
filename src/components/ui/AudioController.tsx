"use client";

import { Volume2, VolumeX, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAudio } from "@/contexts/AudioContext";

export default function AudioController() {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-[200] flex items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-slate-800 p-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3 px-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00ff41] hover:accent-[#00ff41]/80 transition-all"
              />
              <span className="text-[10px] font-mono text-[#00ff41] w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center bg-black/40 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 transition-colors ${isOpen ? 'bg-[#00ff41]/10 text-[#00ff41]' : 'text-slate-400 hover:text-white'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        
        <div className="w-[1px] h-6 bg-slate-800" />

        <button
          onClick={toggleMute}
          className="p-3 group transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-slate-500 group-hover:text-[#ff003c]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#00ff41] group-hover:text-[#00ff41]" />
          )}
        </button>
      </div>
      
      {/* Visual Indicator of Activity */}
      <div className={`absolute -bottom-2 right-4 w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-[#ff003c]' : 'bg-[#00ff41]'} shadow-[0_0_10px_currentColor] animate-pulse`} />
    </div>
  );
}
