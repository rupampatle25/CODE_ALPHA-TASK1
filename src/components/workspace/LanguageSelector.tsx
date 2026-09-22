"use client";

import React from "react";
import { Language } from "@/services/translation/types";

interface LanguageSelectorProps {
  label: string;
  languages: Language[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  languages,
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={label} className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
        {label}:
      </label>
      <div className="relative inline-block w-full sm:w-auto">
        <select
          id={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full sm:w-48 appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-3 py-2 pr-8 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag ? `${lang.flag} ` : ""}{lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.nativeName})` : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
