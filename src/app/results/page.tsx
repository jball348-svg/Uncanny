"use client";

import React, { useEffect } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { useRouter } from 'next/navigation';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { SignalCards } from '@/components/SignalCards';
import { AnnotatedProse } from '@/components/AnnotatedProse';
import { ActionBar } from '@/components/ActionBar';
import Link from 'next/link';

export default function ResultsPage() {
  const { result, setResult } = useAnalysis();
  const router = useRouter();

  useEffect(() => {
    // If user navigated here directly without a result, go back to analyse
    if (!result) {
      router.push('/analyse');
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-rose-500/30">
      {/* Navbar */}
      <header className="border-b border-stone-800/50 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/analyse" 
            onClick={handleReset}
            className="text-sm text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Analyse another
          </Link>
          <div className="font-serif text-xl tracking-tight text-stone-200">Uncanny</div>
          <div className="w-32"></div> {/* spacer for centering */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <ScoreDisplay result={result} />
        <SignalCards result={result} />
        <AnnotatedProse result={result} />
        <ActionBar />
      </main>
    </div>
  );
}
