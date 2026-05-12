"use client";

import { Lock, FileText, Server } from "lucide-react";
import { motion } from "framer-motion";

interface AnalystPanelProps {
  executiveAccessGranted: boolean;
}

export default function AnalystPanel({ executiveAccessGranted }: AnalystPanelProps) {
  if (!executiveAccessGranted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">
          Firewall Active
        </h2>
        <p className="font-mono text-sm text-slate-600">
          Awaiting Executive override to access hospital schematics and mainframe credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 relative">
      <div className="flex items-center gap-3 mb-6 border-b border-green-500/30 pb-4">
        <FileText className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-black text-green-500 uppercase tracking-widest">
          Classified Data Archive
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        {/* Blueprint Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black border border-green-500/30 rounded p-6 relative flex flex-col"
        >
          <div className="absolute top-0 right-0 bg-green-500 text-black font-mono text-[10px] px-2 py-1 font-bold uppercase">
            Hospital Blueprint
          </div>
          
          <h3 className="font-mono text-sm text-green-400 uppercase tracking-widest mb-6 mt-2">
            Sector Mapping
          </h3>

          <div className="flex-grow flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-800 bg-slate-900/50 rounded">
              <span className="font-mono text-slate-400">Floor 4</span>
              <span className="font-mono text-green-500 font-bold tracking-wider">Adult Ward</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 bg-slate-900/50 rounded">
              <span className="font-mono text-slate-400">Floor 3</span>
              <span className="font-mono text-green-500 font-bold tracking-wider">Intensive Care</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 bg-slate-900/50 rounded">
              <span className="font-mono text-slate-400">Floor 2</span>
              <span className="font-mono text-green-500 font-bold tracking-wider">Newborn Unit</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 bg-slate-900/50 rounded">
              <span className="font-mono text-slate-400">Floor 1</span>
              <span className="font-mono text-green-500 font-bold tracking-wider">Emergency Room</span>
            </div>
          </div>
        </motion.div>

        {/* Mainframe Credentials */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black border border-green-500/30 rounded p-6 relative flex flex-col"
        >
          <div className="absolute top-0 right-0 bg-green-500 text-black font-mono text-[10px] px-2 py-1 font-bold uppercase">
            Top Secret
          </div>

          <h3 className="font-mono text-sm text-green-400 uppercase tracking-widest mb-6 mt-2 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Mainframe Access
          </h3>

          <div className="flex-grow flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <p className="font-mono text-slate-400 text-sm mb-2">Location:</p>
              <p className="font-mono text-lg text-slate-200">Sub-Level 3</p>
            </div>
            
            <div className="text-center p-6 border border-green-500/20 bg-green-500/5 rounded w-full">
              <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-3">
                Engineer Override Code
              </p>
              <p className="font-mono text-3xl font-black text-green-500 tracking-[0.2em]">
                ROOT-55
              </p>
            </div>

            <p className="font-mono text-[10px] text-green-500/60 uppercase tracking-widest text-center">
              Relay credentials to Engineer immediately.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
