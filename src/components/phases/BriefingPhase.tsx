"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import { useGameSession } from "@/hooks/useGameSession";
import { Role } from "@/lib/types";

interface BriefingPhaseProps {
  roomId: string;
}

export default function BriefingPhase({ roomId }: BriefingPhaseProps) {
  const { session, currentPlayer, setBriefingReady, startCountdownAlert } = useGameSession(roomId);
  const [currentStep, setCurrentStep] = useState<"phase1" | "isolating" | "phase2">("phase1");
  const [phase1Display, setPhase1Display] = useState("");
  const [phase2Display, setPhase2Display] = useState("");
  const [phase1Complete, setPhase1Complete] = useState(false);
  const [phase2Complete, setPhase2Complete] = useState(false);
  const [isRedGlitch, setIsRedGlitch] = useState(false);
  const [hasTriggeredCountdown, setHasTriggeredCountdown] = useState(false);

  const role = currentPlayer?.role as Role;
  const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  const isLocalReady = session?.briefingReady?.[capitalizedRole] || false;

  const phase1Text = `[ECO_AI_ASSISTANT_INIT]
LOCATION: ECOVILLE_CENTRAL_CORE
THREAT_LEVEL: OMEGA

"Greetings, Agents. I am the Eco AI Assistant. 
A catastrophic meteor strike has hit Ecoville, releasing 
an electromagnetic entity known as the Parasit[e]. 
The city is falling into chaos. I am isolating your 
channels to prepare you for the neutralization protocol."`;

  const phase2Texts: Record<Role, string> = {
    journalist: `Hi Agent, you are the Journalist. 

Your duty is to find the hidden stories and secrets that Parasit[e] is trying to bury. Use your curiosity to uncover the truth and share it with the team. Every piece of information is a weapon. The city's history is in your hands. 

Good luck!`,
    analyst: `Hi Agent, you are the Data Analyst. 

Your duty is to crack the encrypted codes and solve the mysteries that Parasit[e] has created. Your analysis will guide the entire team through the darkness. Work closely with your teammates and use your mind to find the truth. The city's digital safety is in your hands. 

Good luck!`,
    engineer: `Hi Agent, you are the Engineer. 

Your duty is to use your skills and intelligence to repair everything that Parasit[e] has broken across the city. You are the one who will physically save Ecoville. For areas you cannot access, stay in constant communication with the Executive; they can open the way for you. Your talent is our strength. 

Good luck!`,
    executive: `Hi Agent, you are the Executive. 

Your duty is to lead and coordinate the team's efforts. You have the authority to open locked paths and manage the mission's progress. Work with the Engineer to ensure every sector is secure. The future of Ecoville depends on your strategy. 

Good luck!`,
  };

  const typeText = useCallback(async (text: string, setter: (s: string) => void, onComplete: () => void) => {
    let current = "";
    for (let i = 0; i < text.length; i++) {
      current += text[i];
      setter(current);
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    }
    onComplete();
  }, []);

  useEffect(() => {
    if (currentStep === "phase1") {
      typeText(phase1Text, setPhase1Display, () => {
        setPhase1Complete(true);
        setTimeout(() => setCurrentStep("isolating"), 2000);
      });
    }
  }, [currentStep, phase1Text, typeText]);

  useEffect(() => {
    if (currentStep === "isolating") {
      setTimeout(() => {
        setIsRedGlitch(true);
        setTimeout(() => {
          setIsRedGlitch(false);
          setCurrentStep("phase2");
        }, 800);
      }, 1500);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === "phase2" && role) {
      typeText(phase2Texts[role], setPhase2Display, () => setPhase2Complete(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, role, typeText]);

  // Auto-trigger countdown when ALL 4 roles are ready
  useEffect(() => {
    if (!session || !currentPlayer?.isHost || hasTriggeredCountdown) return;
    const br = session.briefingReady;
    if (!br) return;
    const allReady = br["Journalist"] && br["Analyst"] && br["Engineer"] && br["Executive"];
    if (allReady) {
      setHasTriggeredCountdown(true);
      startCountdownAlert();
    }
  }, [session, currentPlayer?.isHost, hasTriggeredCountdown, startCountdownAlert]);

  if (!session || !currentPlayer) return null;

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Visual FX */}
      <div className="scanline" />
      <div className="noise-bg" />

      {/* Red Glitch Transition */}
      <AnimatePresence>
        {isRedGlitch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-red-600/30 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-900 animate-pulse-red mix-blend-overlay" />
            <div className="text-red-500 text-9xl font-black italic tracking-tighter scale-150 opacity-50 blur-sm">
              [SYSTEM_REBOOT]
            </div>
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
    </div>
  );
}
