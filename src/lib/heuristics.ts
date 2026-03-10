export type SentenceScore = {
  text: string;
  index: number;
  heuristicScore: number; // 0 (human) to 1 (AI)
  signals: string[]; // e.g. ["low burstiness", "repetitive phrase"]
};

export type HeuristicsResult = {
  burstiScore: number; // 0–1, low = AI-like (uniform sentence length)
  vocabularyScore: number; // 0–1, low = AI-like (low diversity)
  repetitionScore: number; // 0–1, high = AI-like (repeated phrases)
  overallHeuristicScore: number; // 0–1 weighted average, high = AI-like
  sentenceScores: SentenceScore[];
  wordCount: number;
  sentenceCount: number;
};

// Utilities
const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const getWords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
};

// 1. Sentence Splitter
// A lightweight approximation avoiding splitting on common titles (Mr., Dr., etc.)
export const splitSentences = (text: string): string[] => {
  // Replace common acronyms/titles with safe tokens temp
  let processed = text.replace(/Mr\./gi, "Mr<DOT>");
  processed = processed.replace(/Mrs\./gi, "Mrs<DOT>");
  processed = processed.replace(/Ms\./gi, "Ms<DOT>");
  processed = processed.replace(/Dr\./gi, "Dr<DOT>");
  processed = processed.replace(/e\.g\./gi, "eg<DOT>");
  processed = processed.replace(/i\.e\./gi, "ie<DOT>");
  processed = processed.replace(/p\.m\./gi, "pm<DOT>");
  processed = processed.replace(/a\.m\./gi, "am<DOT>");
  // Ellipses
  processed = processed.replace(/\.\.\./g, "<ELLIPSE>");

  // Split on punctuation that ends a sentence (. ? !) optionally followed by quotes
  const matches = processed.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g);
  
  if (!matches) {
    // Fallback if no punctuation found, just return the whole text as one sentence
    return [text.trim()].filter(Boolean);
  }

  return matches.map((s) => {
    let restored = s.trim();
    restored = restored.replace(/<DOT>/g, ".");
    restored = restored.replace(/<ELLIPSE>/g, "...");
    return restored;
  });
};

export function analyseHeuristics(text: string): HeuristicsResult {
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;

  // 1. Word stats & Vocabulary
  const allWords = getWords(text);
  const wordCount = allWords.length;
  const uniqueWords = new Set(allWords);

  // If text is super short, just return a neutral default
  if (wordCount < 10 || sentenceCount < 1) {
    return {
      burstiScore: 0.5,
      vocabularyScore: 0.5,
      repetitionScore: 0.5,
      overallHeuristicScore: 0.5,
      sentenceScores: sentences.map((s, i) => ({
        text: s,
        index: i,
        heuristicScore: 0.5,
        signals: [],
      })),
      wordCount,
      sentenceCount,
    };
  }

  const vocabularyScore = uniqueWords.size / wordCount;

  // 2. Burstiness (Sentence Length Variation)
  const sentenceLengths = sentences.map((s) => getWords(s).length);
  const meanLength = wordCount / sentenceCount;
  
  const squaredDiffs = sentenceLengths.map((l) => Math.pow(l - meanLength, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / sentenceCount;
  const stdDev = Math.sqrt(variance);

  // Standard deviation ~15 words is highly varied (human). <5 words is very uniform (AI).
  const burstiScore = clamp(stdDev / 15, 0, 1);

  // 3. Repetition Score (3-5 word N-Grams)
  const nGramCounts: Record<string, number> = {};
  const repeatedNGrams = new Set<string>();

  for (let n = 3; n <= 5; n++) {
    for (let i = 0; i <= allWords.length - n; i++) {
      const nGram = allWords.slice(i, i + n).join(" ");
      nGramCounts[nGram] = (nGramCounts[nGram] || 0) + 1;
      if (nGramCounts[nGram] > 2) {
        repeatedNGrams.add(nGram);
      }
    }
  }

  // Normalise repetition: 1 repeated phrase per 100 words is considered highly repetitive
  // e.g. text is 300 words. We expect maybe 0-1 repeats. If we have 3 distinct repeated n-grams, score is 1.0.
  const repetitionScore = clamp(repeatedNGrams.size / (wordCount / 100), 0, 1);

  // 4. Per-Sentence Scoring
  const sentenceScores: SentenceScore[] = sentences.map((sentence, index) => {
    const sWords = getWords(sentence);
    const sLen = sWords.length;
    const signals: string[] = [];

    // How close to mean?
    const diffFromMean = Math.abs(sLen - meanLength);
    // If length is within 2 words of the mean, it's very "average"
    let lengthAI = 0;
    if (diffFromMean < 2 && sLen > 5) {
      lengthAI = 0.8;
      signals.push("uniform length");
    } else if (diffFromMean < 5 && sLen > 5) {
      lengthAI = 0.4;
    }

    // Contains repeated n-grams?
    let repAI = 0;
    const sTextLower = sentence.toLowerCase();
    let containsRepeat = false;
    repeatedNGrams.forEach((ng) => {
      if (sTextLower.includes(ng)) {
        containsRepeat = true;
      }
    });

    if (containsRepeat) {
      repAI = 1.0;
      signals.push("repetitive phrase");
    }

    const sHeuristicScore = clamp((lengthAI * 0.5) + (repAI * 0.5), 0, 1);

    return {
      text: sentence,
      index,
      heuristicScore: sHeuristicScore,
      signals,
    };
  });

  // 5. Overall heuristic score
  // Low burstiness (uniform) = AI
  // Low vocab (repetitive words) = AI
  // High repetition = AI
  const aiBurstiness = 1 - burstiScore;
  const aiVocab = 1 - vocabularyScore;
  
  const overallHeuristicScore = clamp(
    (aiBurstiness * 0.4) + (aiVocab * 0.35) + (repetitionScore * 0.25),
    0,
    1
  );

  return {
    burstiScore,
    vocabularyScore,
    repetitionScore,
    overallHeuristicScore,
    sentenceScores,
    wordCount,
    sentenceCount,
  };
}

// QUICK TEST:
// const aiText = "The sun was setting. It was a warm day. She felt a surge of hope. The wind was blowing gently. She sighed softly. He looked at her. It was a nice day. She felt a surge of hope. The birds were singing."
// const humanText = "When Mr. Bilbo Baggins of Bag End announced that he would shortly be celebrating his eleventy-first birthday with a party of special magnificence, there was much talk and excitement in Hobbiton. Bilbo was very rich and very peculiar, and had been the wonder of the Shire for sixty years, ever since his remarkable disappearance and unexpected return."
// console.log("AI:", analyseHeuristics(aiText));
// console.log("HUMAN:", analyseHeuristics(humanText));
