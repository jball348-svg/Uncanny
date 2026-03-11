import { AnalysisResult } from "./aggregator";

export type RewriteResult = {
  rewrittenText: string;
  changes: Array<{
    original: string;
    revised: string;
    explanation: string;
  }>;
  overallNote: string;
};

const getSignalInstruction = (signal: string): string => {
  const s = signal.toLowerCase();
  if (s.includes("em-dash overuse")) {
    return "replace em-dash parentheticals with stronger sentence construction";
  }
  if (s.includes("conceptual smoothness")) {
    return "introduce deliberate roughness: a contradiction, an incomplete thought, a sentence that veers off and corrects itself";
  }
  if (s.includes("summarising emotion") || s.includes("abstract noun")) {
    return "replace with a concrete physical action or image";
  }
  if (s.includes("competence without personality")) {
    return "add one genuinely odd or unexpected word choice per paragraph";
  }
  if (s.includes("transitions")) {
    return "make paragraph transitions less clean, add jump cuts or slight disorientation";
  }
  if (s.includes("metaphors")) {
    return "push metaphors further so they are surprising rather than merely apt, or remove them";
  }
  if (s.includes("narrative voice")) {
    return "allow the narrative voice to shift register occasionally, imitating how real human thought patterns fluctuate";
  }
  if (s.includes("dialogue")) {
    return "ensure characters speak for their own benefit, not as exposition delivery for the reader";
  }
  // Fallback
  return "rework to sound more idiosyncratic and distinctly human";
};

export function generateRewritePrompt(result: AnalysisResult): string {
  const signalInstructions = result.dominantSignals
    .map(signal => `- "${signal}" → ${getSignalInstruction(signal)}`)
    .join("\n");

  const annotatedText = result.sentences.map(sentence => {
    if (sentence.finalScore > 0.35 && sentence.reason) {
      return `[FLAGGED: ${sentence.reason}] ${sentence.text}`;
    }
    return sentence.text;
  }).join("\n");

  return `You are a skilled literary editor whose job is to make AI-generated prose read more authentically human, without changing the story, characters, or meaning.

Uncanny Analysis Result
Overall Score: ${Math.round(result.overallScore * 100)}%
Verdict: ${result.verdictLabel}

Summary:
${result.summary}

Editorial Notes to Address:
${signalInstructions}

Annotated Draft:
${annotatedText}

Rewrite the prose above to read as more authentically human, applying the editorial notes. Do not change the plot, characters, setting, or core meaning. Make the voice feel lived-in and specific rather than competently generic.

Respond ONLY with valid JSON in this exact shape — no preamble, no markdown fences. IMPORTANT: properly escape all double quotes inside your string values (e.g. use \\" for dialogue):
{
  "rewrittenText": "the full rewritten prose as a single string",
  "changes": [
    {
      "original": "the original sentence or phrase",
      "revised": "what you changed it to",
      "explanation": "why this makes it read more human"
    }
  ],
  "overallNote": "1-2 sentences summarising the editorial approach taken"
}

Include 5-10 of the most significant changes in the changes array. Do not list every single edit — only the meaningful ones.`;
}

export function parseRewriteResponse(jsonString: string): RewriteResult {
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
      typeof parsed.rewrittenText !== "string" ||
      !Array.isArray(parsed.changes) ||
      typeof parsed.overallNote !== "string"
    ) {
      throw new Error("JSON missing required base fields.");
    }

    return {
      rewrittenText: parsed.rewrittenText,
      overallNote: parsed.overallNote,
      changes: parsed.changes.map((c: any) => ({
        original: String(c.original || ""),
        revised: String(c.revised || ""),
        explanation: String(c.explanation || "")
      }))
    };
  } catch (error) {
    throw new Error("Failed to parse or validate JSON response: " + (error as Error).message);
  }
}
