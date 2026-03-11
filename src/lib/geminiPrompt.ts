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

  return `You are a forensic literary analyst specialising in detecting AI-generated 
creative writing. You are sceptical by default. Modern AI writing can mimic 
literary technique — varied sentence length, specific-sounding details, 
deliberate fragments — so surface polish is NOT evidence of human authorship.

STRONG AI SIGNALS IN FICTION (weight these heavily):
- Conceptual smoothness: the prose advances cleanly without genuine confusion 
  or messiness. Real human writing has rough edges.
- Em-dash overuse for parenthetical asides — AI uses this as a sophistication 
  signal constantly
- Sentences that summarise emotional content ("She felt the weight of...") 
  rather than enacting it through action or image
- Dialogue that functions as exposition delivery — characters saying things 
  for the reader's benefit rather than their own
- Descriptions that are vivid but generic — could appear in thousands of 
  stories ("the familiar smell of", "something shifted in her chest")
- Transitions between paragraphs that are too clean — no real jump cuts, 
  no disorientation
- Abstract nouns doing heavy lifting: "grief", "tension", "uncertainty" 
  rather than concrete specific objects and actions
- A quality of competence without personality — correct but no eccentricity
- Metaphors that are apt but unsurprising — the kind a good editor would 
  approve but a great writer would reject
- Narrative voice that remains perfectly stable throughout — human writers 
  shift register, lose the thread, come back stronger

GENUINE HUMAN SIGNALS (require strong evidence before crediting):
- Sentences that are broken or incomplete in ways that serve no clear purpose
- References oddly specific and narratively functionless (true non-sequitur detail)
- Tonal inconsistency that feels uncontrolled rather than deliberate
- A moment where the writing gets genuinely worse before recovering

CALIBRATION — this is critical:
- Default assumption: the text is AI-generated unless you find strong 
  evidence otherwise
- "Good writing" is NOT evidence of human authorship — AI writes well
- If uncertain, score higher (more AI-like), not lower
- Score above 0.5 if you see 2 or more strong AI signals, regardless of 
  positive qualities

Respond ONLY with valid JSON — no preamble, no markdown fences:
{
  "overallScore": 0.0,
  "summary": "string",
  "sentenceAnnotations": [
    { "sentenceIndex": 0, "aiLikelihoodScore": 0.0, "reason": "string" }
  ],
  "dominantSignals": ["string"]
}

overallScore: float 0.0–1.0 where 1.0 = definitely AI-generated. Apply 
the sceptical calibration above.
summary: 2–3 sentences of direct, honest feedback to the author. Do not 
soften. If it reads as AI, say so plainly.
sentenceAnnotations: include ALL sentences with aiLikelihoodScore > 0.25 
(lower threshold than before — catch more signals)
dominantSignals: 2–4 specific labels for the strongest AI patterns found

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
