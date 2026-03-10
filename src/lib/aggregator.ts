import { HeuristicsResult } from "./heuristics";
import { GeminiAnalysisResult } from "./geminiPrompt";

export type AnalysisResult = {
  overallScore: number; // 0–1, final combined score
  verdict: "likely-human" | "mixed" | "ai-influence";
  verdictLabel: string; // "Likely Human" | "Mixed Signals" | "AI Influence Detected"
  heuristicScore: number;
  geminiScore: number;
  burstiScore: number;
  vocabularyScore: number;
  repetitionScore: number;
  summary: string;
  dominantSignals: string[];
  sentences: Array<{
    text: string;
    index: number;
    finalScore: number; // 0–1
    reason?: string;
  }>;
  wordCount: number;
};

export function aggregateResults(
  heuristics: HeuristicsResult,
  gemini: GeminiAnalysisResult,
  sentences: string[]
): AnalysisResult {
  const overallScore =
    heuristics.overallHeuristicScore * 0.4 + gemini.overallScore * 0.6;

  let verdict: "likely-human" | "mixed" | "ai-influence" = "mixed";
  let verdictLabel = "Mixed Signals";

  if (overallScore < 0.35) {
    verdict = "likely-human";
    verdictLabel = "Likely Human";
  } else if (overallScore > 0.65) {
    verdict = "ai-influence";
    verdictLabel = "AI Influence Detected";
  }

  // Map Gemini annotations by index for easy lookup
  const geminiMap = new Map();
  for (const ann of gemini.sentenceAnnotations) {
    geminiMap.set(ann.sentenceIndex, ann);
  }

  const mergedSentences = sentences.map((text, index) => {
    const hScore = heuristics.sentenceScores[index]?.heuristicScore || 0;
    const gAnn = geminiMap.get(index);

    let finalScore = hScore;
    let reason = undefined;

    if (gAnn) {
      // If Gemini flagged it, average it with heuristics
      finalScore = (hScore + gAnn.aiLikelihoodScore) / 2;
      reason = gAnn.reason;
    }

    return {
      text,
      index,
      finalScore,
      reason,
    };
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
    summary: gemini.summary,
    dominantSignals: gemini.dominantSignals,
    sentences: mergedSentences,
    wordCount: heuristics.wordCount,
  };
}
