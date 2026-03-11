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
  if (s.includes("em-dash") || s.includes("special character")) {
    return "ignore em-dash usage — it is not a reliable signal. Focus on sentence structure instead.";
  }
  if (s.includes("conceptual smoothness") || s.includes("rhetorical polish")) {
    return "break the smoothness structurally: add a sentence that contradicts or qualifies the one before it, let a thought go unresolved, allow one paragraph to end in the wrong place emotionally. The goal is friction, not error.";
  }
  if (s.includes("summarising emotion") || s.includes("abstract noun")) {
    return "delete the abstract noun sentence entirely and replace it with a single concrete physical detail — something the character touches, hears, or notices — that implies the emotion without naming it.";
  }
  if (s.includes("competence without personality")) {
    return "introduce one moment of genuine oddness per section: an unexpected simile, a detail that is too specific to be generic, a sentence whose rhythm is slightly wrong in a way that feels deliberate. Do not make the prose worse — make it stranger.";
  }
  if (s.includes("uniform") || s.includes("information density")) {
    return "add 1-2 throwaway sentences per section that exist purely for rhythm or texture — lines that carry no plot weight but feel like something a human would include. Also break up any sequences of similarly-weighted sentences with a very short one or a fragment.";
  }
  if (s.includes("polished edit") || s.includes("light edit")) {
    return "deliberately leave one rough edge per paragraph: an incomplete thought, a slightly clunky transition, a word that is almost but not quite right. Polish is the enemy here.";
  }
  if (s.includes("transitions")) {
    return "remove clean paragraph transitions entirely. End paragraphs mid-thought if necessary. Let the reader do the work of connecting sections.";
  }
  if (s.includes("dialogue")) {
    return "rewrite dialogue so characters speak past each other slightly — people in real conversation don't respond directly to what was just said. Add one line per exchange that is oblique or slightly non-sequitur.";
  }
  return "restructure this section at the sentence level — vary length dramatically, allow one sentence to be incomplete, and replace any generic descriptive phrase with something specific enough that it could only belong to this story.";
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

Rewrite the prose above to read as more authentically human. Apply the editorial notes above, but understand that the goal is NOT surface polish or synonym substitution — modern AI detectors are specifically trained to catch those approaches.

What actually makes prose read as human:
- Structural variation in sentence length (not just word choice)
- Information that exists for rhythm rather than plot efficiency
- Moments of genuine roughness — thoughts that don't resolve cleanly
- Specificity so precise it could only belong to this particular story
- Occasional tonal inconsistency — the voice is not perfectly controlled

Do not make the prose worse. Make it feel lived-in and writable by exactly one person, not competently generatable by any LLM given the same brief.

IMPORTANT on JSON formatting: escape all double quotes inside string values as \\" — this is critical for dialogue and quoted text.

Respond ONLY with valid JSON, no preamble, no markdown fences:
{
  "rewrittenText": "the full rewritten prose as a single string with all newlines as \\n and all internal quotes escaped as \\"",
  "changes": [
    {
      "original": "exact original sentence or phrase",
      "revised": "what you replaced it with",
      "explanation": "what structural change this makes and why it reads more human"
    }
  ],
  "overallNote": "1-2 sentences describing the structural approach taken, not a list of surface edits"
}

Include 5-10 of the most structurally significant changes only. If a change is just a word swap or punctuation fix, do not include it.`;
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

  const escapeInnerQuotes = (jsonStr: string) => {
    const keysToFix = ['rewrittenText', 'original', 'revised', 'explanation', 'overallNote'];
    let fixedStr = jsonStr;
    
    for (const key of keysToFix) {
      const searchString = `"${key}": "`;
      let startIndex = 0;
      while ((startIndex = fixedStr.indexOf(searchString, startIndex)) !== -1) {
        const valueStart = startIndex + searchString.length;
        
        let endIndex = -1;
        for (let i = valueStart; i < fixedStr.length; i++) {
          if (fixedStr[i] === '"') {
            // Check if it's escaped
            let isEscaped = false;
            let backslashCount = 0;
            for (let j = i - 1; j >= valueStart; j--) {
              if (fixedStr[j] === '\\') backslashCount++;
              else break;
            }
            if (backslashCount % 2 === 1) isEscaped = true;
            
            if (!isEscaped) {
               let remaining = fixedStr.substring(i + 1).trimStart();
               if (
                  remaining.startsWith(',') || 
                  remaining.startsWith('}') ||
                  remaining.startsWith(']') ||
                  remaining === ''
               ) {
                   endIndex = i;
                   break;
               }
            }
          }
        }
        
        if (endIndex !== -1) {
          const content = fixedStr.substring(valueStart, endIndex);
          
          // Escape unescaped double quotes inside the content
          const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
          
          fixedStr = fixedStr.substring(0, valueStart) + escapedContent + fixedStr.substring(endIndex);
          
          // Move the index past this value
          startIndex = valueStart + escapedContent.length + 1;
        } else {
          startIndex = valueStart;
          break; // safety break
        }
      }
    }
    
    return fixedStr;
  };

  cleanString = escapeInnerQuotes(cleanString);

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
