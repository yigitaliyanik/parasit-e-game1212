"use client";

import { useState, useEffect } from "react";
import { Mail, AlertCircle, Radio } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";

export default function JournalistPanel() {
  const [showIncoming, setShowIncoming] = useState(true);

  const rawMessage = "Hey... Is anyone there? I'm George, 25 years janitor at Central Hospital. Things are crazy here. Lights flickered, doors locked us in. I'm at the 2nd floor Newborn Unit, incubators are failing! 3rd floor Intensive Care (Life Support) is on battery, won't last long. 1st floor Emergency Room is totally dark, pure panic. 4th floor Adult Ward is stable for now. I left the maintenance port open for you. Access code: HOSPITAL-77. Hurry!";

  const { displayedText, isComplete } = useTypewriter(rawMessage, 30, !showIncoming);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIncoming(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col p-6 relative">
      <div className="flex items-center gap-3 mb-6 border-b border-amber-500/30 pb-4">
        <Radio className="w-6 h-6 text-amber-500" />
        <h2 className="text-xl font-black text-amber-500 uppercase tracking-widest">
          Secure Comms Link
        </h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative">
        {showIncoming ? (
          <div className="text-center animate-pulse">
            <Mail className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="font-mono text-amber-400 uppercase tracking-widest">
              Incoming Transmission...
            </p>
            <p className="font-mono text-xs text-slate-500 mt-2">
              Source: Internal Maintenance Network
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-black border border-amber-500/30 p-6 rounded relative">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500 -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500 translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500 -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500 translate-x-1 translate-y-1" />

            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="font-mono text-xs text-slate-400 uppercase">Sender: Janitor George</span>
            </div>

            <div className="font-mono text-amber-50 leading-relaxed min-h-[160px]">
              {displayedText}
              {!isComplete && <span className="animate-pulse inline-block w-2 h-4 bg-amber-500 ml-1 translate-y-1" />}
            </div>

            {isComplete && (
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="font-mono text-xs text-amber-500 uppercase tracking-widest animate-pulse">
                  Relay the access code and priorities to your team.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
