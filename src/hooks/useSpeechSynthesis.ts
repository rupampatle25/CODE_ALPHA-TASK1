"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface SpeakOptions {
  text: string;
  langCode: string;
  side: "source" | "target" | "adapted";
  voiceURI?: string;
  rate?: number;
  pitch?: number;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speakingSide: "source" | "target" | "adapted" | null;
  speechError: string | null;
  clearError: () => void;
  voices: SpeechSynthesisVoice[];
  getVoicesForLanguage: (langCode: string) => SpeechSynthesisVoice[];
  speak: (options: SpeakOptions) => void;
  stop: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSide, setSpeakingSide] = useState<"source" | "target" | "adapted" | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Keep track of current utterance to prevent garbage collection issues in some browsers
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support and load initial voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();

      // Chrome and Edge populate voices asynchronously
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  // Filter voices that match a specific language code (e.g., 'es', 'fr', 'en', 'hi')
  const getVoicesForLanguage = useCallback(
    (langCode: string): SpeechSynthesisVoice[] => {
      if (!langCode || langCode === "auto") return [];
      const cleanLang = langCode.toLowerCase().split("-")[0];

      return voices.filter((voice) => {
        const voiceLang = voice.lang.toLowerCase().replace("_", "-");
        return voiceLang.startsWith(cleanLang);
      });
    },
    [voices]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingSide(null);
    currentUtteranceRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  const speak = useCallback(
    ({ text, langCode, side, voiceURI, rate = 1.0, pitch = 1.0 }: SpeakOptions) => {
      if (!isSupported || typeof window === "undefined" || !window.speechSynthesis) {
        setSpeechError("Speech synthesis is not supported in your browser.");
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        setSpeechError("There is no text to speak.");
        return;
      }

      // Stop any existing speech
      stop();
      setSpeechError(null);

      try {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        currentUtteranceRef.current = utterance;

        // Resolve language
        const actualLang = langCode === "auto" ? "en" : langCode;
        utterance.lang = actualLang;

        // Find selected voice or first matching language voice
        const matchingVoices = getVoicesForLanguage(actualLang);
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (voiceURI) {
          selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
        }

        if (!selectedVoice && matchingVoices.length > 0) {
          // Prefer default voice or local voice if available
          selectedVoice =
            matchingVoices.find((v) => v.default) ||
            matchingVoices.find((v) => v.localService) ||
            matchingVoices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          console.warn(
            `No installed speech voice found for language '${actualLang}'. Using browser default fallback.`
          );
        }

        utterance.rate = Math.max(0.5, Math.min(2.0, rate));
        utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeakingSide(side);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingSide(null);
          currentUtteranceRef.current = null;
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          // Ignored non-fatal cancellations caused by user clicking stop
          if (event.error === "canceled" || event.error === "interrupted") {
            setIsSpeaking(false);
            setSpeakingSide(null);
            currentUtteranceRef.current = null;
            return;
          }

          let friendlyMsg = `Audio error: ${event.error}`;
          if (event.error === "language-unavailable") {
            friendlyMsg = `The voice for '${actualLang}' is not installed on this device. You can install language speech packs in Windows/OS Settings.`;
          } else if (event.error === "not-allowed") {
            friendlyMsg = "Audio playback was blocked by your browser permissions. Click again to play.";
          } else if (event.error === "audio-busy") {
            friendlyMsg = "Audio system is currently busy. Please try again in a moment.";
          }

          setSpeechError(friendlyMsg);
          setIsSpeaking(false);
          setSpeakingSide(null);
          currentUtteranceRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        console.error("Speech synthesis invocation failed:", err);
        setSpeechError(err.message || "Failed to initialize speech audio.");
        setIsSpeaking(false);
        setSpeakingSide(null);
      }
    },
    [isSupported, voices, getVoicesForLanguage, stop]
  );

  return {
    isSupported,
    isSpeaking,
    speakingSide,
    speechError,
    clearError,
    voices,
    getVoicesForLanguage,
    speak,
    stop,
  };
}
