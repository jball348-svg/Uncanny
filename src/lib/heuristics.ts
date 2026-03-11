export type SentenceScore = {
  text: string;
  index: number;
  heuristicScore: number; // 0 (human) to 1 (AI)
  signals: string[];
};

export type HeuristicsResult = {
  // Legacy scores (kept for UI display but no longer used in overall weighting)
  burstiScore: number;
  vocabularyScore: number;
  repetitionScore: number;
  // Modern signals that actually work on current LLMs
  hedgingScore: number;      // 0–1, high = AI-like (sycophantic hedging language)
  biasVocabScore: number;    // 0–1, high = AI-like (flagged AI vocabulary present)
  overallHeuristicScore: number;
  sentenceScores: SentenceScore[];
  wordCount: number;
  sentenceCount: number;
};

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const getWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);

export const splitSentences = (text: string): string[] => {
  let processed = text
    .replace(/Mr\./gi, "Mr<DOT>")
    .replace(/Mrs\./gi, "Mrs<DOT>")
    .replace(/Ms\./gi, "Ms<DOT>")
    .replace(/Dr\./gi, "Dr<DOT>")
    .replace(/e\.g\./gi, "eg<DOT>")
    .replace(/i\.e\./gi, "ie<DOT>")
    .replace(/p\.m\./gi, "pm<DOT>")
    .replace(/a\.m\./gi, "am<DOT>")
    .replace(/\.\.\./g, "<ELLIPSE>");

  const matches = processed.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g);
  if (!matches) return [text.trim()].filter(Boolean);

  return matches.map((s) =>
    s.trim().replace(/<DOT>/g, ".").replace(/<ELLIPSE>/g, "...")
  );
};

// ─────────────────────────────────────────────────────────────────
// MODERN AI SIGNAL 1: Hedging & Sycophancy
// These phrases persist in AI prose because models are RLHF-trained
// to be helpful, safe, and non-committal. They survive paraphrasing.
// ─────────────────────────────────────────────────────────────────
const HEDGING_PHRASES = [
  "it is worth noting",
  "it is important to note",
  "it is important to remember",
  "it is crucial to",
  "it is essential to",
  "one might argue",
  "one could argue",
  "in many ways",
  "it could be said",
  "it can be said",
  "it is fair to say",
  "in a sense",
  "to some extent",
  "it seems",
  "seemingly",
  "perhaps",
  "arguably",
  "it is widely regarded",
  "many would agree",
  "it is generally accepted",
  "needless to say",
  "of course",
  "as one might expect",
  "in conclusion",
  "to summarise",
  "to summarize",
  "in summary",
  "overall",
  "ultimately",
  "at the end of the day",
];

// ─────────────────────────────────────────────────────────────────
// MODERN AI SIGNAL 2: Bias Vocabulary
// Words statistically overrepresented in LLM outputs due to
// pre-training data composition (Wikipedia, encyclopedic sources)
// and instruction tuning. These are NOT style choices — they are
// distributional artifacts that survive synonym-swap detection.
// ─────────────────────────────────────────────────────────────────
const AI_BIAS_WORDS = [
  "delve", "delves", "delved", "delving",
  "tapestry", "tapestries",
  "intricate", "intricately",
  "testament", "testaments",
  "realm", "realms",
  "vibrant", "vibrantly",
  "crucial", "crucially",
  "multifaceted",
  "nuanced", "nuance", "nuances",
  "robust", "robustly",
  "pivotal",
  "underscore", "underscores", "underscored",
  "illuminate", "illuminates", "illuminated", "illuminating",
  "foster", "fosters", "fostered", "fostering",
  "elevate", "elevates", "elevated", "elevating",
  "comprehensive", "comprehensively",
  "reimagine", "reimagines", "reimagined",
  "embark", "embarks", "embarked", "embarking",
  "resonate", "resonates", "resonated", "resonating",
  "beacon", "beacons",
  "navigate", "navigates", "navigated", "navigating",
  "landscape", "landscapes",
  "cornerstone", "cornerstones",
  "groundbreaking",
  "innovative", "innovation",
  "synergy", "synergies",
  "bespoke",
  "curated",
  "transformative",
  "leverage", "leverages", "leveraged", "leveraging",
  "holistic",
  "seamlessly", "seamless",
];

