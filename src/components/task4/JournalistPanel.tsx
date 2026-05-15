"use client";

import { motion } from "framer-motion";
import { AlertOctagon, Video, RadioReceiver } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";

/**
 * Task4JournalistPanel Component
 * 
 * Implements the investigative layer for the Journalist in Mission 4.
 * 
 * Features:
 * - Intelligence Gathering: Receives intercepted manifestos about the train.
 * - Narrative Delivery: Uses a typewriter effect to simulate secure transmission decryption.
 * - Crucial Intel: Provides the 'ECORAIL' Train ID and specific wagon numbers (04, 08, 15)
 *   that need to be disconnected by the Engineer.
 */
export default function Task4JournalistPanel() {
  const alertText = "ALERT: EcoRail Train is heading to the City Center!\nINTERCEPTED MANIFESTO: The target Train ID is 'ECORAIL'.";
  const manifestText = "SECRET: Wagons 04, 08, and 15 have toxic acid. They must be disconnected!";

  const { displayedText: typedAlert } = useTypewriter(alertText, 30);
  const { displayedText: typedManifest } = useTypewriter(manifestText, 40);

  return (
    <div className="h-full flex flex-col relative bg-black/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-red-500/30">
        <div>
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
            <RadioReceiver className="w-8 h-8 animate-pulse" />
            Live Intel Feed
          </h2>
          <p className="text-red-400/60 font-mono text-sm mt-1 uppercase tracking-wider">
            Source: Metro Transit Authority (Compromised)
          </p>
        </div>
      </div>

      {/* Main Intel Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
        {/* CCTV Alert Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-red-500/50 p-6 rounded-lg relative overflow-hidden"
        >
          {/* Animated red pulse background */}
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-red-500 animate-pulse" />
              <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest">
                CCTV Intercept
              </h3>
            </div>
            
            <p className="font-mono text-lg text-red-100 leading-relaxed min-h-[80px]">
              {typedAlert}
              <span className="animate-pulse ml-1 inline-block w-2 h-5 bg-red-500 align-middle" />
            </p>
          </div>
        </motion.div>

        {/* Cargo Manifest Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 border border-amber-500/30 p-6 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="w-6 h-6 text-amber-500" />
            <h3 className="font-mono text-xs text-amber-500 uppercase tracking-widest">
              Classified Manifest
            </h3>
          </div>
          
          <p className="font-mono text-amber-100/90 leading-relaxed min-h-[60px]">
            {typedManifest}
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 bg-red-950/20 border-l-4 border-red-500 text-sm font-mono text-red-200"
        >
          <p className="mb-2 uppercase tracking-wider font-bold">
            Directive:
          </p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Relay Target Train ID to ANALYST for routing.</li>
            <li>Relay Toxic Wagon IDs to ENGINEER for manual decouple.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
