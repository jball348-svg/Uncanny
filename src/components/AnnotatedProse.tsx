import React from 'react';
import { AnalysisResult } from '@/lib/aggregator';
import { SentenceChip } from './SentenceChip';

export function AnnotatedProse({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-stone-200 tracking-tight">Your Prose, Annotated</h2>
        <p className="text-stone-400 text-sm mt-1">
          Sentences are highlighted by AI likelihood. Hover or tap any highlighted sentence to see why it was flagged.
        </p>
      </div>
      
      <div className="bg-stone-900/30 border border-stone-800/50 rounded-2xl p-6 md:p-8 font-serif text-lg md:text-xl leading-loose md:leading-loose text-stone-300 shadow-inner">
        {result.sentences.map((s, i) => (
          <SentenceChip
            key={i}
            text={s.text}
            finalScore={s.finalScore}
            reason={s.reason}
            isSpaceTrailing={i < result.sentences.length - 1} // avoid trailing space at the very end
          />
        ))}
      </div>
    </div>
  );
}