export function analyseHeuristics(text: string): HeuristicsResult {
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;
  const allWords = getWords(text);
  const wordCount = allWords.length;

  if (wordCount < 10 || sentenceCount < 1) {
    return {
      burstiScore: 0.5,
      vocabularyScore: 0.5,
      repetitionScore: 0.5,
      hedgingScore: 0.5,
      biasVocabScore: 0.5,
      overallHeuristicScore: 0.5,
      sentenceScores: sentences.map((s, i) => ({
        text: s, index: i, heuristicScore: 0.5, signals: [],
      })),
      wordCount,
      sentenceCount,
    };
  }

  // ── Legacy signals (kept for UI only) ──
  const uniqueWords = new Set(allWords);
  const vocabularyScore = uniqueWords.size / wordCount;

  const sentenceLengths = sentences.map((s) => getWords(s).length);
  const meanLength = wordCount / sentenceCount;
  const stdDev = Math.sqrt(
    sentenceLengths.map((l) => Math.pow(l - meanLength, 2)).reduce((a, b) => a + b, 0) / sentenceCount
  );
  const burstiScore = clamp(stdDev / 15, 0, 1);

  const nGramCounts: Record<string, number> = {};
  const repeatedNGrams = new Set<string>();
  for (let n = 3; n <= 5; n++) {
    for (let i = 0; i <= allWords.length - n; i++) {
      const nGram = allWords.slice(i, i + n).join(" ");
      nGramCounts[nGram] = (nGramCounts[nGram] || 0) + 1;
      if (nGramCounts[nGram] > 2) repeatedNGrams.add(nGram);
    }
  }
  const repetitionScore = clamp(repeatedNGrams.size / (wordCount / 100), 0, 1);

  // ── Modern signal 1: Hedging density ──
  const textLower = text.toLowerCase();
  const hedgingHits = HEDGING_PHRASES.filter((p) => textLower.includes(p));
  // 1 hedging phrase per 100 words = score of ~0.5; 2+ = high AI signal
  const hedgingScore = clamp(hedgingHits.length / (wordCount / 80), 0, 1);

  // ── Modern signal 2: Bias vocabulary ──
  const allWordsSet = new Set(allWords);
  const biasHits = AI_BIAS_WORDS.filter((w) => allWordsSet.has(w));
  // Each flagged word is meaningful; 3+ distinct flagged words = strong signal
  const biasVocabScore = clamp(biasHits.length / 3, 0, 1);

  // ── Overall heuristic score: ONLY modern signals count ──
  // Legacy signals (burstiness, vocab diversity, repetition) are unreliable
  // on modern LLMs and are excluded from the overall score.
  const overallHeuristicScore = clamp(
    (hedgingScore * 0.6) + (biasVocabScore * 0.4),
    0,
    1
  );

  // ── Per-sentence scoring ──
  const sentenceScores: SentenceScore[] = sentences.map((sentence, index) => {
    const signals: string[] = [];
    const sLower = sentence.toLowerCase();

    const sHedging = HEDGING_PHRASES.filter((p) => sLower.includes(p));
    if (sHedging.length > 0) signals.push(`hedging: "${sHedging[0]}"`);

    const sBiasWords = AI_BIAS_WORDS.filter((w) => getWords(sentence).includes(w));
    if (sBiasWords.length > 0) signals.push(`AI bias word: "${sBiasWords[0]}"`);

    const sHeuristicScore = clamp(
      (sHedging.length > 0 ? 0.7 : 0) * 0.6 + (sBiasWords.length > 0 ? 0.8 : 0) * 0.4,
      0, 1
    );

    return { text: sentence, index, heuristicScore: sHeuristicScore, signals };
  });

  return {
    burstiScore,
    vocabularyScore,
    repetitionScore,
    hedgingScore,
    biasVocabScore,
    overallHeuristicScore,
    sentenceScores,
    wordCount,
    sentenceCount,
  };
}
