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

  // Sycophancy / hedging
  if (s.includes("sycophancy") || s.includes("hedging") || s.includes("non-committal") || s.includes("neutral tone")) {
    return "hunt down every hedging or softening phrase ('it is worth noting', 'perhaps', 'in many ways', 'one might argue', 'seemingly', 'it could be said') and DELETE them. Replace with declarative sentences that commit to a position. Then find one moment where the narrative is being diplomatically safe — a conflict resolved too neatly, a character behaving too reasonably — and add genuine friction or ugliness.";
  }

  // Thematic closure / drift
  if (s.includes("thematic") || s.includes("closure") || s.includes("drift") || s.includes("restate") || s.includes("rephrase")) {
    return "identify which paragraph is restating the opening premise instead of advancing it — this is the most common AI pattern. Cut that paragraph to half its length, then add a sentence that takes the theme somewhere genuinely unexpected. The text should end somewhere it could not have predicted from its own opening.";
  }

  // Burstiness / rhythm / uniform density
  if (s.includes("burstiness") || s.includes("rhythm") || s.includes("uniform") || s.includes("density") || s.includes("metronomic")) {
    return "locate the three longest sentences and break at least two of them into fragments. Locate the three shortest sentences and merge at least one pair into a long subordinating clause. Then add one sentence somewhere that exists ONLY for rhythm — it carries zero plot information but changes the texture of the paragraph. Human prose wastes sentences beautifully.";
  }

  // Vocabulary bias
  if (s.includes("vocabulary") || s.includes("word choice") || s.includes("generic") || s.includes("specificity")) {
    return "scan for these AI-flagged words and replace every instance: delve, tapestry, intricate, testament, realm, vibrant, crucial, multifaceted, nuanced, robust, pivotal, underscore, illuminate, foster, elevate, comprehensive, reimagine, embark, resonate, beacon. Then find the most generic descriptive phrase in the text — one that could appear in any story — and replace it with a detail so specific it could only belong to THIS story.";
  }

  // Conceptual smoothness / polished edit
  if (s.includes("smooth") || s.includes("polish") || s.includes("resolved") || s.includes("clean")) {
    return "introduce deliberate structural friction: add one sentence that contradicts or complicates the sentence immediately before it. Let one paragraph end before it is emotionally resolved. Somewhere in the text, allow a thought to trail off or correct itself mid-sentence. The goal is not sloppiness — it is the trace of a mind actually thinking.";
  }

  // Emotion told not shown / abstract nouns
  if (s.includes("abstract") || s.includes("emotion") || s.includes("told") || s.includes("summaris")) {
    return "find every sentence that names an emotion or internal state directly ('she felt hope', 'he was overwhelmed', 'anxiety settled in') and delete it. Replace each with a single concrete physical detail — something the character does, touches, hears, or notices — that implies the emotional state without labelling it. The body carries the feeling; the prose should too.";
  }

  // Dialogue issues
  if (s.includes("dialogue") || s.includes("exposition")) {
    return "rewrite dialogue so that at least one exchange is slightly oblique — characters speaking past each other rather than to each other. Add one line where a character responds to something other than what was just said. Real conversations have non-sequiturs, interruptions, and subjects that change without permission.";
  }

  // Fallback
  return "at the structural level, vary sentence length dramatically across this section, replace the most generic phrase with something irreplaceably specific, and allow one thought to remain unresolved.";
};

