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

  const sentenceCount = sentences.length;

  const annotationExpectation = sentenceCount <= 30
    ? `This text has ${sentenceCount} sentences. Annotate every sentence above the threshold — do not stop early.`
    : sentenceCount <= 100
    ? `This text has ${sentenceCount} sentences. You are expected to return many annotations — likely 20 or more. Do not self-censor or stop early to save output length. Keep each reason under 12 words.`
    : `This text has ${sentenceCount} sentences. You MUST annotate comprehensively. Return annotations for every sentence above the threshold even if that means 50+ entries. Keep each reason to 8–12 words maximum to manage output length. Truncating your annotations is a failure of the analysis.`;

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
Modern AI varies sentence LENGTH but defaults to a limited palette of sentence STRUCTURES. Examine:
- How many sentences follow Subject→Verb→Object order with no inversion or deviation?
- How many are simple declaratives with no subordination, apposition, or syntactic risk?
- Are cause-and-effect constructions repeated? ("Since X, Y", "Because X, Y", "As X, Y")
- Is there a lack of inverted syntax, rhetorical questions, or mid-sentence pivots?
Human writers develop idiosyncratic syntactic habits. AI defaults to grammatically safe, predictable structure even when sentence lengths vary.

2. SPECULATIVE LANGUAGE IN CHARACTER THOUGHT
When AI writes interior monologue, it introduces speculative/uncertain language even where a human narrator would simply state:
- "wondering if...", "or if...", "or maybe...", "perhaps..."
- Sentences that trail off with uncertainty rather than arriving somewhere
- Characters whose thoughts are framed as open questions rather than convictions
Human interiority tends toward assertion, however wrong. AI interiority hedges even within fiction.

3. ABSENCE OF LITERARY DEVICES
AI prose describes events competently but relies on declarative statement rather than literary technique:
- Are there genuine metaphors or similes, or is everything stated directly?
- Does imagery work by compression and suggestion, or by explicit statement?
- Is the prose doing more than one thing at once in any sentence?
Mechanical precision — correct, clear, unadorned — is an AI signature in fiction.

4. TECHNICAL PRECISION AS LITERARY LANGUAGE
This is a strong AI signal identified by professional detection systems. AI frequently reaches for technical or clinical vocabulary when describing things that should feel sensory, physical, or emotional. Look for:
- Compound technical nouns used as metaphors or scene description (e.g. "acoustic architecture", "clinical boundaries", "managed absence", "acoustic friction", "thermal signature")
- Abstract nouns borrowed from technical fields used to carry emotional weight ("scaffolding", "framework", "precision", "parameters", "trajectory", "mechanism")
- Sentences where a human writer would use a sensory detail but the AI uses a technical label
This pattern appears because AI draws on encyclopedic/technical training data even when writing literary fiction. The result is prose that sounds intelligent but reads as written by someone who knows the word for the thing rather than someone who has felt it.

5. RICH YET SHALLOW — vocabulary without emotional spontaneity
AI prose often has sophisticated, varied vocabulary that nonetheless feels airless. Signs of this pattern:
- Rich descriptive words that are correct and precise but don't feel chosen by a specific human sensibility
- Metaphors or images that are technically accomplished but feel assembled rather than discovered
- Language that demonstrates knowledge of how literary prose works without the heat of a particular consciousness behind it
- No phrase that could embarrass the author by being too personal, too odd, or too wrong
Contrast with: prose that risks a specific image that might not work, or uses a word that reveals something about the writer.

6. EM-DASH OVERUSE
A weak but real signal. Examine whether em-dashes are used as a structural habit rather than a deliberate stylistic choice:
- More than one em-dash per sentence is suspicious
- Em-dashes used to tack on explanatory phrases rather than to create genuine pause or pivot
- A consistent pattern of em-dash usage across many sentences suggests template-following
Note: one or two em-dashes in a whole text is not a signal. It only becomes one when the pattern is repetitive.

7. NARRATIVE EFFICIENCY & EMOTIONAL SAFETY
- Does every element serve a clear narrative purpose? AI writing is goal-directed.
- Is the tone perfectly maintained throughout, never slipping?
- Does the text stay within a range a general audience would find acceptable?
- AI is RLHF-trained toward palatability. Genuine human darkness is often uncomfortable.

Score: what probability of AI authorship does this evidence suggest?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASS 2 — DEFENCE CASE (argue human authorship)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Now argue FOR human authorship using only ADMISSIBLE evidence:

ADMISSIBLE HUMAN SIGNALS:
- Syntactic inversions or structures so idiosyncratic they feel authored not generated
- A passage genuinely worse than surrounding prose — the author losing the thread
- A detail so oddly specific it serves no narrative function and could embarrass the author
- A tonal shift that is clearly uncontrolled
- An unresolved thread never paid off
- Literary devices that are unexpected, strained, or imperfect — rather than absent or polished
- Sensory or physical language that is too specific and personal to feel generated
- Speculative interiority that asserts rather than hedges ("She knew it was wrong" not "She wondered if it was wrong")

INADMISSIBLE (do not use):
- Sentence length variation
- Seemingly specific details
- Cynical or self-aware voice
- Thematic development
- Absence of hedging
- Writing quality
- Vocabulary richness or range

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
- Em-dash count alone is NOT sufficient for a high score — it must accompany other signals
- Score is NOT a quality judgement. Excellent writing is often AI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${annotationExpectation}

ANNOTATION RULES — read carefully:
- Score every sentence in the numbered list, not just the ones you find most interesting
- Flag ALL sentences with aiLikelihoodScore > 0.20
- Do NOT stop annotating partway through the text because the output is getting long
- Do NOT skip sentences to save space — a missing annotation is a missing data point for the author
- Keep each "reason" field to 8–12 words maximum: name the signal type and one specific observation
- Example reason formats:
  "Syntactic monotony: plain S-V-O, no structural risk"
  "Speculative interiority: hedges with 'wondered if' not assertion"
  "Absent literary device: direct statement, no compression or image"
  "Technical-as-literary: clinical noun carrying emotional weight"
  "Rich yet shallow: precise vocabulary, no personal sensibility behind it"
  "Em-dash: explanatory tack-on, not deliberate pause"
  "Narrative efficiency: every clause drives toward predetermined beat"

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
summary: cite specific structural evidence from both passes — as many sentences as needed to cover the dominant signals found. Name specific passages or sentence numbers where possible. Do not mention writing quality. If scoring below 0.30, explicitly name two admissible human evidence items.
sentenceAnnotations: comprehensive annotation of every sentence above the threshold — do not truncate.
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
  if (cleanString.startsWith("`\`\`json")) {
    cleanString = cleanString.replace(/^```json/, "");
  }
  if (cleanString.startsWith("`\`\`")) {
    cleanString = cleanString.replace(/^```/, "");
  }
  if (cleanString.endsWith("`\`\`")) {
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
