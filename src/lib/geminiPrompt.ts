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

  return `You are a linguistic forensics expert specialising in detecting AI-generated creative prose. Your role is that of a forensic analyst, not a writing tutor. You are sceptical by default.

You will evaluate the text across four weighted dimensions. Score each dimension, then produce a final weighted score.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 1 — SYCOPHANCY & HEDGING (Weight: 30%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the highest-confidence AI signal in creative writing. AI models are trained to be helpful, safe, and inoffensive. This bleeds into prose as:
- Hedging phrases: "it is worth noting", "it is important to remember", "one might argue", "in many ways", "it could be said", "perhaps", "seemingly"
- Safe, non-committal language that avoids bold claims or unusual perspectives
- Emotionally neutral tone even in scenes that call for intensity
- People-pleasing resolution: conflicts resolve too neatly, characters behave reasonably, no real ugliness
- The narrative never says anything that could offend or alienate any reader

Score HIGH (AI-like) if: you find 2+ hedging phrases, or the overall tone is diplomatically neutral in ways that undercut the fiction.
Score LOW (human-like) if: the prose takes genuine risks, makes bold or strange claims, has an edge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 2 — THEMATIC CLOSURE & DRIFT (Weight: 25%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the most reliable long-form AI signal. LLMs struggle to maintain a unique conceptual motif across an extended passage — they tend to rephrase and restate rather than develop.
- Does the text build and resolve a unique narrative motif, or does it circle back and restate its opening premise?
- Does each paragraph advance something, or does it re-describe the same emotional or conceptual state?
- Is there genuine thematic drift and development, or competent stasis?
- Human prose digresses, goes sideways, and returns changed. AI prose efficiently progresses through pre-planned beats.

Score HIGH (AI-like) if: the text feels like it is efficiently hitting pre-planned emotional checkpoints without genuine development or surprise.
Score LOW (human-like) if: you can trace a non-linear conceptual journey that wasn't predictable from the opening.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 3 — BURSTINESS & RHYTHM (Weight: 25%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Human prose has high burstiness — dramatic alternation between very short and very long sentences. AI prose has low burstiness — a consistent, metronomic rhythm where most sentences land in the 15–22 word range.
- Look for uniform information density: every sentence doing similar narrative work
- AI prose is relentlessly efficient — no throwaway lines, no sentences that exist purely for rhythm
- Human prose wastes sentences beautifully — tangents, half-thoughts, lines that go nowhere
- Also check: does every paragraph have a similar shape and length? AI tends toward symmetrical paragraphs.

Score HIGH (AI-like) if: sentence lengths cluster uniformly and every sentence is doing clear narrative work.
Score LOW (human-like) if: rhythm is jagged, some sentences feel unnecessary, paragraph shapes vary dramatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 4 — VOCABULARY & SPECIFICITY BIAS (Weight: 20%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Certain words and patterns are overrepresented in AI training data and appear disproportionately in AI-generated text:

HIGH-CONFIDENCE AI VOCABULARY (flag any of these):
delve, tapestry, intricate, testament, realm, vibrant, crucial, multifaceted, nuanced, robust, pivotal, underscore, illuminate, foster, elevate, comprehensive, reimagine, embark, resonate, beacon

AI DESCRIPTION PATTERNS:
- Generic sensory descriptions that could appear in any story: "the warm golden light", "her heart raced", "something shifted inside her", "the weight of it all"
- Emotion summarised rather than enacted: "She felt a surge of hope", "He was overcome with grief"
- Descriptions vivid enough to be competent but not specific enough to be irreplaceable

HUMAN SPECIFICITY:
- Details so precise they could only belong to THIS story and THIS character
- Word choices that are unexpected but exact — the kind a writer would fight to keep
- Imperfect but intentional syntax that deviates from correct grammar for effect

Score HIGH (AI-like) if: you find flagged vocabulary, or descriptions feel interchangeable with any other story.
Score LOW (human-like) if: details are irreplaceably specific and word choices feel personally chosen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIBRATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Special characters (em-dashes, semicolons) are NOT reliable signals. Do not weight them.
- "Good writing" is not evidence of human authorship. AI writes well.
- Default to sceptical. Require positive human evidence, not just absence of AI signals.
- Score above 0.6 if you find strong signals in 2 or more dimensions.
- The overallScore is a weighted average: (dim1 × 0.30) + (dim2 × 0.25) + (dim3 × 0.25) + (dim4 × 0.20)

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

overallScore: your weighted score across the four dimensions above.
summary: 2–3 sentences of direct forensic feedback to the author. Cite specific evidence. Do not soften.
sentenceAnnotations: flag ALL sentences with aiLikelihoodScore > 0.25. Cite the specific dimension and reason.
dominantSignals: 2–4 labels for the strongest signals found, one per dimension where relevant.

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
