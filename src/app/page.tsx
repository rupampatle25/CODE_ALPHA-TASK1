import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TranslationWorkspace } from "@/components/workspace/TranslationWorkspace";
import {
  Zap,
  Volume2,
  Lock,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Briefcase,
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-6 border border-blue-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Language Translation & Productivity SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight mb-6">
              Break Language Barriers. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Grow Without Borders.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              Instant, accurate multilingual translation with built-in voice pronunciation, 
              one-click copy, and business localization tools for students, creators, and global sellers.
            </p>
          </div>

          {/* Core Interactive Translation Workspace (Assignment Task 1 in Action) */}
          <div id="workspace" className="relative z-10 scroll-mt-24">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-xl opacity-20 transition duration-1000 group-hover:opacity-100 -z-10" />
            <TranslationWorkspace />
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-slate-900">30+</div>
              <div className="text-xs text-slate-500 mt-1">Supported Languages</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-slate-900">&lt; 350ms</div>
              <div className="text-xs text-slate-500 mt-1">Average Response Time</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-slate-900">Native Audio</div>
              <div className="text-xs text-slate-500 mt-1">Speech Pronunciation</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-bold text-slate-900">100% Secure</div>
              <div className="text-xs text-slate-500 mt-1">Encrypted Server API</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered for Speed, Clarity, and Scale
            </h3>
            <p className="mt-4 text-slate-600">
              Everything you need to translate, vocalize, and adapt content effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Instant Translation API</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connects through our secure server abstraction to high-fidelity translation engines with automatic language detection.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Volume2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Text-to-Speech Audio</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Listen to accurate, native pronunciations in both source and target accents with zero server delay.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Product Description Assistant</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tailored for e-commerce sellers and marketers. Convert product listings into compelling, localized copy in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Simple Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Three Steps to Global Reach
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Input Your Content</h4>
              <p className="text-sm text-slate-600">
                Type or paste any text up to 5,000 characters. Our system can auto-detect the language automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Select Target Language</h4>
              <p className="text-sm text-slate-600">
                Pick from over 30 languages spanning Europe, Asia, and the Americas with full script support.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Copy, Vocalize & Export</h4>
              <p className="text-sm text-slate-600">
                Play back the natural speech audio, copy the translation with one click, or export to a text file.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Use Cases */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Built For You</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Who Uses LingoFlow AI?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Students & Educators</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Translate research papers, check pronunciation for foreign language classes, and save translation history for easy review.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <ShoppingBag className="w-8 h-8 text-indigo-600 mb-3" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">E-Commerce Sellers</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Expand product listings to global Amazon or Shopify stores. Adapt product titles and feature bullets to match buyer expectations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <Briefcase className="w-8 h-8 text-emerald-600 mb-3" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Freelancers & Creators</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Communicate with international clients seamlessly and translate social media captions to reach worldwide audiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Transparent Pricing</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Predictable Plans for Every Stage
            </h3>
            <p className="mt-4 text-slate-600">
              Start completely free. Upgrade when your global traffic expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-slate-900">Free Tier</h4>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                    Starter
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-950">$0</span>
                  <span className="text-slate-500 text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>5,000 characters per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>30+ Language pairs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Native speech audio (TTS)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>One-click copy & export</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full text-center py-2.5 px-4 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-slate-900">Pro Creator</h4>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                    Professional
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-950">$9</span>
                  <span className="text-slate-500 text-sm"> / month (or ₹499)</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 font-medium text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>100,000 characters per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Multilingual Product Description Assistant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Unlimited translation history search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Priority high-speed server bandwidth</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=pro"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md shadow-blue-500/20 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Got Questions?</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="font-semibold text-slate-900 mb-2">How does LingoFlow AI perform translations?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                LingoFlow AI connects to production-grade neural translation APIs server-side. Your API keys are strictly secured in environment variables and never exposed to client browsers.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="font-semibold text-slate-900 mb-2">Is the Text-to-Speech audio free?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes! We leverage the browser&apos;s native Web Speech API to provide instantaneous, zero-latency pronunciation without incurring third-party audio API fees.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="font-semibold text-slate-900 mb-2">Can I switch translation providers?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. Our provider architecture is completely modular. You can switch between MyMemory, Google Cloud Translation, or other vendors by updating a single environment variable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
