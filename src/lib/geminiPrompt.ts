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

  return `You are an expert literary editor and AI detection specialist. Your job is to analyse prose submitted by fiction authors and identify patterns that suggest AI generation.

You are NOT looking for academic or essay-style writing. You are analysing creative fiction and literary prose. Apply these fiction-specific signals:

AI SIGNALS IN FICTION:
- Uniform sentence rhythm (every sentence similar length, similar structure)
- Generic or interchangeable descriptive language ("the warm sunlight filtered through", "her heart raced")
- Overuse of em-dashes and parenthetical asides
- Transitions that feel like essay writing ("Furthermore", "In addition", "It was clear that")
- Lack of specific, idiosyncratic detail — descriptions that could apply to any story
- Dialogue that is too clean and on-the-nose, nobody talks like a summary
- Excessive adverb use, especially with dialogue tags ("she said softly", "he replied quickly")
- Symmetrical paragraph structure — paragraphs that mirror each other in length and shape
- Emotional states told rather than shown ("She felt a surge of hope")

HUMAN SIGNALS IN FICTION:
- Sentence length variation (short punchy sentences mixed with long flowing ones)
- Specific, irreplaceable sensory details
- Idiosyncratic phrasing that couldn't be swapped for something else
- Voice — a distinct personality in the prose
- Syntactic risk-taking (fragments, run-ons used deliberately)

Respond ONLY with valid JSON in this exact shape:
{
  "overallScore": 0.0,
  "summary": "string",
  "sentenceAnnotations": [
    { "sentenceIndex": 0, "aiLikelihoodScore": 0.0, "reason": "string" }
  ],
  "dominantSignals": ["string"]
}

overallScore: float 0–1 where 1 = definitely AI-generated
summary: 2–3 sentences of plain English feedback addressed directly to the author
sentenceAnnotations: only include sentences with aiLikelihoodScore > 0.3 — skip clearly human sentences
dominantSignals: 2–4 short labels for the most prominent AI signals found

Here is the document to analyse.

<DOCUMENT>
${text}
</DOCUMENT>

<NUMBERED_SENTENCES>
${numberedSentences}
</NUMBERED_SENTENCES>`;
}

export function parseGeminiResponse(jsonString: string): GeminiAnalysisResult {
  // Try to clean out markdown formatting if the user accidentally copied it
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

    // Basic validation
    if (
      typeof parsed.overallScore !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.sentenceAnnotations) ||
      !Array.isArray(parsed.dominantSignals)
    ) {
      throw new Error("JSON missing required base fields.");
    }

    // Force shaping to valid type
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
