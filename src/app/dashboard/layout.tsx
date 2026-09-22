import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserUsageThisMonth } from "@/services/usage/tracker";
import {
  Globe,
  Languages,
  History,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const usageThisMonth = await getUserUsageThisMonth(user.id);
  const charLimit = user.plan.monthlyCharLimit || 5000;
  const usagePercentage = Math.min(100, Math.round((usageThisMonth / charLimit) * 100));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <Link href="/dashboard" className="text-lg font-bold text-white tracking-tight">
              LingoFlow<span className="text-blue-500">.ai</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Languages className="w-4 h-4 text-blue-400" />
              <span>Workspace</span>
            </Link>

            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Translation History</span>
            </Link>

            <Link
              href="/dashboard/business"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <div className="flex items-center justify-between w-full">
                <span>Product Assistant</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                  BIZ
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/billing"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Plans & Billing</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer: Usage Bar & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* Monthly Quota Card */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Monthly Usage</span>
              <span className="text-blue-400 font-bold">{user.plan.name}</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercentage > 90 ? "bg-red-500" : usagePercentage > 75 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{usageThisMonth.toLocaleString()} chars</span>
              <span>{charLimit.toLocaleString()} max</span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user.name || user.email}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">LingoFlow Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/landing"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors hidden sm:inline"
            >
              Public Showcase
            </Link>
            <ThemeToggle />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              {user.plan.name}
            </span>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
