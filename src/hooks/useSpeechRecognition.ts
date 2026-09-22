"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Standard ISO to BCP-47 speech recognition locale mapping
const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  ur: "ur-PK",
  ar: "ar-SA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  tr: "tr-TR",
  vi: "vi-VN",
  th: "th-TH",
  nl: "nl-NL",
  pl: "pl-PL",
  sv: "sv-SE",
  id: "id-ID",
  el: "el-GR",
  he: "he-IL",
  cs: "cs-CZ",
  ro: "ro-RO",
};

export interface StartListeningOptions {
  langCode?: string;
  onTranscriptChange?: (interim: string, isFinal: boolean) => void;
  onFinalTranscript?: (finalText: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  finalTranscript: string;
  recognitionError: string | null;
  startListening: (options?: StartListeningOptions) => void;
  stopListening: () => void;
  clearError: () => void;
  clearTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef<((finalText: string) => void) | undefined>(undefined);
  const onChangeRef = useRef<((interim: string, isFinal: boolean) => void) | undefined>(undefined);

  // Check browser support on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Recognition might already be stopped
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const clearError = useCallback(() => {
    setRecognitionError(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setInterimTranscript("");
    setFinalTranscript("");
  }, []);

  const startListening = useCallback(
    ({ langCode = "en", onTranscriptChange, onFinalTranscript }: StartListeningOptions = {}) => {
      if (typeof window === "undefined") return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setRecognitionError(
          "Voice-to-Text is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari."
        );
        return;
      }

      // Stop any existing instance
      stopListening();
      setRecognitionError(null);
      setInterimTranscript("");

      onFinalRef.current = onFinalTranscript;
      onChangeRef.current = onTranscriptChange;

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Configure recognition options
        recognition.continuous = false; // single utterance or short dictation
        recognition.interimResults = true; // live feedback while speaking
        recognition.maxAlternatives = 1;

        // Resolve BCP-47 locale
        const cleanCode = langCode.toLowerCase().split("-")[0];
        const locale = LANGUAGE_LOCALE_MAP[cleanCode] || (langCode === "auto" ? "en-US" : langCode);
        recognition.lang = locale;

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let currentFinal = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += transcriptChunk;
            } else {
              currentInterim += transcriptChunk;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
            onChangeRef.current?.(currentInterim, false);
          }

          if (currentFinal) {
            setFinalTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
            setInterimTranscript("");
            onChangeRef.current?.(currentFinal, true);
            onFinalRef.current?.(currentFinal);
          }
        };

        recognition.onerror = (event: any) => {
          // Ignored user aborts
          if (event.error === "aborted") {
            setIsListening(false);
            setInterimTranscript("");
            return;
          }

          let friendlyMessage = `Speech recognition error: ${event.error}`;

          if (event.error === "not-allowed" || event.error === "permission-denied") {
            friendlyMessage =
              "Microphone permission was denied. Please click the lock or camera/mic icon in your browser address bar and allow microphone access.";
          } else if (event.error === "no-speech") {
            friendlyMessage =
              "No speech detected. Please make sure your microphone is unmuted and speak clearly.";
          } else if (event.error === "audio-capture") {
            friendlyMessage =
              "No microphone was found on your system. Please verify that a microphone is plugged in and recognized by your OS.";
          } else if (event.error === "network") {
            friendlyMessage =
              "Network connection error during voice recognition. Please check your internet connection.";
          }

          setRecognitionError(friendlyMessage);
          setIsListening(false);
          setInterimTranscript("");
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognition.start();
      } catch (err: any) {
        console.error("SpeechRecognition.start() error:", err);
        setRecognitionError(
          err.message || "Failed to initialize microphone. Please check your browser permissions."
        );
        setIsListening(false);
      }
    },
    [stopListening]
  );

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    recognitionError,
    startListening,
    stopListening,
    clearError,
    clearTranscript,
  };
}
