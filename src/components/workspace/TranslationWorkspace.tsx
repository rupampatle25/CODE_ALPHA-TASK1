"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SOURCE_LANGUAGES, SUPPORTED_LANGUAGES, getLanguageName } from "@/services/translation/languages";
import { LanguageSelector } from "./LanguageSelector";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
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
} from "lucide-react";

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

  // Translate handler
  const handleTranslate = async (textToTranslate = sourceText) => {
    const text = textToTranslate.trim();
    if (!text) {
      setTranslatedText("");
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

      setTranslatedText(data.data.translatedText);
      setDetectedLang(data.data.detectedSourceLanguage || "");
      setProvider(data.data.provider || "");
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
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Clear text
  const handleClear = () => {
    stopTTS();
    stopListening();
    setSourceText("");
    setTranslatedText("");
    setErrorMessage(null);
    setDetectedLang("");
  };

  // Download translated text as .txt
  const handleDownload = () => {
    if (!translatedText) return;
    const element = document.createElement("a");
    const file = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `lingoflow_translation_${targetLang}.txt`;
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

  // Microphone Voice-to-Text Toggle
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // Stop speech playback if currently talking
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
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all">
      {/* Top Language & Settings Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
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
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <LanguageSelector
            label="To"
            languages={SUPPORTED_LANGUAGES}
            value={targetLang}
            onChange={(code) => {
              stopTTS();
              setTargetLang(code);
              if (sourceText.trim()) handleTranslate(sourceText);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Status Indicator & Voice Settings Toggle */}
        <div className="flex items-center gap-2">
          {provider && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
              {provider}
            </span>
          )}

          {/* Audio Settings Dropdown Toggle */}
          <button
            type="button"
            onClick={() => setShowAudioSettings(!showAudioSettings)}
            title="Voice and Audio Settings"
            aria-label="Voice and Audio Settings"
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showAudioSettings
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audio Settings</span>
          </button>
        </div>
      </div>

      {/* Expandable Audio Settings Panel */}
      {showAudioSettings && (
        <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-3 sm:px-6 animate-fade-in text-xs text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Playback Speed Selector */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">TTS Speed:</span>
                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                  {[0.75, 1.0, 1.25].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                        playbackRate === rate
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {rate === 1.0 ? "1x" : `${rate}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Voice Selector */}
              {sourceVoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    {getLanguageName(activeSourceLangCode)} Voice:
                  </span>
                  <select
                    value={sourceVoiceURI}
                    onChange={(e) => setSourceVoiceURI(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded px-2 py-1 max-w-[180px] truncate"
                  >
                    <option value="">Default Voice</option>
                    {sourceVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Voice Selector */}
              {targetVoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    {getLanguageName(targetLang)} Voice:
                  </span>
                  <select
                    value={targetVoiceURI}
                    onChange={(e) => setTargetVoiceURI(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded px-2 py-1 max-w-[180px] truncate"
                  >
                    <option value="">Default Voice</option>
                    {targetVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Audio processed client-side (Zero audio stored)
              </span>

              <button
                type="button"
                onClick={() => setShowAudioSettings(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isTTSSupported && (
            <div className="mt-2 text-amber-700 flex items-center gap-1.5 font-medium">
              <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Web Speech Synthesis is not supported in this browser.</span>
            </div>
          )}
        </div>
      )}

      {/* Speech Recognition Error Banner */}
      {recognitionError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{recognitionError}</span>
          </div>
          <button
            type="button"
            onClick={clearSTTError}
            className="text-red-700 hover:text-red-900 font-bold ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Speech Synthesis Error Banner */}
      {speechError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={clearTTSError}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Panels: Input & Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[340px]">
        {/* Source Text Panel */}
        <div className="flex flex-col p-4 sm:p-6 bg-white relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {sourceLang === "auto"
                  ? detectedLang
                    ? `Detected: ${getLanguageName(detectedLang)}`
                    : "Detecting..."
                  : getLanguageName(sourceLang)}
              </span>

              {/* Live Listening Indicator Badge */}
              {isListening && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  Recording... Speak in {getLanguageName(activeSourceLangCode)}
                </span>
              )}
            </div>

            {sourceText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
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
              className="w-full flex-1 resize-none border-0 p-0 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 text-base leading-relaxed"
            />

            {/* Interim Speech Transcript Preview */}
            {isListening && interimTranscript && (
              <div className="mt-1 p-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 italic animate-fade-in flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse flex-shrink-0" />
                <span>Hearing: &quot;{interimTranscript}&quot;</span>
              </div>
            )}
          </div>

          {/* Source Panel Bottom Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
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
                    : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 disabled:opacity-40"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-blue-600" />
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
                    ? "bg-red-50 text-red-700 border border-red-200 animate-pulse hover:bg-red-100"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                }`}
              >
                {isSpeaking && speakingSide === "source" ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-red-600" />
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
                  sourceText.length > 4500 ? "text-amber-600 font-semibold" : "text-slate-400"
                }`}
              >
                {sourceText.length.toLocaleString()} / 5,000
              </span>

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={isLoading || !sourceText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
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

        {/* Translated Text Panel */}
        <div className="flex flex-col p-4 sm:p-6 bg-slate-50/50 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {getLanguageName(targetLang)}
            </span>

            {translatedText && (
              <span className="text-xs text-slate-400 font-medium">
                {translatedText.length.toLocaleString()} characters
              </span>
            )}
          </div>

          <div className="w-full flex-1 text-slate-800 text-base leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap select-text">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-sm">Converting across languages...</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 select-none">
                Translation will appear here instantly...
              </span>
            )}
          </div>

          {/* Target Panel Bottom Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Play / Stop Button for Translation */}
              <button
                type="button"
                onClick={toggleTargetSpeech}
                disabled={!translatedText || !isTTSSupported}
                title={
                  isSpeaking && speakingSide === "target"
                    ? "Stop speaking translation"
                    : "Listen to translated audio (Play)"
                }
                aria-label={
                  isSpeaking && speakingSide === "target"
                    ? "Stop translated audio"
                    : "Listen to translated audio"
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSpeaking && speakingSide === "target"
                    ? "bg-red-50 text-red-700 border border-red-200 animate-pulse hover:bg-red-100"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 disabled:opacity-40 disabled:hover:bg-transparent"
                }`}
              >
                {isSpeaking && speakingSide === "target" ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-red-600" />
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
                title="Copy translation"
                aria-label="Copy translation"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 disabled:opacity-40 disabled:hover:bg-transparent transition-colors relative"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Download File Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!translatedText}
                title="Download translation (.txt)"
                aria-label="Download translation (.txt)"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {copied && (
              <span className="text-xs text-emerald-600 font-medium animate-fade-in">
                Copied to clipboard!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Translation API Error Alert Box */}
      {errorMessage && (
        <div className="bg-red-50 border-t border-red-200 p-4 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-semibold">Error: </span>
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => handleTranslate()}
            className="text-xs font-semibold text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
