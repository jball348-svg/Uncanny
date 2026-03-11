export type GeminiSentenceAnnotation = {
  sentenceIndex: number;
  aiLikelihoodScore: number;
  reason: string;
};

export type GeminiAnalysisResult = {
  overallScore: number; // 0.0 - 1.0
  summary: string;
  sentenceAnnotations: GeminiSentenceAnnotation[];
  dominantSignals: string[];
};

export function generateGeminiPrompt(text: string, sentences: string[]): string {
  const numberedSentences = sentences
    .map((s, i) => `${i}: ${s}`)
    .join("\n");

  return `You are a linguistic forensics expert tasked with detecting AI-generated creative prose. You must complete this analysis in TWO MANDATORY PASSES before producing your final score.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL SELF-WARNING: YOU ARE AN LLM EVALUATING LLM TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have a known systematic blind spot: patterns that LLMs generate well feel like "good writing" to you, so you misread them as human. You must actively counteract this.

INADMISSIBLE AS HUMAN EVIDENCE — AI produces all of these intentionally:
- Sentence length variation and deliberate fragments
- Details that sound specific (named objects, incidents, places) — formulaic specificity
- Cynical, world-weary, or self-aware narrative voice
- Thematic development and apparent non-linear structure
- Absence of hedging phrases — most fiction prompts produce AI text without hedging
- Literary quality in general

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASS 1 — PROSECUTION CASE (argue AI authorship)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before anything else, steelman the AI case. Look for:

1. SYNTACTIC MONOTONY
This is one of the most reliable AI signals and the one most commonly missed. Modern AI varies sentence LENGTH but defaults to a limited palette of sentence STRUCTURES. Examine the grammatical patterns:
- How many sentences follow Subject→Verb→Object order with no inversion or deviation?
- How many are simple declaratives with no subordination, apposition, or syntactic risk?
- Are cause-and-effect constructions repeated? ("Since X, Y", "Because X, Y", "As X, Y")
- Is there a lack of inverted syntax, rhetorical questions, or mid-sentence pivots?
Human writers develop idiosyncratic syntactic habits. AI defaults to grammatically safe, predictable structure even when sentence lengths vary. Count how many sentences in this text follow the same basic grammatical template.

2. SPECULATIVE LANGUAGE IN CHARACTER THOUGHT
This is a specific AI fiction tell identified by professional detection systems. When AI writes interior monologue or character observation, it introduces speculative/uncertain language even in contexts where a human narrator would simply state:
- "wondering if...", "or if...", "or maybe...", "perhaps..."
- Sentences that trail off with uncertainty ("or if—") rather than arriving somewhere
- Characters whose thoughts are framed as open questions rather than convictions
Human interiority tends toward assertion, however wrong. AI interiority hedges even within fiction.

3. ABSENCE OF LITERARY DEVICES
AI prose is often "mechanical" — it describes events and states competently but relies on declarative statement rather than literary technique. Examine:
- Are there genuine metaphors or similes, or is everything stated directly?
- Is personification or synesthesia used, or only literal description?
- Does imagery work by compression and suggestion, or by explicit statement?
- Is the prose doing more than one thing at once in any sentence?
Mechanical precision — correct, clear, unadorned — is an AI signature in fiction.

4. NARRATIVE EFFICIENCY & TONAL CONTROL
- Does every element serve a clear narrative purpose? AI writing is goal-directed.
- Is the tone perfectly maintained throughout, or does it slip and recover?
- Does anything here feel genuinely out of control, or is all the roughness managed?

5. EMOTIONAL SAFETY
- Does the text stay within a range a general audience would find admirable?
- AI is RLHF-trained toward palatability. Genuine human darkness is often uncomfortable.

Score: what probability of AI authorship does this evidence suggest?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASS 2 — DEFENCE CASE (argue human authorship)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Now argue FOR human authorship using only ADMISSIBLE evidence:

ADMISSIBLE HUMAN SIGNALS:
- Syntactic inversions, appositions, or structures so idiosyncratic they feel authored not generated
- A passage genuinely worse than surrounding prose — the author losing the thread
- A detail so oddly specific it serves no narrative function and could embarrass the author
- A tonal shift that is clearly uncontrolled
- An unresolved thread never paid off
- Literary devices used in a way that is unexpected, strained, or imperfect — as opposed to absent
- Speculative interiority that asserts rather than hedges ("She knew it was wrong" not "She wondered if it was wrong")

INADMISSIBLE (do not use):
- Sentence length variation
- Seemingly specific details
- Cynical or self-aware voice
- Thematic development
- Absence of hedging
- Writing quality

Score: what probability of AI authorship does the admissible defence evidence suggest?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SCORING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Strong prosecution + defence relies only on inadmissible evidence → 0.75–1.0
- Strong prosecution + some admissible defence evidence → 0.55–0.75
- Both cases balanced with admissible evidence → 0.40–0.55
- Weak prosecution + strong admissible defence → 0.15–0.40
- Uncertain, cannot find strong admissible human evidence → DEFAULT 0.60
- Score below 0.30 REQUIRES citing two pieces of admissible human evidence in your summary
- Special characters (em-dashes, semicolons) are not signals either way
- Score is NOT a quality judgement. Excellent writing is often AI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond ONLY with valid JSON — no preamble, no markdown fences:
{
  "overallScore": 0.0,
  "summary": "string",
  "sentenceAnnotations": [
    { "sentenceIndex": 0, "aiLikelihoodScore": 0.0, "reason": "string" }
  ],
  "dominantSignals": ["string"]
}

overallScore: 0.0–1.0 where 1.0 = definitely AI. Apply mandatory scoring rules.
summary: 2–3 sentences citing specific structural evidence. For each claim, name the sentence or passage. Do not mention writing quality. If scoring below 0.30, name your two admissible human evidence items explicitly.
sentenceAnnotations: flag ALL sentences with aiLikelihoodScore > 0.25. For each, cite which prosecution signal applies — syntactic monotony, speculative interiority, absent literary devices, emotional safety, or narrative efficiency.
dominantSignals: 2–4 labels for the strongest signals found across both passes.

Here is the document to analyse.

<DOCUMENT>
${text}
</DOCUMENT>

<NUMBERED_SENTENCES>
${numberedSentences}
</NUMBERED_SENTENCES>`;
}

