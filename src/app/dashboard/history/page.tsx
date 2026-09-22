"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Download,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getLanguageName, SUPPORTED_LANGUAGES } from "@/services/translation/languages";

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

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRetentionPolicy, setShowRetentionPolicy] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("q", search.trim());
      if (selectedLang) params.append("lang", selectedLang);
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      const res = await fetch(`/api/history?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load translation history.");
      }

      if (data.data && Array.isArray(data.data.items)) {
        setHistory(data.data.items);
        setPagination(data.data.pagination);
      } else if (Array.isArray(data.data)) {
        // Fallback for flat array responses
        setHistory(data.data);
        setPagination({
          totalItems: data.data.length,
          totalPages: 1,
          currentPage: 1,
          pageSize,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load translation history.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedLang, page, pageSize]);

  useEffect(() => {
    fetchHistory();
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [fetchHistory]);

  // Reset page to 1 when search or language filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleLangChange = (val: string) => {
    setSelectedLang(val);
    setPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  // Delete a single record
  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRecordToDelete(null);
        setFeedbackMessage("Translation record deleted permanently.");
        setTimeout(() => setFeedbackMessage(null), 3000);
        fetchHistory();
      } else {
        throw new Error(data.error || "Delete failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete record.");
    }
  };

  // Clear all history
  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/history?clearAll=true", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setConfirmClearOpen(false);
        setFeedbackMessage("All translation history cleared.");
        setTimeout(() => setFeedbackMessage(null), 3000);
        setHistory([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1, currentPage: 1 }));
      } else {
        throw new Error(data.error || "Clear history failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to clear history.");
    }
  };

  // Export history as JSON
  const handleExport = () => {
    window.open("/api/history?export=json", "_blank");
  };

  // One-click copy
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Audio pronunciation toggle (TTS)
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

  const startRecordNum = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endRecordNum = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Translation History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, listen to speech audio, and manage your saved multilingual records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={pagination.totalItems === 0}
            title="Download translation history as JSON"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Export Data
          </button>

          {/* Clear All History Button */}
          {pagination.totalItems > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/80 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All History
            </button>
          )}
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedbackMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Retention & Privacy Policy Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowRetentionPolicy(!showRetentionPolicy)}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Data Retention & Privacy Safeguards
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline ml-2">
                • Row-level isolation & zero audio storage
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle data retention information"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            {showRetentionPolicy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showRetentionPolicy && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-fade-in leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">
                  1. Server-Side Access Control & Isolation
                </span>
                Every database query is strictly filtered by your authenticated user ID on the server. Your translation history is never shared across users or accessed without session authentication.
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">
                  2. User Ownership & Immediate Deletion
                </span>
                You own your data. Deleting individual records or choosing &quot;Clear All History&quot; permanently purges records from the database immediately.
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">
                  3. Zero Audio & Voice Recording Storage
                </span>
                Speech recognition (Voice-to-Text) and pronunciation audio (Text-to-Speech) are processed client-side via the browser Web Speech API. Audio signals never touch or persist on our database.
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">
                  4. Data Portability & Export
                </span>
                Export your full history log at any time using the &quot;Export Data&quot; button to keep your own offline JSON backup.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search keywords in source or translated text..."
            className="w-full text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters: Language and Page Size */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language filter */}
          <select
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Page size filter */}
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchHistory()}
            title="Refresh history"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Loading translation history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
          <Languages className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {search || selectedLang ? "No matching translation records" : "No translation history yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {search || selectedLang
              ? "No records found matching your active search or language filters. Try clearing your search."
              : "Translate some text in your translation studio workspace and it will be recorded here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const sourceKey = `${item.id}-source`;
            const targetKey = `${item.id}-target`;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header meta bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {getLanguageName(item.sourceLang)} → {getLanguageName(item.targetLang)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span>{item.charCount} chars</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{item.provider}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {/* Delete single item button */}
                    <button
                      type="button"
                      onClick={() => setRecordToDelete(item.id)}
                      title="Delete this record"
                      className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Text content comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source text */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl relative group border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Original ({item.sourceLang.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(sourceKey, item.sourceText, item.sourceLang)}
                          title={speakingKey === sourceKey ? "Stop audio" : "Listen to original pronunciation"}
                          className={`p-1 rounded transition-colors ${
                            speakingKey === sourceKey
                              ? "text-red-600 dark:text-red-400 animate-pulse bg-red-50 dark:bg-red-950/50"
                              : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          {speakingKey === sourceKey ? (
                            <Square className="w-3.5 h-3.5 fill-current text-red-600 dark:text-red-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {item.sourceText}
                    </p>
                  </div>

                  {/* Translated text */}
                  <div className="bg-blue-50/40 dark:bg-slate-800/80 p-3.5 rounded-xl relative group border border-blue-100/60 dark:border-slate-700/60">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Translated ({item.targetLang.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(targetKey, item.translatedText, item.targetLang)}
                          title={speakingKey === targetKey ? "Stop audio" : "Listen to translated audio"}
                          className={`p-1 rounded transition-colors ${
                            speakingKey === targetKey
                              ? "text-red-600 dark:text-red-400 animate-pulse bg-red-50 dark:bg-red-950/50"
                              : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          {speakingKey === targetKey ? (
                            <Square className="w-3.5 h-3.5 fill-current text-red-600 dark:text-red-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.translatedText)}
                          title="Copy translation"
                          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100 font-medium whitespace-pre-wrap leading-relaxed">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalItems > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startRecordNum}</span> to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{endRecordNum}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.totalItems}</span> translation records
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {/* Page indicator pills */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and current +/- 1
                return (
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prevVal = arr[idx - 1];
                const showEllipsis = prevVal && p - prevVal > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="px-1.5 text-slate-400 dark:text-slate-600 text-xs">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        pagination.currentPage === p
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Record */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Record?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete this translation record? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(recordToDelete)}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All History */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear Entire History?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will permanently delete all {pagination.totalItems} translation records from your database. This action is irreversible.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
