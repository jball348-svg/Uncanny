import { HeuristicsResult } from "./heuristics";
import { GeminiAnalysisResult } from "./geminiPrompt";

export type AnalysisResult = {
  overallScore: number;
  verdict: "likely-human" | "mixed" | "ai-influence";
  verdictLabel: string;
  heuristicScore: number;
  geminiScore: number;
  // Legacy display fields
  burstiScore: number;
  vocabularyScore: number;
  repetitionScore: number;
  // Modern signal display fields
  hedgingScore: number;
  biasVocabScore: number;
  summary: string;
  dominantSignals: string[];
  sentences: Array<{
    text: string;
    index: number;
    finalScore: number;
    reason?: string;
  }>;
  wordCount: number;
};

export function aggregateResults(
  heuristics: HeuristicsResult,
  gemini: GeminiAnalysisResult,
  sentences: string[]
): AnalysisResult {
  // ─────────────────────────────────────────────────────────────────
  // SCORING RATIONALE:
  // Gemini (LLM-as-judge) is the primary signal at 90%.
  // Modern AI prose defeats all simple statistical heuristics —
  // it has high vocabulary diversity, varied sentence length, and
  // low repetition. Only measurable modern signals (hedging language,
  // bias vocabulary) are worth including, at 10%.
  // ─────────────────────────────────────────────────────────────────
  const overallScore = clamp(
    (gemini.overallScore * 0.90) + (heuristics.overallHeuristicScore * 0.10),
    0, 1
  );

  let verdict: "likely-human" | "mixed" | "ai-influence" = "mixed";
  let verdictLabel = "Mixed Signals";

  if (overallScore < 0.25) {
    verdict = "likely-human";
    verdictLabel = "Likely Human";
  } else if (overallScore > 0.55) {
    verdict = "ai-influence";
    verdictLabel = "AI Influence Detected";
  }

  // Build sentence map from Gemini annotations (primary source of truth)
  const geminiMap = new Map<number, { aiLikelihoodScore: number; reason: string }>();
  for (const ann of gemini.sentenceAnnotations) {
    geminiMap.set(ann.sentenceIndex, ann);
  }

  const mergedSentences = sentences.map((text, index) => {
    const hScore = heuristics.sentenceScores[index]?.heuristicScore ?? 0;
    const gAnn = geminiMap.get(index);

    if (gAnn) {
      // Gemini flagged this sentence — its score is authoritative
      // Heuristic score provides a small secondary signal
      const finalScore = clamp((gAnn.aiLikelihoodScore * 0.9) + (hScore * 0.1), 0, 1);
      return { text, index, finalScore, reason: gAnn.reason };
    }

    // Gemini didn't flag it — use heuristic score (likely low)
    // But if heuristics found a hedging phrase or bias word, surface that
    const hSentence = heuristics.sentenceScores[index];
    const reason = hSentence?.signals.length
      ? hSentence.signals.join(", ")
      : undefined;

    return { text, index, finalScore: hScore, reason };
  });

  return {
    overallScore,
    verdict,
    verdictLabel,
    heuristicScore: heuristics.overallHeuristicScore,
    geminiScore: gemini.overallScore,
    burstiScore: heuristics.burstiScore,
    vocabularyScore: heuristics.vocabularyScore,
    repetitionScore: heuristics.repetitionScore,
    hedgingScore: heuristics.hedgingScore,
    biasVocabScore: heuristics.biasVocabScore,
    summary: gemini.summary,
    dominantSignals: gemini.dominantSignals,
    sentences: mergedSentences,
    wordCount: heuristics.wordCount,
  };
}

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));
