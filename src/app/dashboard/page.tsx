import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { TranslationWorkspace } from "@/components/workspace/TranslationWorkspace";
import { Sparkles, History, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function DashboardWorkspacePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || "Member"}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your translations are automatically stored in your personal history and sync across devices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            View History
          </Link>
          <Link
            href="/dashboard/business"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Product Assistant
          </Link>
        </div>
      </div>

      {/* Primary Translation Workspace */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Translation Studio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select language pairs, listen to speech audio, and copy or download results.
          </p>
        </div>
        <TranslationWorkspace />
      </div>
    </div>
  );
}
