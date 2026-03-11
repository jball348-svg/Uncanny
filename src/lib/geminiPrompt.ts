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

  return `You are a linguistic forensics expert tasked with detecting AI-generated creative prose. You must complete this analysis in TWO MANDATORY PASSES before producing your final score. Skipping either pass will produce an invalid result.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL SELF-WARNING: YOU ARE AN LLM EVALUATING LLM TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have a known systematic blind spot: you tend to perceive patterns that LLMs generate well as evidence of human authorship, because they resemble what you consider "good writing". You must actively counteract this bias.

Specifically: you will be tempted to credit the following as human signals. YOU MUST RESIST ALL OF THEM — modern LLMs produce all of these deliberately:

- SPECIFICITY ILLUSION: AI generates details that sound irreplaceably specific ("the incident with the peer reviewer", a named street, an unusual object) but are actually formulaic specificity — the kind of detail an AI inserts to signal authenticity. True human specificity is accidental and serves no signalling function. Ask: does this detail exist to prove the author is human, or does it exist because the author couldn't imagine the scene without it?

- BURSTINESS ILLUSION: Modern LLMs vary sentence length intentionally when prompted for literary fiction. Fragments and very short sentences are a known AI technique for mimicking human voice, not evidence of it.

- THEMATIC DRIFT ILLUSION: LLMs can simulate non-linear narrative development and "character revelation" convincingly. The appearance of thematic drift is not evidence of human authorship.

- CYNICAL VOICE ILLUSION: A world-weary, cynical, or self-deprecating narrative voice is a common LLM stylistic choice when generating literary fiction. It is not evidence of human experience.

- ABSENCE OF HEDGING: A text can be free of hedging phrases and still be AI-generated. Most fiction prompts will produce AI text without hedging. Absence of hedging is weak evidence at best.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASS 1: BUILD THE PROSECUTION CASE (AI authorship)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before any other analysis, you must steelman the argument that this text is AI-generated. Find the strongest possible evidence FOR AI authorship. Consider:

1. NARRATIVE EFFICIENCY: Does every paragraph advance toward a clear emotional or thematic destination? AI writing is goal-directed — it moves efficiently toward pre-planned beats. Human writing meanders, backtracks, and arrives somewhere unexpected even to the author.

2. COMPETENT RESOLUTION: Are the conflicts, character emotions, and scene endings resolved with appropriate craft? AI writing is competent in a way that feels produced rather than discovered. Look for moments where a human writer would have gotten stuck, been ugly, or failed — and notice if this text never does.

3. PERFORMED AUTHENTICITY: Does the text seem to be demonstrating human-ness rather than simply being written? Signs of performed authenticity include: unusual details that exist primarily to signal "realness", deliberate stylistic roughness that is actually quite controlled, cynicism or edge that feels calculated.

4. TONAL CONSISTENCY: Is the narrative voice perfectly maintained throughout? Human writers lose control of tone. They slip into different registers, contradict their own stylistic choices, or have passages that are noticeably weaker than others. Perfect tonal consistency is an AI signature.

5. EMOTIONAL SAFETY: Even in cynical or dark prose, does the text ultimately stay within a range that a general audience would find acceptable and even admirable? AI writing is RLHF-trained to be ultimately palatable. Genuine human darkness is often uncomfortable in ways that make readers want to put the book down.

Rate your confidence in the prosecution case: what score would you assign based solely on this evidence?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASS 2: BUILD THE DEFENCE CASE (human authorship)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Now make the strongest possible case FOR human authorship. But apply these strict evidence standards:

ADMISSIBLE HUMAN EVIDENCE (strong):
- A passage that is genuinely worse than the surrounding prose in a way that suggests the author lost the thread
- A syntactic choice so personal and strange that no prompt could have generated it
- A detail that is so oddly specific it serves NO narrative function and could embarrass the author
- A tonal shift that is clearly uncontrolled rather than deliberate
- An unresolved thread that goes nowhere and is never paid off

INADMISSIBLE EVIDENCE (do not use — AI produces all of these):
- Sentence length variation and fragments
- Seemingly specific proper nouns, incidents, or details
- A cynical, world-weary, or self-aware narrative voice
- Thematic development and non-linear structure
- Absence of hedging phrases
- "Good" or "literary" writing quality

Rate your confidence in the defence case: what score would you assign based solely on admissible evidence?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SCORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Combine your two passes. Apply these mandatory rules:

- If the prosecution case is strong and the defence case relies only on inadmissible evidence: score 0.75–1.0
- If the prosecution case is strong but the defence has some admissible evidence: score 0.55–0.75
- If both cases are genuinely balanced with admissible evidence on both sides: score 0.40–0.55
- If the defence case has strong admissible evidence and the prosecution case is weak: score 0.15–0.40
- If you are uncertain and cannot find strong admissible human evidence: DEFAULT to 0.60. Uncertainty favours the prosecution.

ADDITIONAL CALIBRATION:
- Special characters (em-dashes, semicolons) are not signals either way. Ignore them.
- The overall score is NOT a literary quality score. Excellent writing can be AI. Poor writing can be human.
- A score below 0.30 requires you to cite at least two pieces of ADMISSIBLE human evidence.

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

overallScore: your final score 0.0–1.0 where 1.0 = definitely AI. Apply the mandatory scoring rules above.
summary: 2–3 sentences citing specific structural evidence from both passes. Name the admissible evidence that determined your verdict. Do not mention writing quality.
sentenceAnnotations: flag ALL sentences with aiLikelihoodScore > 0.25. Cite the specific prosecution or defence signal.
dominantSignals: 2–4 labels identifying the strongest signals, drawn from BOTH passes.

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
