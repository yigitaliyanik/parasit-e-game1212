"use client";

import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

export default function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="fixed top-6 right-6 z-[200] p-3 rounded-xl bg-black/40 backdrop-blur-md border border-slate-800 hover:border-[#00ff41]/50 group transition-all"
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-slate-500 group-hover:text-[#ff003c]" />
      ) : (
        <Volume2 className="w-5 h-5 text-[#00ff41] group-hover:text-[#00ff41]" />
      )}
      
      {/* Visual Indicator of Mute State */}
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isMuted ? 'bg-[#ff003c]' : 'bg-[#00ff41]'} animate-pulse`} />
    </motion.button>
  );
}
