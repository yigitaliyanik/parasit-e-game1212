"use client";

import { useState, useEffect } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { useTypewriter } from "@/hooks/useTypewriter";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface BriefingPhaseProps {
  roomId: string;
}

const PHASE1_TEXT = `[ECO_AI_SYSTEM_INITIALIZING...]
[FIREWALL: BREACHED]
[CITY_STATUS: CRITICAL]

Can anyone hear me? Please, someone be on this channel... I am Eco, the city's infrastructure AI.
> Following the meteor strike, an unknown digital entity—we call it 'Parazit[e]'—has infiltrated the city. Power grids are failing, water systems are being poisoned, and communications are about to collapse.
> I have activated Protocol:[e] and connected you, the Emergency Response Team, to this isolated network. You are our only hope to save the city. But first, we must establish your connection...`;

const ROLE_TEXTS: Record<string, string> = {
  journalist: "Terminal Confirmed: Communication Network. Welcome, Journalist. The city is blind and deaf. People are in a panic; reports are flooding in via radios and walkie-talkies from the meteor crash sites and areas hit by Parazit[e]. Your mission is to listen to this chaos, find out what is happening where, and inform the team. You are our eyes and ears.",
  analyst: "Terminal Confirmed: Data Center. Welcome, Data Analyst. Raw information alone is useless. In front of you are the city's classified infrastructure directories. You must match the street names or codes coming from the Journalist with these directories to pinpoint Parazit[e]'s actual target in the system (which valve, which transformer). You are our brain.",
  executive: "Terminal Confirmed: Command Center. Welcome, Executive. Only you have the authority. When the Analyst gives you the targets, you must route power to the right locations, dispatch ambulances, and grant field clearance to the Engineer to fix the systems. One wrong approval will drag the city and Protocol:[e] into disaster. You are our leader.",
  engineer: "Terminal Confirmed: Field Operations. Welcome, Engineer. When clearance is granted, it's time to get your hands dirty. You will reconnect the wires severed by Parazit[e], equalize the corrupted pressure valves, and physically save the system. You cannot touch the systems until the Executive gives you clearance. You are our hands."
};

export default function BriefingPhase({ roomId }: BriefingPhaseProps) {
  const { session, currentPlayer, setBriefingReady, updateGameStatus } = useGameSession(roomId);
  const [currentStep, setCurrentStep] = useState<"phase1" | "isolating" | "phase2" | "transition">("phase1");
  const [isRedGlitch, setIsRedGlitch] = useState(false);

  const role = currentPlayer?.role || "engineer";
  
  // Phase 1 Typewriter
  const { displayedText: phase1Display, isComplete: phase1Complete } = useTypewriter(PHASE1_TEXT, 15, currentStep === "phase1");
  
  // Phase 2 Typewriter
  const { displayedText: phase2Display, isComplete: phase2Complete } = useTypewriter(ROLE_TEXTS[role], 20, currentStep === "phase2");

  useEffect(() => {
    if (phase1Complete && currentStep === "phase1") {
      const timer = setTimeout(() => {
        setCurrentStep("isolating");
        setTimeout(() => {
          setCurrentStep("phase2");
        }, 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase1Complete, currentStep]);

  useEffect(() => {
    if (session?.briefingReady) {
      const readyCount = Object.values(session.briefingReady).filter(Boolean).length;
      if (readyCount === 4 && !isRedGlitch) {
        setTimeout(() => {
          setIsRedGlitch(true);
          setTimeout(() => {
            if (currentPlayer?.isHost) {
              updateGameStatus("playing");
            }
          }, 1500);
        }, 0);
      }
    }
  }, [session?.briefingReady, currentPlayer?.isHost, updateGameStatus, isRedGlitch]);

  if (!session || !currentPlayer) return null;

  const isLocalReady = session.briefingReady?.[role.charAt(0).toUpperCase() + role.slice(1)] || false;

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-mono p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glitch Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="scanline" />
        <div className="noise" />
      </div>

      {/* Red Glitch Transition */}
      <AnimatePresence>
        {isRedGlitch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-red-600/30 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-900 animate-pulse mix-blend-overlay" />
            <div className="text-red-500 text-9xl font-black italic tracking-tighter scale-150 opacity-50 blur-sm">
              [SYSTEM_REBOOT]
            </div>
            <style jsx>{`
              .animate-pulse { animation: pulse 0.1s infinite; }
              @keyframes pulse {
                0% { opacity: 0.2; }
                50% { opacity: 0.8; }
                100% { opacity: 0.2; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl bg-[#030712] border border-[#00ffff]/30 p-10 rounded-lg shadow-[0_0_50px_rgba(0,255,255,0.1)] relative z-10 min-h-[500px] flex flex-col">
        <div className="flex items-center gap-3 mb-8 border-b border-[#00ffff]/20 pb-4">
          <Terminal className="w-6 h-6 animate-pulse" />
          <span className="text-sm tracking-widest uppercase opacity-70">Secure Uplink // ECO_AI_BRIEFING</span>
        </div>

        <div className="flex-grow space-y-6">
          {currentStep === "phase1" && (
            <div className="whitespace-pre-wrap leading-relaxed text-lg">
              {phase1Display}
              {!phase1Complete && <span className="animate-pulse ml-1 inline-block w-2 h-5 bg-[#00ffff]" />}
            </div>
          )}

          {currentStep === "isolating" && (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl font-black tracking-[0.3em] uppercase animate-pulse text-[#00ff9d]"
              >
                Isolating Connections...
              </motion.div>
            </div>
          )}

          {currentStep === "phase2" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="whitespace-pre-wrap leading-relaxed text-lg italic">
                {phase2Display}
                {!phase2Complete && <span className="animate-pulse ml-1 inline-block w-2 h-5 bg-[#00ffff]" />}
              </div>

              {phase2Complete && (
                <div className="pt-8 border-t border-[#00ffff]/10 flex flex-col items-center gap-6">
                  {isLocalReady ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#00ff9d] text-lg font-bold tracking-widest uppercase animate-pulse"
                    >
                      Waiting for other team members...
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBriefingReady(role, true)}
                      className="px-12 py-5 bg-[#00ffff] text-black font-black text-xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all"
                    >
                      [ Understood / Start Mission ]
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scanline {
          width: 100%;
          height: 2px;
          background: rgba(0, 255, 255, 0.1);
          position: absolute;
          animation: scan 4s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .noise {
          background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
          position: absolute;
          inset: 0;
          opacity: 0.05;
        }
      `}</style>
    </div>
  );
}
