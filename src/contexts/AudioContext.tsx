"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSFX: (type: "click" | "typing") => void;
  stopSFX: (type: "click" | "typing") => void;
  setBGM: (play: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const typingRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements on mount
  useEffect(() => {
    bgmRef.current = new Audio("/sounds/bgm.mp3");
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4;

    clickRef.current = new Audio("/sounds/click.mp3");
    clickRef.current.volume = 0.5;

    typingRef.current = new Audio("/sounds/typing.mp3");
    typingRef.current.loop = true;
    typingRef.current.volume = 0.3;

    // Load muted state from localStorage
    const savedMute = localStorage.getItem("parasite_muted") === "true";
    setIsMuted(savedMute);

    return () => {
      bgmRef.current?.pause();
      typingRef.current?.pause();
    };
  }, []);

  // Handle BGM playback based on muted state and bgmPlaying state
  useEffect(() => {
    if (!bgmRef.current) return;

    if (isMuted || !bgmPlaying) {
      bgmRef.current.pause();
    } else {
      // Browser autoplay policy: we try to play, but it might fail if no user interaction
      bgmRef.current.play().catch(() => {
        console.log("Autoplay prevented. BGM will start after user interaction.");
      });
    }
  }, [isMuted, bgmPlaying]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem("parasite_muted", String(newState));
      return newState;
    });
  };

  const playSFX = (type: "click" | "typing") => {
    if (isMuted) return;

    if (type === "click" && clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(() => {});
    } else if (type === "typing" && typingRef.current) {
      typingRef.current.play().catch(() => {});
    }
  };

  const stopSFX = (type: "click" | "typing") => {
    if (type === "typing" && typingRef.current) {
      typingRef.current.pause();
      typingRef.current.currentTime = 0;
    }
  };

  const setBGM = (play: boolean) => {
    setBgmPlaying(play);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSFX, stopSFX, setBGM }}>
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
