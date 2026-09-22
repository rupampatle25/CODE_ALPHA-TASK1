"use client";

import React, { useState } from "react";
import { SUPPORTED_LANGUAGES, getLanguageName } from "@/services/translation/languages";
import {
  ShoppingBag,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertCircle,
  Loader2,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export default function BusinessAssistantPage() {
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [targetLang, setTargetLang] = useState("es");
  const [tone, setTone] = useState<"professional" | "persuasive" | "casual">("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          features,
          sourceLang: "en",
          targetLang,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed.");
      }

      setOutput(data.data.localizedListing);
    } catch (err: any) {
      setError(err.message || "Failed to generate localized product copy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const element = document.createElement("a");
    const file = new Blob([output], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${productName.toLowerCase().replace(/\s+/g, "_")}_${targetLang}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            E-Commerce & SaaS Productivity
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-600" />
          Multilingual Product Description Assistant
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate tailored marketing descriptions for Amazon, Shopify, Etsy, and global online stores in any language.
        </p>
      </div>

      {/* Disclaimers & Ethics */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-800 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Commercial Localization Note:</strong> This tool performs automated stylistic adaptation and translation. Always review regional marketing claims and consumer protection disclosures before publishing live product listings.
        </span>
      </div>

      {/* Main Grid: Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="pname" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name
              </label>
              <input
                id="pname"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Organic Cold-Pressed Argan Oil"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="pfeatures" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Key Features & Benefits (One per line)
              </label>
              <textarea
                id="pfeatures"
                rows={5}
                required
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="• 100% pure organic Moroccan argan oil&#10;• Hydrates skin and revitalizes hair&#10;• Rich in Vitamin E and essential fatty acids&#10;• Eco-friendly glass dropper bottle"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plang" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Marketplace
                </label>
                <select
                  id="plang"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ptone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Copy Tone
                </label>
                <select
                  id="ptone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="professional">Professional / Spec-Oriented</option>
                  <option value="persuasive">Persuasive / Direct-To-Consumer</option>
                  <option value="casual">Casual / Social Media Friendly</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !productName.trim() || !features.trim()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Localized Listing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Localized Listing
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Localized Copy ({getLanguageName(targetLang)})
              </span>

              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[250px] text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Synthesizing and localizing product copy...</span>
                </div>
              ) : output ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {output}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
                  <p>Fill in product details and click generate to create localized sales copy.</p>
                </div>
              )}
            </div>
          </div>

          {output && (
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
              <span>Ready for copy & export into e-commerce backends</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Localized successfully
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
