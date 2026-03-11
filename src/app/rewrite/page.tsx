"use client";

import React, { useEffect, useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RewritePage() {
  const { result, rewriteResult, setResult, setRewriteResult } = useAnalysis();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!rewriteResult) {
      router.push('/analyse');
    }
  }, [rewriteResult, router]);

  if (!rewriteResult) {
    return null; // Will redirect via useEffect
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(rewriteResult.rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleStartOver = () => {
    setResult(null); // This will also clear rewriteResult due to context implementation
    router.push('/analyse');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-rose-500/30 pb-24">
      {/* Navbar */}
      <header className="border-b border-stone-800/50 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/results" 
            className="text-sm text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to analysis
          </Link>
          <div className="font-serif text-xl tracking-tight text-stone-200">Uncanny</div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        
        {/* Section 1 - Header */}
        <section className="space-y-4">
          <h1 className="text-3xl font-serif text-stone-100">Your Revised Draft</h1>
          <p className="text-lg text-stone-400 leading-relaxed">
            {rewriteResult.overallNote}
          </p>
        </section>

        {/* Section 2 - Rewritten prose */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-stone-500 uppercase tracking-widest">
              The Text
            </h2>
            <button
              onClick={handleCopyText}
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              {copied ? "Copied!" : "Copy Revised Text"}
            </button>
          </div>
          <div className="bg-stone-900/30 border border-stone-800/50 rounded-2xl p-8 md:p-12">
            <div className="prose prose-invert prose-stone max-w-none font-serif text-lg leading-loose text-stone-300 whitespace-pre-wrap">
              {rewriteResult.rewrittenText}
            </div>
          </div>
        </section>

        {/* Section 3 - What changed */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif text-stone-100 mb-2">What Changed</h2>
            <p className="text-stone-400">
              The most significant edits made to humanise your prose.
            </p>
          </div>
          
          <div className="space-y-6">
            {rewriteResult.changes.map((change, idx) => (
              <div key={idx} className="bg-stone-900/50 rounded-xl p-6 border border-stone-800/50 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-stone-500 tracking-wider">ORIGINAL</div>
                  <div className="text-stone-400 line-through decoration-rose-500/30 font-serif">
                    {change.original}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-500/80 tracking-wider">REVISED</div>
                  <div className="text-stone-200 font-serif">
                    {change.revised}
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-800/50">
                  <div className="text-xs font-semibold text-stone-500 tracking-wider mb-1">WHY</div>
                  <div className="text-sm text-stone-400">
                    {change.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 - Actions at bottom */}
        <section className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-stone-800/50">
          <button
            onClick={() => router.push('/results')}
            className="px-6 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors w-full sm:w-auto"
          >
            ← Back to Analysis
          </button>
          <button
            onClick={handleStartOver}
            className="px-6 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors w-full sm:w-auto"
          >
            Start Over
          </button>
          <div className="flex-1" />
          <button
            onClick={handleCopyText}
            className="px-6 py-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-900 font-medium transition-colors w-full sm:w-auto min-w-[200px]"
          >
            {copied ? "Copied!" : "Copy Revised Text"}
          </button>
        </section>

      </main>
    </div>
  );
}
