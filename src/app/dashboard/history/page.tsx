"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Copy,
  Check,
  Volume2,
  Square,
  Calendar,
  Languages,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getLanguageName } from "@/services/translation/languages";

interface TranslationRecord {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  provider: string;
  charCount: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load translation history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this translation record?")) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to permanently delete all your translation history?")) return;
    try {
      const res = await fetch("/api/history?clearAll=true", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (key: string, text: string, langCode: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingKey === key) {
      window.speechSynthesis.cancel();
      setSpeakingKey(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    setSpeakingKey(key);
    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.sourceText.toLowerCase().includes(search.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(search.toLowerCase()) ||
      item.sourceLang.toLowerCase().includes(search.toLowerCase()) ||
      item.targetLang.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Translation History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search, replay audio pronunciation, and manage your past translation records.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by keywords or language..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* History Items List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading translation history...</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Languages className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {search ? "No matches found" : "No translation history yet"}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {search
              ? `No records found matching "${search}". Try a different keyword.`
              : "Translate some text in your workspace and it will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const sourceKey = `${item.id}-source`;
            const targetKey = `${item.id}-target`;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {getLanguageName(item.sourceLang)} → {getLanguageName(item.targetLang)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{item.charCount} chars</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-600">{item.provider}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete record"
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Text content comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source text */}
                  <div className="bg-slate-50 p-3 rounded-xl relative group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">
                        Original ({item.sourceLang.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleSpeak(sourceKey, item.sourceText, item.sourceLang)}
                          title={speakingKey === sourceKey ? "Stop audio" : "Listen to original pronunciation"}
                          className={`p-1 rounded transition-colors ${
                            speakingKey === sourceKey
                              ? "text-red-600 animate-pulse bg-red-50"
                              : "text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          {speakingKey === sourceKey ? (
                            <Square className="w-3.5 h-3.5 fill-current text-red-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{item.sourceText}</p>
                  </div>

                  {/* Translated text */}
                  <div className="bg-blue-50/50 p-3 rounded-xl relative group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-blue-600 uppercase">
                        Translated ({item.targetLang.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleSpeak(targetKey, item.translatedText, item.targetLang)}
                          title={speakingKey === targetKey ? "Stop audio" : "Listen to translated audio"}
                          className={`p-1 rounded transition-colors ${
                            speakingKey === targetKey
                              ? "text-red-600 animate-pulse bg-red-50"
                              : "text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          {speakingKey === targetKey ? (
                            <Square className="w-3.5 h-3.5 fill-current text-red-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(item.id, item.translatedText)}
                          title="Copy"
                          className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
