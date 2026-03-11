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

  // ── Syntactic monotony / predictable structure ──────────────────────────────
  // Matches: "syntactic monotony", "predictable syntax", "declarative",
  // "tripartite", "sentence structure", "grammatical"
  if (
    s.includes("syntactic") || s.includes("syntax") ||
    s.includes("monotony") || s.includes("monoton") ||
    s.includes("declarative") || s.includes("tripartite") ||
    s.includes("grammatical") || s.includes("sentence structure") ||
    s.includes("structural") || s.includes("repetitive structure")
  ) {
    return "the problem is grammatical structure, not sentence length. Identify the dominant sentence template being repeated (e.g. Subject→Verb→Object, or 'Since X, Y'). Then restructure at least three sentences to break that template: use an appositive phrase, invert the subject and predicate, begin a sentence mid-thought with a participle, or use a rhetorical question. Also add one syntactically risky construction — a run-on held together by intention rather than grammar, or a fragment that isn't trying to look literary.";
  }

  // ── Speculative / hedged interiority ────────────────────────────────────────
  // Matches: "speculative", "hedged", "hedging", "wondering", "uncertain",
  // "interior", "interiority", "perhaps", "speculative focus"
  if (
    s.includes("speculat") || s.includes("hedg") ||
    s.includes("wondering") || s.includes("uncertain") ||
    s.includes("interior") || s.includes("perhaps") ||
    s.includes("speculative focus") || s.includes("uncertain language")
  ) {
    return "find every sentence where a character is 'wondering', 'thinking perhaps', 'considering whether', or expressing interior thought as an open question. Rewrite each so the character ASSERTS rather than speculates — even if the assertion is wrong, provisional, or immediately contradicted. Change 'she wondered if the numbers meant something' to 'the numbers meant something. She was sure of it, which was the problem.' Also remove any sentence that trails off with 'or if—' or similar — either complete the thought or cut it entirely.";
  }

  // ── Literary devices / mechanical writing ───────────────────────────────────
  // Matches: "literary device", "mechanical", "metaphor", "formulaic",
  // "imagery", "associative", "figurative"
  if (
    s.includes("literary device") || s.includes("mechanical") ||
    s.includes("metaphor") || s.includes("formulaic") ||
    s.includes("imagery") || s.includes("associative") ||
    s.includes("figurative") || s.includes("simile") ||
    s.includes("imaginative") || s.includes("literal description")
  ) {
    return "the prose is describing events directly rather than through image or compression. Add at least two literary devices that are unexpected rather than decorative: a simile that is strained or slightly wrong in a productive way, a moment of personification applied to something that resists it, or a sentence that does two things simultaneously — describes an object while revealing a character state. The device should feel chosen, not inserted. Avoid metaphors that explain themselves.";
  }

  // ── Narrative efficiency / no unpredictability ──────────────────────────────
  // Matches: "narrative efficiency", "efficiency", "predictable", "pre-planned",
  // "goal-directed", "beats", "unpredictab"
  if (
    s.includes("efficiency") || s.includes("efficient") ||
    s.includes("predictab") || s.includes("pre-planned") ||
    s.includes("goal-direct") || s.includes("beats") ||
    s.includes("unpredictab") || s.includes("narrative arc")
  ) {
    return "every element in this text is doing assigned narrative work. Add one element that doesn't: a detail that is noticed and then dropped, a paragraph that sets up something and never pays it off, or a character observation that is irrelevant to the scene's purpose. Then find the moment where the narrative is most clearly heading toward its predetermined destination and derail it slightly — add a hesitation, a wrong turn, a sentence that is interested in something the scene isn't supposed to be about.";
  }

  // ── Tonal consistency / performed authenticity ──────────────────────────────
  // Matches: "tonal", "tone", "performed", "authenticity", "consistent voice",
  // "controlled", "managed"
  if (
    s.includes("tonal") || s.includes("tone") ||
    s.includes("performed") || s.includes("authenticit") ||
    s.includes("consistent voice") || s.includes("voice control") ||
    s.includes("managed roughness")
  ) {
    return "the narrative voice is too stable. Introduce one moment where the register slips — the prose becomes briefly more formal, or more colloquial, or angrier, or flatter than the surrounding material. Then don't correct it immediately. Let it sit for a sentence before returning to the dominant register. Human writers lose control of tone. Also consider: is the cynicism or world-weariness of the voice performing itself? If so, add one moment of genuine feeling that contradicts the protective stance.";
  }

  // ── Emotional safety / RLHF palatability ────────────────────────────────────
  // Matches: "emotional safety", "palatable", "rlhf", "safe", "inoffensive",
  // "conflict resolution", "too neat"
  if (
    s.includes("emotional safety") || s.includes("palatabl") ||
    s.includes("rlhf") || s.includes("inoffensive") ||
    s.includes("too neat") || s.includes("safely") ||
    s.includes("conflict resolv")
  ) {
    return "find the moment where the text is being most careful about how it will be received — a conflict that resolves too reasonably, a dark moment that is managed rather than felt, a character who behaves better than they should. Make that moment worse. Not more dramatic — more uncomfortable. Add one beat where the reader is not being given what they want from the story.";
  }

  // ── Sycophancy / hedging phrases ────────────────────────────────────────────
  // Matches: "sycophancy", "hedging", "non-committal", "neutral tone",
  // "diplomatic", "safe language"
  if (
    s.includes("sycophancy") || s.includes("non-committal") ||
    s.includes("neutral tone") || s.includes("diplomatic") ||
    s.includes("safe language")
  ) {
    return "hunt down every hedging or softening phrase ('it is worth noting', 'perhaps', 'in many ways', 'one might argue', 'seemingly', 'it could be said') and DELETE them. Replace with declarative sentences that commit to a position. Then find one moment where the narrative is being diplomatically safe — a conflict resolved too neatly, a character behaving too reasonably — and add genuine friction or ugliness.";
  }

  // ── Thematic closure / restating premise ────────────────────────────────────
  // Matches: "thematic closure", "thematic drift", "restating", "rephrasing",
  // "circular", "premise"
  if (
    s.includes("thematic") || s.includes("closure") ||
    s.includes("restat") || s.includes("rephras") ||
    s.includes("circular") || s.includes("premise") ||
    s.includes("drift")
  ) {
    return "identify which paragraph is restating the opening premise instead of advancing it — this is the most common AI pattern. Cut that paragraph to half its length, then add a sentence that takes the theme somewhere genuinely unexpected. The text should end somewhere it could not have predicted from its own opening.";
  }

  // ── Vocabulary bias / AI word choice ────────────────────────────────────────
  // Matches: "vocabulary", "word choice", "generic description", "bias word",
  // "ai vocabulary", "specificity"
  if (
    s.includes("vocabulary") || s.includes("word choice") ||
    s.includes("generic") || s.includes("bias word") ||
    s.includes("ai vocab") || s.includes("specificity") ||
    s.includes("interchangeable")
  ) {
    return "scan for these AI-flagged words and replace every instance: delve, tapestry, intricate, testament, realm, vibrant, crucial, multifaceted, nuanced, robust, pivotal, underscore, illuminate, foster, elevate, comprehensive, reimagine, embark, resonate, beacon. Then find the most generic descriptive phrase — one that could appear in any story — and replace it with a detail so specific it could only belong to THIS story and THIS character.";
  }

  // ── Absent literary devices / mechanical precision ───────────────────────────
  // Matches: "absent literary", "mechanical precision", "technical word choice",
  // "clarity and specificity"
  if (
    s.includes("absent") || s.includes("mechanical precision") ||
    s.includes("technical word") || s.includes("clarity and specificity") ||
    s.includes("lacks literary") || s.includes("lack of literary")
  ) {
    return "the prose is too precise and too clear. Human creative writing is often slightly unclear in productive ways — the image means more than one thing, the sentence could be parsed two ways, the detail suggests without stating. Find three places where the prose is currently doing one job cleanly and make it do two jobs at once, even if that introduces a small amount of productive ambiguity.";
  }

  // ── Dialogue ────────────────────────────────────────────────────────────────
  if (s.includes("dialogue") || s.includes("exposition delivery")) {
    return "rewrite dialogue so that at least one exchange is slightly oblique — characters speaking past each other rather than to each other. Add one line where a character responds to something other than what was just said. Real conversations have non-sequiturs, interruptions, and subjects that change without permission.";
  }

  // ── Fallback: signal came through but nothing matched ───────────────────────
  // Rather than a generic instruction, return something that will actually help
  return `the signal "${signal}" indicates AI-like patterns. Restructure the most formulaic sentence in this section completely — change its grammatical template, not its words. Then add one element of genuine unpredictability: something the scene is not supposed to contain, a thought that doesn't resolve, or a syntactic construction that feels personally authored.`;
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

