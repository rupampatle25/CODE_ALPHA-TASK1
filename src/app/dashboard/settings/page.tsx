import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Settings, Shield, User, Database, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          Account & Privacy Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your account details, privacy controls, and data retention policies.
        </p>
      </div>

      {/* User Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Full Name</span>
            <span className="font-medium text-slate-800">{user?.name || "Not provided"}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Email Address</span>
            <span className="font-medium text-slate-800">{user?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">User Role</span>
            <span className="font-medium text-slate-800">{user?.role}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Current Tier</span>
            <span className="font-bold text-blue-600">{user?.plan.name}</span>
          </div>
        </div>
      </div>

      {/* Privacy & Data Protection */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Privacy & Data Handling Transparency
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">
          At LingoFlow AI, we practice strict data minimization:
        </p>

        <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl">
          <li><strong>Text Retention:</strong> Your source text and translations are stored strictly for your personal history access.</li>
          <li><strong>No Reselling:</strong> We never sell, monetize, or train external AI models on your private translations.</li>
          <li><strong>Server-Side Security:</strong> All translation requests are forwarded over TLS/SSL encryption. API keys remain protected in backend environment variables.</li>
        </ul>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Danger Zone
        </h3>

        <p className="text-sm text-slate-600">
          Permanently delete your account and all associated translation history. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={() => {
            alert("To delete your account in this deployment, clear your history or contact support@lingoflow.ai.");
          }}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
        >
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}
