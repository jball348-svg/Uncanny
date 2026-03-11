"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/context/AnalysisContext';

export function ActionBar() {
  const { result, setResult, setIsLoading } = useAnalysis();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    const annotatedLines = result.sentences.map((sentence) => {
      if (sentence.finalScore > 0.35 && sentence.reason) {
        return `${sentence.text}\n⚑ ${sentence.reason}\n`;
      }
      return sentence.text;
    });

    const textToCopy = `Uncanny Analysis Result
Overall Score: ${Math.round(result.overallScore * 100)}%
Verdict: ${result.verdictLabel}

${result.summary}

Signals detected: ${result.dominantSignals.join(", ")}

────────────────────────────────
ANNOTATED TEXT
────────────────────────────────

${annotatedLines.join("\n")}`.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleAnalyseAnother = () => {
    setResult(null);
    setIsLoading(false);
    router.push('/analyse');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 mt-12 border-t border-stone-800/50">
      <button
        onClick={handleAnalyseAnother}
        className="px-6 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors w-full sm:w-auto"
      >
        Analyse Another Piece
      </button>
      <button
        onClick={handleCopy}
        className="px-6 py-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-900 font-medium transition-colors w-full sm:w-auto min-w-[200px]"
      >
        {copied ? "Copied!" : "Copy Summary"}
      </button>
    </div>
  );
}