2. SPECULATIVE INTERIORITY MUST BE ELIMINATED. Any sentence where a character is "wondering", "considering whether", or "thinking perhaps" must be rewritten so the character asserts. Even a wrong assertion reads more human than an open question.

3. THEMATIC DRIFT IS REQUIRED. The rewritten text must end somewhere different from where it started — not in plot, but in emotional or conceptual register.

4. PRESERVE THE STORY. Do not change plot events, character names, the setting, or the core meaning of any scene.

5. DO NOT OVER-POLISH. A rewrite that is cleaner and more grammatically correct than the original will score worse. You are adding roughness and unpredictability, not removing it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANNOTATED DRAFT TO REWRITE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${annotatedText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond ONLY with valid JSON. No preamble. No markdown fences. Escape all double quotes inside string values as \\".

{
  "rewrittenText": "the complete rewritten prose as a single string. Use \\n for paragraph breaks. Escape all internal quotes as \\\\".",
  "changes": [
    {
      "original": "the exact original sentence or phrase you changed",
      "revised": "what you replaced it with",
      "explanation": "which specific signal this addresses and what structural change was made"
    }
  ],
  "overallNote": "1-2 sentences describing the structural approach taken — what categories of change dominated and why"
}

Include 5-10 of the most significant structural changes in the changes array. Do not include word swaps, punctuation changes, or minor rephrasing — only changes that alter sentence structure, rhythm, interiority, or thematic arc.`;
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

  try {
    const parsed = JSON.parse(cleanString);
    return validateAndShape(parsed);
  } catch {
    // fall through to repair
  }

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
