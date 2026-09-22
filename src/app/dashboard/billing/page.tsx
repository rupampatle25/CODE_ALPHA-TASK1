"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSelectPlan = async (planSlug: "free" | "pro") => {
    setLoadingPlan(planSlug);
    setFeedback(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug,
          gateway: "SIMULATION",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update subscription");
      }

      setFeedback({
        type: "success",
        message: data.message || `Successfully activated the ${planSlug.toUpperCase()} tier!`,
      });

      // Reload window after short pause to reflect updated usage quota in sidebar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Subscription update failed.",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-500" />
          Plans & Subscription
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your subscription tier, expand character quotas, and unlock business features.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Plan Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Free Starter */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Free Starter</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                Standard
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-950">$0</span>
              <span className="text-slate-500 text-sm"> / month</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>5,000 characters / month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>30+ Language pairs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Basic speech audio (TTS)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Personal history storage</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan("free")}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 text-sm transition-colors cursor-pointer"
          >
            {loadingPlan === "free" ? "Switching..." : "Switch to Free"}
          </button>
        </div>

        {/* Pro Creator */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-md relative flex flex-col justify-between">
          <div className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
            Recommended
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Pro Creator</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                Power User
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-950">$9</span>
              <span className="text-slate-500 text-sm"> / month (or ₹499)</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2 font-medium text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>100,000 characters / month (20x limit)</span>
              </li>
              <li className="flex items-center gap-2 font-medium text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Product Description Assistant (Unlocked)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Unlimited history search & export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Priority high-speed routing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan("pro")}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingPlan === "pro" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activating Pro...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro (Instant Demo)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Gateway Architecture Disclosure */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Payment Provider Integration Architecture</span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          BhashaSetu is designed with a dual-gateway architecture:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Domestic / India (Razorpay)</span>
            Supports UPI (Google Pay, PhonePe, Paytm), Netbanking, and Indian credit/debit cards. Webhooks verified with HMAC-SHA256 signatures.
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">International (Stripe)</span>
            Global multi-currency credit card processing, Apple Pay, and Google Pay with SCA (Strong Customer Authentication) 3D Secure 2.
          </div>
        </div>

        <div className="text-xs text-slate-400">
          * For your college demonstration, you can click &quot;Upgrade to Pro (Instant Demo)&quot; to simulate a verified transaction and unlock 100,000 characters without live credit card charges.
        </div>
      </div>
    </div>
  );
}
