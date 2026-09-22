"use client";

import React, { useState, useMemo } from "react";
import { SOURCE_LANGUAGES, SUPPORTED_LANGUAGES, getLanguageName } from "@/services/translation/languages";
import { LanguageSelector } from "./LanguageSelector";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { ToneType, TONE_METADATA } from "@/services/ai/toneAdapter";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Square,
  Mic,
  MicOff,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  X,
  VolumeX,
  Radio,
  ShieldCheck,
  Shield,
  Smile,
  Briefcase,
  Wand2,
  RefreshCw,
  Info,
} from "lucide-react";

type ToneSelection = "none" | ToneType;

export const TranslationWorkspace: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLang, setDetectedLang] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // AI Tone Selection & Adaptation State
  const [selectedTone, setSelectedTone] = useState<ToneSelection>("none");
  const [adaptedText, setAdaptedText] = useState<string>("");
  const [adaptedExplanation, setAdaptedExplanation] = useState<string>("");
  const [isAdaptingTone, setIsAdaptingTone] = useState<boolean>(false);
  const [toneError, setToneError] = useState<string | null>(null);
  const [adaptedCopied, setAdaptedCopied] = useState<boolean>(false);

  // Audio configuration state
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [sourceVoiceURI, setSourceVoiceURI] = useState<string>("");
  const [targetVoiceURI, setTargetVoiceURI] = useState<string>("");
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);

  // Custom Speech Synthesis hook (Text-to-Speech)
  const {
    isSupported: isTTSSupported,
    isSpeaking,
    speakingSide,
    speechError,
    clearError: clearTTSError,
    getVoicesForLanguage,
    speak,
    stop: stopTTS,
  } = useSpeechSynthesis();

  // Custom Speech Recognition hook (Voice-to-Text)
  const {
    isSupported: isSTTSupported,
    isListening,
    interimTranscript,
    recognitionError,
    startListening,
    stopListening,
    clearError: clearSTTError,
  } = useSpeechRecognition();

  // Compute active language code
  const activeSourceLangCode = sourceLang === "auto" ? (detectedLang || "en") : sourceLang;

  // Filter voices matching current languages
  const sourceVoices = useMemo(() => getVoicesForLanguage(activeSourceLangCode), [
    getVoicesForLanguage,
    activeSourceLangCode,
  ]);

  const targetVoices = useMemo(() => getVoicesForLanguage(targetLang), [
    getVoicesForLanguage,
    targetLang,
  ]);

  // AI Tone Adaptation Handler
  const handleAdaptTone = async (toneToApply: ToneType, baseText?: string) => {
    const textToAdapt = (baseText !== undefined ? baseText : translatedText) || sourceText;
    const cleanText = textToAdapt.trim();

    if (!cleanText) {
      setToneError("Please translate text first before adapting its tone.");
      return;
    }

    setIsAdaptingTone(true);
    setToneError(null);

    try {
      const response = await fetch("/api/ai/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          tone: toneToApply,
          targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to adapt tone.");
      }

      setAdaptedText(data.data.adaptedText);
      setAdaptedExplanation(data.data.explanation || "");
    } catch (err: any) {
      setToneError(err.message || "An error occurred during AI tone adaptation.");
    } finally {
      setIsAdaptingTone(false);
    }
  };

  // Tone Selection Click Handler
  const onSelectTone = (tone: ToneSelection) => {
    setSelectedTone(tone);
    if (tone === "none") {
      setAdaptedText("");
      setAdaptedExplanation("");
      setToneError(null);
    } else {
      if (translatedText.trim() || sourceText.trim()) {
        handleAdaptTone(tone);
      }
    }
  };

  // Translate handler
  const handleTranslate = async (textToTranslate = sourceText) => {
    const text = textToTranslate.trim();
    if (!text) {
      setTranslatedText("");
      setAdaptedText("");
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Translation request failed.");
      }

      const newTranslated = data.data.translatedText;
      setTranslatedText(newTranslated);
      setDetectedLang(data.data.detectedSourceLanguage || "");
      setProvider(data.data.provider || "");

      // If a tone is already selected, adapt the new translated text automatically
      if (selectedTone !== "none") {
        handleAdaptTone(selectedTone, newTranslated);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to translate text. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  // Swap source and target languages
  const handleSwap = () => {
    stopTTS();
    stopListening();
    if (sourceLang === "auto") {
      setSourceLang(targetLang);
      setTargetLang(detectedLang && detectedLang !== "auto" ? detectedLang : "en");
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }

    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
    setAdaptedText("");
    setAdaptedExplanation("");
  };

  // Copy direct translation
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy translation:", err);
    }
  };

  // Copy AI adapted text
  const handleCopyAdapted = async () => {
    if (!adaptedText) return;
    try {
      await navigator.clipboard.writeText(adaptedText);
      setAdaptedCopied(true);
      setTimeout(() => setAdaptedCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy adapted text:", err);
    }
  };

  // Clear text
  const handleClear = () => {
    stopTTS();
    stopListening();
    setSourceText("");
    setTranslatedText("");
    setAdaptedText("");
    setAdaptedExplanation("");
    setErrorMessage(null);
    setToneError(null);
    setDetectedLang("");
  };

  // Download direct translation as .txt
  const handleDownload = () => {
    if (!translatedText) return;
    const element = document.createElement("a");
    const file = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `lingoflow_direct_${targetLang}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download AI adapted text as .txt
  const handleDownloadAdapted = () => {
    if (!adaptedText) return;
    const element = document.createElement("a");
    const file = new Blob([adaptedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `lingoflow_adapted_${selectedTone}_${targetLang}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Play / Stop toggle for Source Text (TTS)
  const toggleSourceSpeech = () => {
    if (isSpeaking && speakingSide === "source") {
      stopTTS();
    } else {
      speak({
        text: sourceText,
        langCode: activeSourceLangCode,
        side: "source",
        voiceURI: sourceVoiceURI,
        rate: playbackRate,
      });
    }
  };

  // Play / Stop toggle for Translated Text (TTS)
  const toggleTargetSpeech = () => {
    if (isSpeaking && speakingSide === "target") {
      stopTTS();
    } else {
      speak({
        text: translatedText,
        langCode: targetLang,
        side: "target",
        voiceURI: targetVoiceURI,
        rate: playbackRate,
      });
    }
  };

  // Play / Stop toggle for AI Adapted Text (TTS)
  const toggleAdaptedSpeech = () => {
    if (isSpeaking && speakingSide === "adapted") {
      stopTTS();
    } else {
      speak({
        text: adaptedText,
        langCode: targetLang,
        side: "adapted",
        voiceURI: targetVoiceURI,
        rate: playbackRate,
      });
    }
  };

  // Microphone Voice-to-Text Toggle
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopTTS();
      startListening({
        langCode: activeSourceLangCode,
        onFinalTranscript: (spokenText) => {
          setSourceText((prev) => {
            const nextText = prev ? `${prev.trim()} ${spokenText.trim()}` : spokenText.trim();
            return nextText;
          });
        },
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Top Language & Settings Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <LanguageSelector
            label="From"
            languages={SOURCE_LANGUAGES}
            value={sourceLang}
            onChange={(code) => {
              stopTTS();
              stopListening();
              setSourceLang(code);
              if (sourceText.trim()) handleTranslate(sourceText);
            }}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={handleSwap}
            disabled={isLoading}
            title="Swap Languages"
            aria-label="Swap Languages"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <LanguageSelector
            label="To"
            languages={SUPPORTED_LANGUAGES}
            value={targetLang}
            onChange={(code) => {
              stopTTS();
              stopListening();
              setTargetLang(code);
              if (sourceText.trim()) handleTranslate(sourceText);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Audio Configuration Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAudioSettings(!showAudioSettings)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showAudioSettings
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
            }`}
            title="Speech and voice settings"
            aria-expanded={showAudioSettings}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Audio Voices</span>
          </button>
        </div>
      </div>

      {/* Voice Speed & Selection Tray */}
      {showAudioSettings && (
        <div className="bg-blue-50/40 dark:bg-slate-800/60 border-b border-blue-100 dark:border-slate-700/80 px-4 py-3 sm:px-6 text-xs transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Playback Speed Slider */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Speed:</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600 cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 w-8">{playbackRate.toFixed(1)}x</span>
              </div>

              {/* Source Voice Dropdown */}
              {sourceVoices.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Input Voice:</span>
                  <select
                    value={sourceVoiceURI}
                    onChange={(e) => setSourceVoiceURI(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 max-w-[140px] truncate"
                  >
                    <option value="">Default Voice</option>
                    {sourceVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Voice Dropdown */}
              {targetVoices.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Output Voice:</span>
                  <select
                    value={targetVoiceURI}
                    onChange={(e) => setTargetVoiceURI(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 max-w-[140px] truncate"
                  >
                    <option value="">Default Voice</option>
                    {targetVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Audio processed client-side (Zero audio stored)
              </span>

              <button
                type="button"
                onClick={() => setShowAudioSettings(false)}
                className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isTTSSupported && (
            <div className="mt-2 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
              <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Web Speech Synthesis is not supported in this browser.</span>
            </div>
          )}
        </div>
      )}

      {/* AI Tone Selection & Adaptation Bar */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Tone Selection
                </span>
                <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  Optional Adaptation
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose a tone to rewrite translated content without altering the core meaning.
              </p>
            </div>
          </div>

          {/* Tone Selector Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectTone("none")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTone === "none"
                  ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
              }`}
            >
              Direct (Off)
            </button>

            <button
              type="button"
              onClick={() => onSelectTone("formal")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTone === "formal"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Formal</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTone("casual")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTone === "casual"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              <Smile className="w-3 h-3" />
              <span>Casual</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTone("professional")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTone === "professional"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Professional</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTone("simple")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTone === "simple"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Simple</span>
            </button>
          </div>
        </div>
      </div>

      {/* Speech Recognition Error Banner */}
      {recognitionError && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-4 py-2.5 text-xs text-red-800 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{recognitionError}</span>
          </div>
          <button
            type="button"
            onClick={clearSTTError}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 font-bold ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Speech Synthesis Error Banner */}
      {speechError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={clearTTSError}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Translation Panels: Input & Direct Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[320px]">
        {/* Source Text Panel */}
        <div className="flex flex-col p-4 sm:p-6 bg-white dark:bg-slate-900 relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {sourceLang === "auto"
                  ? detectedLang
                    ? `Detected: ${getLanguageName(detectedLang)}`
                    : "Detecting..."
                  : getLanguageName(sourceLang)}
              </span>

              {/* Live Listening Indicator Badge */}
              {isListening && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  Recording... Speak in {getLanguageName(activeSourceLangCode)}
                </span>
              )}
            </div>

            {sourceText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Text Area with Live Dictation Preview */}
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder={
                isListening
                  ? "Listening to your voice... Speak now."
                  : "Type, paste text, or click the microphone to speak..."
              }
              maxLength={5000}
              className="w-full flex-1 resize-none border-0 p-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none focus:ring-0 text-base leading-relaxed"
            />

            {/* Interim Speech Transcript Preview */}
            {isListening && interimTranscript && (
              <div className="mt-1 p-2 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 italic animate-fade-in flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse flex-shrink-0" />
                <span>Hearing: &quot;{interimTranscript}&quot;</span>
              </div>
            )}
          </div>

          {/* Source Panel Bottom Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Voice-to-Text Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={!isSTTSupported}
                title={
                  isListening
                    ? "Stop voice recording (Listening...)"
                    : "Speak with microphone (Voice Input)"
                }
                aria-label={
                  isListening ? "Stop voice recording" : "Speak with microphone"
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isListening
                    ? "bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse hover:bg-red-700"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Voice Input</span>
                  </>
                )}
              </button>

              {/* Text-to-Speech Play / Stop Button for Source */}
              <button
                type="button"
                onClick={toggleSourceSpeech}
                disabled={!sourceText.trim() || !isTTSSupported}
                title={
                  isSpeaking && speakingSide === "source"
                    ? "Stop speaking original text"
                    : "Listen to pronunciation (Play)"
                }
                aria-label={
                  isSpeaking && speakingSide === "source"
                    ? "Stop audio playback"
                    : "Listen to pronunciation"
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSpeaking && speakingSide === "source"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse hover:bg-red-100"
                    : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
                }`}
              >
                {isSpeaking && speakingSide === "source" ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-red-600 dark:text-red-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${
                  sourceText.length > 4500 ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {sourceText.length.toLocaleString()} / 5,000
              </span>

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Translated Text Panel: DIRECT TRANSLATION */}
        <div className="flex flex-col p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {getLanguageName(targetLang)}
              </span>
              <span className="text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                Direct Translation
              </span>
            </div>

            {translatedText && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {translatedText.length.toLocaleString()} chars
              </span>
            )}
          </div>

          <div className="w-full flex-1 text-slate-800 dark:text-slate-100 text-base leading-relaxed overflow-y-auto max-h-[260px] whitespace-pre-wrap select-text">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Converting across languages...</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 dark:text-slate-500 select-none">
                Translation will appear here instantly...
              </span>
            )}
          </div>

          {/* Direct Output Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Play / Stop Button for Direct Translation */}
              <button
                type="button"
                onClick={toggleTargetSpeech}
                disabled={!translatedText || !isTTSSupported}
                title={
                  isSpeaking && speakingSide === "target"
                    ? "Stop speaking translation"
                    : "Listen to direct translation (Play)"
                }
                aria-label="Listen to direct translation"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSpeaking && speakingSide === "target"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse hover:bg-red-100"
                    : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
                }`}
              >
                {isSpeaking && speakingSide === "target" ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-red-600 dark:text-red-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {/* Copy Translation Button */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                title="Copy direct translation"
                aria-label="Copy direct translation"
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors relative"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Download File Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!translatedText}
                title="Download direct translation (.txt)"
                aria-label="Download direct translation (.txt)"
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {copied && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                Copied translation!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DISTINCT AI TONE ADAPTATION PANEL (Rendered when Tone is Selected) */}
      {selectedTone !== "none" && (
        <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/60 p-4 sm:p-6 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${TONE_METADATA[selectedTone].badgeColor}`}>
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Rewriting: {TONE_METADATA[selectedTone].label} Tone</span>
              </span>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                (Stylistically adapted &mdash; not a literal word-for-word translation)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {adaptedText && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {adaptedText.length.toLocaleString()} chars
                </span>
              )}

              <button
                type="button"
                onClick={() => handleAdaptTone(selectedTone)}
                disabled={isAdaptingTone || (!translatedText.trim() && !sourceText.trim())}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isAdaptingTone ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rewriting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-adapt Tone</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tone Explanation / Context Card */}
          {adaptedExplanation && (
            <div className="mb-3 px-3.5 py-2 rounded-xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>{adaptedExplanation}</span>
            </div>
          )}

          {/* Adapted Text Output Container */}
          <div className="min-h-[100px] p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-base leading-relaxed select-text whitespace-pre-wrap">
            {isAdaptingTone ? (
              <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Applying {TONE_METADATA[selectedTone].label} linguistic styling...</span>
              </div>
            ) : adaptedText ? (
              adaptedText
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-sm">
                Click &quot;Re-adapt Tone&quot; or translate text above to generate a {TONE_METADATA[selectedTone].label.toLowerCase()}-styled version.
              </span>
            )}
          </div>

          {/* Adapted Text Actions Toolbar */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play / Stop Button for AI Adapted Text */}
              <button
                type="button"
                onClick={toggleAdaptedSpeech}
                disabled={!adaptedText || !isTTSSupported}
                title={
                  isSpeaking && speakingSide === "adapted"
                    ? "Stop speaking adapted text"
                    : "Listen to adapted speech audio (Play)"
                }
                aria-label="Listen to adapted text audio"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSpeaking && speakingSide === "adapted"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse hover:bg-red-100"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                }`}
              >
                {isSpeaking && speakingSide === "adapted" ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-red-600 dark:text-red-400" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Listen Adapted</span>
                  </>
                )}
              </button>

              {/* Copy Adapted Text */}
              <button
                type="button"
                onClick={handleCopyAdapted}
                disabled={!adaptedText}
                title="Copy AI adapted text"
                aria-label="Copy AI adapted text"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                {adaptedCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Adapted</span>
                  </>
                )}
              </button>

              {/* Download Adapted Text */}
              <button
                type="button"
                onClick={handleDownloadAdapted}
                disabled={!adaptedText}
                title="Download adapted text (.txt)"
                aria-label="Download adapted text (.txt)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>

            {adaptedCopied && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                Adapted text copied to clipboard!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tone Error Alert */}
      {toneError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 p-3.5 flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{toneError}</span>
          </div>
          <button
            type="button"
            onClick={() => setToneError(null)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Translation API Error Alert Box */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900 p-4 flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-semibold">Error: </span>
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => handleTranslate()}
            className="text-xs font-semibold text-red-700 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
