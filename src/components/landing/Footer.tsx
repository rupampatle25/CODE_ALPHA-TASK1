import React from "react";
import Link from "next/link";
import { Globe, Shield, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">BhashaSetu</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting Languages, Empowering Communication.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>SSL Secured & Privacy Conscious</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#workspace" className="hover:text-white transition-colors">Instant Translator</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Business Assistant</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><Link href="/api/health" className="hover:text-white transition-colors">System Health</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Languages</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">English, Spanish, French, German</span></li>
              <li><span className="text-slate-400">Hindi, Bengali, Tamil, Telugu</span></li>
              <li><span className="text-slate-400">Japanese, Chinese, Korean, Arabic</span></li>
              <li><span className="text-slate-400">30+ Languages Supported</span></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Legal & Ethics</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy (Draft)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Data Protection Principles</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Security Standards</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} BhashaSetu. Built with precision for production and academic demonstration.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with modern Next.js, TypeScript & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