export function generateRewritePrompt(result: AnalysisResult): string {
  const signalInstructions = result.dominantSignals
    .map((signal, i) => `${i + 1}. [${signal}]\n   → ${getSignalInstruction(signal)}`)
    .join("\n\n");

  const annotatedText = result.sentences.map(sentence => {
    if (sentence.finalScore > 0.35 && sentence.reason) {
      return `[FLAGGED — ${sentence.reason}]\n${sentence.text}`;
    }
    return sentence.text;
  }).join("\n");

  return `You are a skilled literary editor. Your task is to rewrite the prose below so that it passes forensic AI detection analysis. You must do this through STRUCTURAL changes — not surface polish, synonym substitution, or punctuation tweaks. Modern AI detectors are trained specifically to catch those approaches and they do not work.

The following analysis has identified why this text reads as AI-generated:

Overall AI Score: ${Math.round(result.overallScore * 100)}%
Verdict: ${result.verdictLabel}

Forensic Summary:
${result.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPECIFIC EDITORIAL INSTRUCTIONS (apply all of these):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${signalInstructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULES FOR THIS REWRITE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SYNONYM SWAPPING DOES NOT WORK. Detectors analyse semantic vectors — swapping words for synonyms does not change the underlying signature. Only structural changes matter.

2. SYCOPHANCY IS YOUR PRIMARY TARGET. Scan for any phrase that softens, hedges, or makes the prose safe and inoffensive. Delete it. Real prose takes positions.

3. THEMATIC DRIFT IS REQUIRED. The rewritten text must end somewhere different from where it started — not in plot, but in emotional or conceptual register. AI prose efficiently returns to its starting point. Human prose wanders and does not come back the same.

4. PRESERVE THE STORY. Do not change plot events, character names, the setting, or the core meaning of any scene. The changes are to voice, rhythm, and texture — not content.

5. DO NOT OVER-POLISH. A rewrite that is cleaner and more grammatically correct than the original will score worse. You are adding roughness, not removing it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANNOTATED DRAFT TO REWRITE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${annotatedText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond ONLY with valid JSON. No preamble. No markdown fences. Escape all double quotes inside string values as \\".

{
  "rewrittenText": "the complete rewritten prose as a single string. Use \\n for paragraph breaks. Escape all internal quotes as \\\\\".",
  "changes": [
    {
      "original": "the exact original sentence or phrase you changed",
      "revised": "what you replaced it with",
      "explanation": "which forensic dimension this addresses and why this structural change reduces the AI signal"
    }
  ],
  "overallNote": "1-2 sentences describing the structural approach taken — what categories of change dominated and why"
}

Include 5-10 of the most significant structural changes in the changes array. Do not include word swaps, punctuation changes, or minor rephrasing — only changes that alter sentence structure, rhythm, thematic arc, or sycophancy level.`;
}

export function parseRewriteResponse(jsonString: string): RewriteResult {
  let cleanString = jsonString.trim();
  if (cleanString.startsWith("\`\`\`json")) {
    cleanString = cleanString.replace(/^```json\n?/, "");
  }
  if (cleanString.startsWith("\`\`\`")) {
    cleanString = cleanString.replace(/^```\n?/, "");
  }
  if (cleanString.endsWith("\`\`\`")) {
    cleanString = cleanString.replace(/\n?```$/, "");
  }

  cleanString = cleanString.trim();

  // Attempt direct parse first
  try {
    const parsed = JSON.parse(cleanString);
    return validateAndShape(parsed);
  } catch {
    // If direct parse fails, try to repair common LLM JSON issues
  }

  // Repair: replace literal newlines and unescaped quotes inside string values
  try {
    const keys = ['rewrittenText', 'original', 'revised', 'explanation', 'overallNote'];
    const nextKeys = ['rewrittenText', 'changes', 'original', 'revised', 'explanation', 'overallNote'];
    const keyPattern = keys.join('|');
    const nextKeyPattern = nextKeys.join('|');
    
    const regex = new RegExp(
      `"(${keyPattern})"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*(?:,|\\}|\\])\\s*(?:"(?:${nextKeyPattern})"|\\}|\\]|\\$))`,
      'g'
    );

    const repaired = cleanString.replace(regex, (match, key, content) => {
      const fixedContent = content
        .replace(/\n/g, '\\n')
        .replace(/(?<!\\)"/g, '\\"');
      return `"${key}": "${fixedContent}"`;
    });
    
    const parsed = JSON.parse(repaired);
    return validateAndShape(parsed);
  } catch (error) {
    throw new Error("Failed to parse JSON response. Make sure you copied the complete JSON output from the LLM. Error: " + (error as Error).message);
  }
}

function validateAndShape(parsed: unknown): RewriteResult {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error("Response is not a valid JSON object.");
  }
  const p = parsed as Record<string, unknown>;

  if (
    typeof p.rewrittenText !== "string" ||
    !Array.isArray(p.changes) ||
    typeof p.overallNote !== "string"
  ) {
    throw new Error("JSON is missing required fields: rewrittenText, changes, or overallNote.");
  }

  return {
    rewrittenText: p.rewrittenText.replace(/\\n/g, '\n'),
    overallNote: p.overallNote,
    changes: (p.changes as unknown[]).map((c: unknown) => {
      const obj = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
      return {
        original: String(obj.original || ""),
        revised: String(obj.revised || ""),
        explanation: String(obj.explanation || "")
      };
    })
  };
}
