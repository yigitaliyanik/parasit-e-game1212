"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RadioReceiver, AlertCircle } from "lucide-react";

export default function JournalistPanel() {
  const [activeTab, setActiveTab] = useState(0);

  const transcripts = [
    {
      time: "02:14 AM",
      text: "Hey, what's happening? The water pressure is dropping fast!"
    },
    {
      time: "02:22 AM",
      text: "The automated system is completely down! We need someone to manually balance the valves right now, or the pipes will burst!"
    },
    {
      time: "02:45 AM",
      text: "Tell the Engineer to get to the main valve array quickly!"
    }
  ];

  return (
    <div className="h-full flex flex-col relative z-10 text-slate-200">
      <div className="mb-6 flex items-center justify-between border-b border-amber-500/30 pb-4">
        <div>
          <h2 className="text-2xl font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <RadioReceiver className="w-6 h-6" />
            VHF Radio Intercepts
          </h2>
          <p className="text-amber-400/60 font-mono text-sm mt-1">
            Analyzing encrypted local frequencies...
          </p>
        </div>
      </div>

      <div className="flex-grow flex gap-6">
        <div className="w-1/3 flex flex-col gap-2">
          {transcripts.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`p-4 text-left border rounded transition-all ${
                activeTab === idx
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-slate-800 bg-black hover:border-amber-400/30"
              }`}
            >
              <span className="font-mono text-xs text-amber-400/50 block mb-1">
                TIMESTAMP {t.time}
              </span>
              <span className="font-mono text-sm truncate block">
                Intercept #{idx + 1}
              </span>
            </button>
          ))}
        </div>

        <div className="w-2/3 bg-black border border-slate-800 rounded p-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">
              Decrypted Audio Transcript
            </span>
          </div>
          <div className="font-mono text-lg leading-relaxed text-amber-100">
            {transcripts[activeTab].text}
          </div>
        </div>
      </div>
    </div>
  );
}
