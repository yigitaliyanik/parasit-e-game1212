"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitMerge, Settings2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Task4ExecutivePanelProps {
  routeChanged: boolean;
  onUpdateRoute: () => void;
}

export default function Task4ExecutivePanel({ routeChanged, onUpdateRoute }: Task4ExecutivePanelProps) {
  const [nodeA, setNodeA] = useState<"LEFT" | "RIGHT">("RIGHT");
  const [nodeB, setNodeB] = useState<"LEFT" | "RIGHT">("LEFT");
  const [nodeC, setNodeC] = useState<"LEFT" | "RIGHT">("LEFT");
  const [errorMsg, setErrorMsg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = () => {
    setIsProcessing(true);
    setErrorMsg(false);

    setTimeout(() => {
      setIsProcessing(false);
      // Correct combination: A = LEFT, B = Any, C = RIGHT
      if (nodeA === "LEFT" && nodeC === "RIGHT") {
        onUpdateRoute();
      } else {
        setErrorMsg(true);
      }
    }, 1500);
  };

  if (routeChanged) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <CheckCircle2 className="w-20 h-20 text-fuchsia-400 mb-6" />
        <h2 className="text-2xl font-black text-fuchsia-400 uppercase tracking-widest mb-4">
          Route Diverted
        </h2>
        <p className="font-mono text-fuchsia-100/80 mb-6 max-w-md">
          Route Diverted! Tell Engineer to detach wagons!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-black/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-fuchsia-500/30">
        <div>
          <h2 className="text-2xl font-black text-fuchsia-500 uppercase tracking-widest flex items-center gap-3">
            <GitMerge className="w-8 h-8" />
            Switch Control Panel
          </h2>
          <p className="text-fuchsia-400/60 font-mono text-sm mt-1 uppercase tracking-wider">
            Active Target: ECORAIL
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
        
        {/* Switch Controls */}
        <div className="bg-black/40 border border-fuchsia-500/30 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fuchsia-500/20">
            <Settings2 className="w-5 h-5 text-fuchsia-400" />
            <h3 className="font-mono text-fuchsia-400 uppercase tracking-widest font-bold">
              Track Junctions
            </h3>
          </div>

          <div className="space-y-6">
            {/* Node A */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-fuchsia-100 uppercase tracking-wider">SWITCH A</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setNodeA("LEFT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeA === "LEFT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  LEFT
                </button>
                <button
                  onClick={() => setNodeA("RIGHT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeA === "RIGHT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  RIGHT
                </button>
              </div>
            </div>

            {/* Node B */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-fuchsia-100 uppercase tracking-wider">SWITCH B</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setNodeB("LEFT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeB === "LEFT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  LEFT
                </button>
                <button
                  onClick={() => setNodeB("RIGHT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeB === "RIGHT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  RIGHT
                </button>
              </div>
            </div>

            {/* Node C */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-fuchsia-100 uppercase tracking-wider">SWITCH C</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setNodeC("LEFT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeC === "LEFT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  LEFT
                </button>
                <button
                  onClick={() => setNodeC("RIGHT")}
                  className={`px-4 py-2 font-mono text-sm font-bold rounded transition-colors ${
                    nodeC === "RIGHT" ? "bg-fuchsia-500 text-black" : "bg-black border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
                  }`}
                >
                  RIGHT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Errors */}
        <div className="text-center">
          <button
            onClick={handleUpdate}
            disabled={isProcessing}
            className="w-full bg-fuchsia-500/10 border border-fuchsia-500 text-fuchsia-400 px-6 py-4 rounded font-mono uppercase tracking-widest font-bold hover:bg-fuchsia-500/20 disabled:opacity-50 transition-all"
          >
            {isProcessing ? "Updating Grid..." : "Update Route"}
          </button>
          
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-red-500 mt-4 animate-pulse uppercase font-bold"
            >
              ERROR: TRAIN STILL HEADING TO CITY.
            </motion.p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-fuchsia-950/20 border-l-4 border-fuchsia-500 text-sm font-mono text-fuchsia-200">
          <p className="uppercase tracking-wider font-bold">
            Directive:
          </p>
          <p className="opacity-80 mt-1">
            Await routing instructions from ANALYST to configure junction nodes correctly.
          </p>
        </div>

      </div>
    </div>
  );
}
