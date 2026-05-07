"use client";
import { useState, useEffect } from "react";

export function useTypewriter(text: string, speed: number = 20, active: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!active) {
      setTimeout(() => {
        setDisplayedText("");
        setIsComplete(false);
      }, 0);
      return;
    }
    
    // Reset state for new text
    setTimeout(() => {
      setDisplayedText("");
      setIsComplete(false);
    }, 0);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, active]);

  return { displayedText, isComplete };
}
