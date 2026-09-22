"use client";

import React, { useState, useEffect } from "react";
import { SOURCE_LANGUAGES, SUPPORTED_LANGUAGES, getLanguageName } from "@/services/translation/languages";
import { LanguageSelector } from "./LanguageSelector";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
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
  const [speakingSide, setSpeakingSide] = useState<"source" | "target" | null>(null);

  // Debounced auto-translate or manual translation
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
    if (sourceLang === "auto") {
      // If auto-detected, set source to current target and target to detected or English
      setSourceLang(targetLang);
      setTargetLang(detectedLang && detectedLang !== "auto" ? detectedLang : "en");
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }

    // Also swap texts if translated text exists
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

  // Text-To-Speech (Web Speech API)
  const handleSpeak = (text: string, langCode: string, side: "source" | "target") => {
    if (!window.speechSynthesis || !text.trim()) return;

    window.speechSynthesis.cancel(); // Stop current speaking

    const utterance = new SpeechSynthesisUtterance(text);
    // Resolve lang code for speech synthesis (e.g., 'es' -> 'es-ES', 'hi' -> 'hi-IN')
    const actualLang = langCode === "auto" ? (detectedLang || "en") : langCode;
    utterance.lang = actualLang;

    setSpeakingSide(side);
    utterance.onend = () => setSpeakingSide(null);
    utterance.onerror = () => setSpeakingSide(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all">
      {/* Top Language Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <LanguageSelector
            label="From"
            languages={SOURCE_LANGUAGES}
            value={sourceLang}
            onChange={(code) => {
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
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <LanguageSelector
            label="To"
            languages={SUPPORTED_LANGUAGES}
            value={targetLang}
            onChange={(code) => {
              setTargetLang(code);
              if (sourceText.trim()) handleTranslate(sourceText);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Status Indicator */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          {provider && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
              {provider}
            </span>
          )}
        </div>
      </div>

      {/* Main Panels: Input & Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[340px]">
        {/* Source Text Panel */}
        <div className="flex flex-col p-4 sm:p-6 bg-white relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {sourceLang === "auto"
                ? detectedLang
                  ? `Detected: ${getLanguageName(detectedLang)}`
                  : "Detecting..."
                : getLanguageName(sourceLang)}
            </span>
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

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            placeholder="Type, paste text, or press Ctrl+Enter to translate..."
            maxLength={5000}
            className="w-full flex-1 resize-none border-0 p-0 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 text-base leading-relaxed"
          />

          {/* Source Panel Bottom Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSpeak(sourceText, sourceLang, "source")}
                disabled={!sourceText.trim() || speakingSide === "source"}
                title="Listen to pronunciation"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${speakingSide === "source" ? "text-blue-600 animate-pulse" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs ${sourceText.length > 4500 ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
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
              {/* Text-To-Speech Button */}
              <button
                type="button"
                onClick={() => handleSpeak(translatedText, targetLang, "target")}
                disabled={!translatedText || speakingSide === "target"}
                title="Listen to translation"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${speakingSide === "target" ? "text-blue-600 animate-pulse" : ""}`} />
              </button>

              {/* Copy Translation Button */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                title="Copy translation"
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

      {/* Error Alert Box */}
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
