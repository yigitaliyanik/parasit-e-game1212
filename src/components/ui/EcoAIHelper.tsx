"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/lib/types";

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
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMission, setCurrentMission] = useState(missionNumber);

  // Reset hints when mission changes
  useEffect(() => {
    if (missionNumber !== currentMission) {
      setHintsRemaining(2);
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

  const hintText = HINTS[missionNumber]?.[role] || "I'm analyzing the situation. Stay alert, Agent.";

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 mr-2 max-w-[280px] bg-black/90 border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] relative"
          >
            <div className="text-cyan-400 font-mono text-sm leading-relaxed">
              {hintText}
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-black border-r border-b border-cyan-500/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Icon and Counter */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-[10px] font-mono text-green-500/70 tracking-widest uppercase">
          Hints: {hintsRemaining}/2
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleIconClick}
          className="relative w-16 h-16 flex items-center justify-center group"
        >
          {/* Pentagon Shape */}
          <div 
            className="absolute inset-0 bg-black border-2 border-green-500/50 group-hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300"
            style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center font-black leading-none">
            <span className="text-green-400 text-xs tracking-tighter">ECO</span>
            <span className="text-cyan-400 text-sm mt-0.5">AI</span>
          </div>

          {/* Pulse effect if hints available */}
          {hintsRemaining > 0 && !showBubble && (
            <div className="absolute inset-0 bg-green-500/20 animate-ping" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
