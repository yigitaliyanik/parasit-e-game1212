"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface AudioContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  playSFX: (type: "click" | "typing" | "keypress") => void;
  stopSFX: (type: "click" | "typing" | "keypress") => void;
  setBGM: (play: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const typingRef = useRef<HTMLAudioElement | null>(null);
  const keypressRef = useRef<HTMLAudioElement | null>(null);

  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio elements on mount
  useEffect(() => {
    bgmRef.current = new Audio("/sounds/bgm.mp3");
    bgmRef.current.loop = false; // We'll handle looping manually for the crossfade/restart
    
    clickRef.current = new Audio("/sounds/click.mp3");
    typingRef.current = new Audio("/sounds/typing.mp3");
    typingRef.current.loop = true;
    
    keypressRef.current = new Audio("/sounds/typing.mp3"); // Using same file for keypress
    keypressRef.current.loop = false;

    const savedMute = localStorage.getItem("parasite_muted") === "true";
    const savedVol = localStorage.getItem("parasite_volume");
    setIsMuted(savedMute);
    if (savedVol) setVolumeState(parseFloat(savedVol));

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    // Global Keypress Sound for inputs
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        playSFX("keypress");
      }
    };
    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      bgmRef.current?.pause();
      typingRef.current?.pause();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, []);

  // Sync volumes
  useEffect(() => {
    const activeVol = isMuted ? 0 : volume;
    if (bgmRef.current) bgmRef.current.volume = activeVol * 0.4; // BGM is naturally loud
    if (clickRef.current) clickRef.current.volume = activeVol;
    if (typingRef.current) typingRef.current.volume = activeVol * 0.5;
    if (keypressRef.current) keypressRef.current.volume = activeVol * 0.3;
  }, [volume, isMuted]);

  // BGM Fade-Loop Logic
  useEffect(() => {
    if (!bgmRef.current) return;

    const checkFade = () => {
      if (!bgmRef.current || !bgmPlaying || isMuted) return;

      const audio = bgmRef.current;
      const duration = audio.duration;
      const currentTime = audio.currentTime;

      if (!duration || isNaN(duration)) return;

      // Restart/Loop Logic
      if (currentTime >= duration - 0.1) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }

      // Fade Out (last 3 seconds)
      if (duration - currentTime < 3) {
        const remaining = duration - currentTime;
        const fadeVol = (remaining / 3) * (volume * 0.4);
        audio.volume = Math.max(0, fadeVol);
      } 
      // Fade In (first 3 seconds)
      else if (currentTime < 3) {
        const fadeVol = (currentTime / 3) * (volume * 0.4);
        audio.volume = Math.max(0, fadeVol);
      } 
      // Normal volume
      else {
        audio.volume = volume * 0.4;
      }
    };

    const interval = setInterval(checkFade, 100);
    return () => clearInterval(interval);
  }, [bgmPlaying, isMuted, volume]);

  // Handle BGM playback
  useEffect(() => {
    if (!bgmRef.current || !hasInteracted) return;

    if (isMuted || !bgmPlaying) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch(() => {});
    }
  }, [isMuted, bgmPlaying, hasInteracted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem("parasite_muted", String(newState));
      return newState;
    });
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    localStorage.setItem("parasite_volume", String(v));
  };

  const playSFX = (type: "click" | "typing" | "keypress") => {
    if (isMuted) return;

    if (type === "click" && clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(() => {});
    } else if (type === "typing" && typingRef.current) {
      typingRef.current.play().catch(() => {});
    } else if (type === "keypress" && keypressRef.current) {
      keypressRef.current.currentTime = 0;
      // Randomize pitch/time slightly for keypress if possible? No, native Audio is limited.
      // We'll just play a short burst.
      keypressRef.current.play().catch(() => {});
      setTimeout(() => {
        if (keypressRef.current) {
          keypressRef.current.pause();
          keypressRef.current.currentTime = 0;
        }
      }, 50); // Very short burst
    }
  };

  const stopSFX = (type: "click" | "typing" | "keypress") => {
    if (type === "typing" && typingRef.current) {
      typingRef.current.pause();
      typingRef.current.currentTime = 0;
    }
  };

  const setBGM = (play: boolean) => {
    setBgmPlaying(play);
  };

  return (
    <AudioContext.Provider value={{ isMuted, volume, toggleMute, setVolume, playSFX, stopSFX, setBGM }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