export function parseGeminiResponse(jsonString: string): GeminiAnalysisResult {
  let cleanString = jsonString.trim();
  if (cleanString.startsWith("\`\`\`json")) {
    cleanString = cleanString.replace(/^```json/, "");
  }
  if (cleanString.startsWith("\`\`\`")) {
    cleanString = cleanString.replace(/^```/, "");
  }
  if (cleanString.endsWith("\`\`\`")) {
    cleanString = cleanString.replace(/```$/, "");
  }

  cleanString = cleanString.trim();

  try {
    const parsed = JSON.parse(cleanString);

    if (
      typeof parsed.overallScore !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.sentenceAnnotations) ||
      !Array.isArray(parsed.dominantSignals)
    ) {
      throw new Error("JSON missing required base fields.");
    }

    return {
      overallScore: parsed.overallScore,
      summary: parsed.summary,
      sentenceAnnotations: parsed.sentenceAnnotations.map((a: unknown) => {
        if (typeof a !== 'object' || a === null) return { sentenceIndex: 0, aiLikelihoodScore: 0, reason: "" };
        const obj = a as Record<string, unknown>;
        return {
          sentenceIndex: typeof obj.sentenceIndex === "number" ? obj.sentenceIndex : parseInt(obj.sentenceIndex as string, 10) || 0,
          aiLikelihoodScore: typeof obj.aiLikelihoodScore === "number" ? obj.aiLikelihoodScore : parseFloat(obj.aiLikelihoodScore as string) || 0,
          reason: (obj.reason as string) || "No reason provided",
        };
      }),
      dominantSignals: parsed.dominantSignals.map((s: unknown) => String(s)),
    };
  } catch (error) {
    throw new Error("Failed to parse or validate JSON response: " + (error as Error).message);
  }
}
