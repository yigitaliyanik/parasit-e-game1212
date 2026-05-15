"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameSession } from "@/hooks/useGameSession";
import { MatrixRain } from "@/components/MatrixRain";
import { useAudio } from "@/contexts/AudioContext";
import { useTypewriter } from "@/hooks/useTypewriter";

interface MissionIntroProps {
  roomId: string;
}

export default function MissionIntro({ roomId }: MissionIntroProps) {
  const { session, currentPlayer, enterPlayingPhase } = useGameSession(roomId);
  const [timeLeft, setTimeLeft] = useState(10);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { setBGM, playSFX, stopSFX } = useAudio();

  const missionNumber = session?.currentMission || 1;

  const missionInfo: Record<number, { title: string; text: string }> = {
    1: {
      title: "MISSION 01: CITY GRID",
      text: "Ecoville's power grid has been compromised. The city is plunging into darkness. Identify the failed nodes, authorize access, and restore power before the system collapses entirely."
    },
    2: {
      title: "MISSION 02: WATER FACILITY",
      text: "The water purification systems are failing. Toxicity levels are rising rapidly. We must regain control of the filtration pipelines before the city's water supply is contaminated."
    },
    3: {
      title: "MISSION 03: CENTRAL HOSPITAL",
      text: "The hospital's backup generators are offline. Patients are in critical danger. Analyze the network, authorize access, and reroute emergency power immediately."
    },
    4: {
      title: "MISSION 04: THE TOXIC EXPRESS",
      text: "A rogue train carrying hazardous materials is on a collision course with the city center. Divert the route and detach the cargo wagons to prevent a catastrophic disaster."
    }
  };

  const currentMission = missionInfo[missionNumber] || missionInfo[1];
  const { displayedText, isComplete } = useTypewriter(currentMission.text, 30);

  useEffect(() => {
    setBGM(true);
    playSFX("typing");
    return () => stopSFX("typing");
  }, []);

  useEffect(() => {
    if (isComplete) {
      stopSFX("typing");
    }
  }, [isComplete]);

  useEffect(() => {
    if (timeLeft <= 0 && !hasTriggered && currentPlayer?.isHost) {
      setHasTriggered(true);
      enterPlayingPhase();
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, hasTriggered, currentPlayer?.isHost, enterPlayingPhase]);

  const handleStartNow = () => {
    if (currentPlayer?.isHost && !hasTriggered) {
      playSFX("click");
      setHasTriggered(true);
      enterPlayingPhase();
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono px-4">
      {/* Subtle Matrix Rain Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <MatrixRain />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-10" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center max-w-4xl w-full"
      >
        <motion.div 
          className="text-green-500 mb-4 tracking-[0.5em] text-sm md:text-base font-bold uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          INCOMING TRANSMISSION
        </motion.div>

        <h1 className="font-black text-5xl md:text-7xl text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] text-center tracking-wider mb-8">
          {currentMission.title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mt-2 max-w-3xl text-center leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] min-h-[120px]">
          {displayedText}
          {!isComplete && <span className="inline-block w-2 h-6 bg-green-500 ml-1 animate-pulse" />}
        </p>

        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="text-gray-400 font-mono tracking-widest text-lg">
            INITIATING IN: <span className="text-white font-bold">{timeLeft}s</span>
          </div>

          {currentPlayer?.isHost && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartNow}
              className="mt-4 border-2 border-green-500/50 hover:border-green-400 bg-black/50 hover:bg-green-500/20 text-green-400 px-8 py-3 font-bold uppercase tracking-widest transition-all duration-300"
            >
              START NOW
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
