"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/lib/types";
import { useTypewriter } from "@/hooks/useTypewriter";

interface EcoAIHelperProps {
  role: Role;
  missionNumber: number;
}

const HINTS: Record<number, Record<string, string>> = {
  1: {
    journalist: "Hey Journalist, I'm ECO AI. Read the events in the newspapers and tell the Data Analyst their locations immediately!",
    analyst: "Cross-reference the locations from the Journalist with your grid map to find the correct transformer IDs.",
    executive: "Wait for the Analyst to find the IDs, then authorize the repairs in your terminal so the Engineer can work.",
    engineer: "Once the Executive authorizes a node, complete the wire puzzle to repair the connection."
  },
  2: {
    journalist: "Listen to the radio intercepts. One worker mentions a specific valve sequence or pressure level needed for stability.",
    analyst: "You must request access to the main valves. Wait for the Executive to grant it before you can guide the Engineer.",
    executive: "Monitor the pressure gauges. Watch for access requests from the Analyst and grant them to proceed.",
    engineer: "Balance the water flow by following the specific valve instructions provided by the Analyst."
  },
  3: {
    journalist: "Search the patient records for encrypted backup codes. They are vital for restoring hospital power.",
    analyst: "Decrypt the backup codes found by the Journalist and provide the sequence to the Executive.",
    executive: "Input the decrypted sequences to grant the Engineer access to the hospital's main servers.",
    engineer: "Access the terminal and execute the power restoration sequence once the servers are unlocked."
  },
  4: {
    journalist: "Identify the target Train ID 'ECORAIL' and the hazardous cargo wagon numbers from the manifest.",
    analyst: "Search the database for 'ECORAIL' to find the precise route coordinates for redirection.",
    executive: "Update the track route based on the Analyst's data to redirect the train away from the city center.",
    engineer: "Manually detach the hazardous wagons once the train has been successfully diverted."
  }
};

export default function EcoAIHelper({ role, missionNumber }: EcoAIHelperProps) {
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMission, setCurrentMission] = useState(missionNumber);

  const hintText = HINTS[missionNumber]?.[role] || "I'm analyzing the situation. Stay alert, Agent.";
  const { displayedText } = useTypewriter(hintText, 30, showBubble);

  // Reset hints when mission changes
  useEffect(() => {
    if (missionNumber !== currentMission) {
      setHintsRemaining(3);
      setCurrentMission(missionNumber);
      setShowBubble(false);
    }
  }, [missionNumber, currentMission]);

  const handleIconClick = () => {
    if (showBubble) {
      setShowBubble(false);
    } else if (hintsRemaining > 0) {
      setShowBubble(true);
      setHintsRemaining(prev => prev - 1);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Holographic Dialogue Box */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
            className="mb-6 mr-4 max-w-[320px] relative group"
          >
            {/* Holographic Background */}
            <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 rounded-sm shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
            
            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            {/* Decorative Corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <div className="relative z-10 p-5">
              <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/20 pb-2">
                <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase">AI_ADVISOR_LINK</span>
              </div>
              
              <div className="text-cyan-100 font-mono text-sm leading-relaxed min-h-[80px]">
                {displayedText}
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
              </div>
            </div>

            {/* Close instruction */}
            <div className="absolute -bottom-5 right-0 text-[9px] text-cyan-500/50 uppercase tracking-widest font-mono">
              Click icon to dismiss
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced AI Icon & Battery Bars */}
      <div className="relative flex flex-col items-center group">
        
        {/* Battery Bars (Hint Indicator) */}
        <div className="absolute -top-8 flex gap-1.5">
          {[1, 2, 3].map((bar) => (
            <motion.div
              key={bar}
              initial={false}
              animate={{ 
                backgroundColor: bar <= hintsRemaining ? "#22c55e" : "#3f3f46",
                boxShadow: bar <= hintsRemaining ? "0 0 10px #22c55e" : "none",
                opacity: bar <= hintsRemaining ? 1 : 0.3
              }}
              className="w-4 h-1.5 rounded-full transition-colors duration-500"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleIconClick}
          className="relative w-20 h-20 flex items-center justify-center"
        >
          {/* Animated Glow Backlight */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-green-500/10 blur-xl rounded-full"
          />

          {/* Custom SVG Pentagon */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
            <defs>
              <linearGradient id="pentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,197,94,0.1)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
              </linearGradient>
            </defs>
            <path
              d="M50 5 L95 38 L78 92 L22 92 L5 38 Z"
              fill="url(#pentagonGradient)"
              stroke={hintsRemaining > 0 ? "#22c55e" : "#4ade8050"}
              strokeWidth="3"
              className="transition-colors duration-500"
            />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center justify-center leading-none">
            <span className="text-green-400 text-[10px] font-black tracking-widest mb-0.5">ECO</span>
            <span className="text-cyan-400 text-base font-black tracking-tighter">AI</span>
          </div>

          {/* Pulse Ripple Effect */}
          {hintsRemaining > 0 && !showBubble && (
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border border-green-500/50 rounded-full pointer-events-none"
            />
          )}
        </motion.button>

        {/* Status Label */}
        <div className="mt-2 text-[9px] font-mono text-green-500/40 tracking-[0.3em] uppercase">
          {hintsRemaining > 0 ? "Advisor_Active" : "Advisor_Offline"}
        </div>
      </div>
    </div>
  );
}
