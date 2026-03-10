import React from 'react';
import { AnalysisResult } from '@/lib/aggregator';

interface SignalCardsProps {
  result: AnalysisResult;
}

export function SignalCards({ result }: SignalCardsProps) {
  // Burstiness (Voice Rhythm)
  // heuristics: 1 = highly varied (Human), 0 = uniform (AI)
  // UI Display: 0 = Human, 100 = AI
  const burstiScoreVisual = (1 - result.burstiScore) * 100;
  const getBurstinessExplanation = (score: number) => {
    if (score < 40) return "Your sentence lengths vary naturally — a strong sign of human voice.";
    return "Your sentences follow a uniform rhythm. AI writing tends to be metronomic.";
  };

  // Vocabulary Range
  // heuristics: 1 = high diversity (Human), 0 = low diversity (AI)
  // UI Display: We'll show higher is better for vocab, so 0-100 where 100 is great vocab.
  const vocabScoreVisual = result.vocabularyScore * 100;
  const getVocabExplanation = (score: number) => {
    if (score < 40) return "The vocabulary is narrower than typical human prose.";
    return "Good range of vocabulary — humans naturally reach for varied words.";
  };

  // Phrase Patterns (Repetition)
  // heuristics: 1 = high repetition (AI), 0 = low repetition (Human)
  // UI Display: 0-100 where higher is more repetitive (AI-like).
  const repScoreVisual = result.repetitionScore * 100;
  const getRepetitionExplanation = (score: number) => {
    if (score > 60) return "Repeated phrases detected — AI models often reuse the same constructions.";
    return "No notable phrase repetition.";
  };

  const Card = ({ title, score, explanation, isBadHigh }: { title: string, score: number, explanation: string, isBadHigh: boolean }) => {
    // Determine color based on whether high is bad (isBadHigh = true for AI signals, false for Human signals like Vocab)
    let barColor = "bg-stone-500";
    if (isBadHigh) {
      if (score < 40) barColor = "bg-green-500/70";
      else if (score < 70) barColor = "bg-amber-500/70";
      else barColor = "bg-rose-500/70";
    } else {
      if (score > 60) barColor = "bg-green-500/70";
      else if (score > 30) barColor = "bg-amber-500/70";
      else barColor = "bg-rose-500/70";
    }

    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col justify-between hover:border-stone-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-stone-300 font-medium tracking-tight">{title}</h3>
          <span className="text-stone-500 text-xs font-mono bg-stone-950 px-2 py-1 rounded border border-stone-800">
            {Math.round(score)}
          </span>
        </div>
        <div className="w-full bg-stone-950/50 h-1.5 rounded-full mb-4 overflow-hidden border border-stone-800/50">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        <p className="text-sm text-stone-400 leading-relaxed min-h-[40px]">{explanation}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          title="Voice Rhythm" 
          score={burstiScoreVisual} 
          explanation={getBurstinessExplanation(burstiScoreVisual)} 
          isBadHigh={true}
        />
        <Card 
          title="Vocabulary Range" 
          score={vocabScoreVisual} 
          explanation={getVocabExplanation(vocabScoreVisual)} 
          isBadHigh={false}
        />
        <Card 
          title="Phrase Patterns" 
          score={repScoreVisual} 
          explanation={getRepetitionExplanation(repScoreVisual)} 
          isBadHigh={true}
        />
      </div>

      {result.dominantSignals && result.dominantSignals.length > 0 && (
        <div className="flex flex-col pt-6 border-t border-stone-800/50">
          <span className="text-xs text-stone-500 uppercase tracking-widest mb-3">Dominant Signals</span>
          <div className="flex flex-wrap gap-2">
            {result.dominantSignals.map((signal, i) => (
              <span 
                key={i} 
                className="px-3 py-1 bg-stone-900 border border-stone-800 text-stone-300 rounded-md text-xs shadow-sm"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
