import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'small' | 'default' | 'large' | 'xlarge';

type SwipeAction = 'archive' | 'delete' | 'mute' | 'pin';

interface SettingsContextData {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  glassIntensity: 'low' | 'medium' | 'high';
  setGlassIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  swipeLeftAction: SwipeAction;
  setSwipeLeftAction: (action: SwipeAction) => void;
  swipeRightAction: SwipeAction;
  setSwipeRightAction: (action: SwipeAction) => void;
  speakMessage: (text: string, sender: string) => void;
}

const SettingsContext = createContext<SettingsContextData | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>('default');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [glassIntensity, setGlassIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [swipeLeftAction, setSwipeLeftAction] = useState<SwipeAction>('archive');
  const [swipeRightAction, setSwipeRightAction] = useState<SwipeAction>('pin');

  // Load from system pref or local storage
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    // A real app would sync these to localStorage
  }, []);

  const speakMessage = (text: string, sender: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${sender} says: ${text}`);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <SettingsContext.Provider value={{
      textSize, setTextSize,
      reduceMotion, setReduceMotion,
      glassIntensity, setGlassIntensity,
      swipeLeftAction, setSwipeLeftAction,
      swipeRightAction, setSwipeRightAction,
      speakMessage
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
