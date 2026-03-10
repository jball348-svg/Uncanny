# Phase 2 Plan — Analysis Engine

## Goal
The actual AI detection logic is built. When an author submits prose, the app runs heuristic scoring AND calls Gemini API, then returns a structured result object that Phase 3 will render.

## Prerequisites
- Phase 1 complete
- GEMINI_API_KEY set in .env.local
- /analyse page has working input form

---

## Tasks

---

### Task 2-01: Build the heuristics analysis module

```xml
<task type="auto">
  <n>Build client-side/server-side heuristics scoring module</n>
  <files>
    src/lib/heuristics.ts
  </files>
  <action>
    Create src/lib/heuristics.ts. This module takes a string of prose and returns a structured heuristics result. It should NOT depend on any external API — pure JavaScript/TypeScript logic only.

    Export the following types:
    ```typescript
    export type SentenceScore = {
      text: string;
      index: number;
      heuristicScore: number; // 0 (human) to 1 (AI)
      signals: string[]; // e.g. ["low burstiness", "repetitive phrase"]
    }

    export type HeuristicsResult = {
      burstiScore: number;        // 0–1, low = AI-like (uniform sentence length)
      vocabularyScore: number;    // 0–1, low = AI-like (low diversity)
      repetitionScore: number;    // 0–1, high = AI-like (repeated phrases)
      overallHeuristicScore: number; // 0–1 weighted average, high = AI-like
      sentenceScores: SentenceScore[];
      wordCount: number;
      sentenceCount: number;
    }
    ```

    Implement the following:

    **1. Sentence splitter**
    Split text into sentences. Handle common edge cases: "Mr.", "Dr.", "e.g.", ellipsis "...", dialogue tags. A simple regex approach is fine.

    **2. Burstiness score** (measures sentence length variance)
    - Calculate length (in words) of each sentence
    - Calculate standard deviation of sentence lengths
    - Normalise: low std dev = AI-like = high score (0–1)
    - AI writing tends to have very uniform sentence lengths (std dev < 5 words)
    - Formula: burstiScore = clamp(stdDev / 15, 0, 1) — invert so 0 = uniform (AI), 1 = varied (human)

    **3. Vocabulary diversity score** (type-token ratio)
    - Count unique words / total words
    - AI writing often reuses the same vocabulary repeatedly
    - Normalise to 0–1 where 0 = low diversity (AI-like), 1 = high diversity (human-like)

    **4. Repetition score**
    - Extract all 3–5 word n-grams from the text
    - Count how many appear more than twice
    - High repetition = AI-like
    - Return a score 0–1 where 1 = highly repetitive

    **5. Per-sentence scoring**
    For each sentence, compute a heuristicScore combining:
    - How close its length is to the mean sentence length (close = AI-like)
    - Whether it contains any repeated n-grams from the document
    - Assign signal labels accordingly

    **6. Overall heuristic score**
    Weighted average:
    - burstiness: 40%
    - vocabulary diversity: 35%
    - repetition: 25%
    Invert burstiness and vocabulary (low diversity/burstiness = high AI score).

    Export a single function: `analyseHeuristics(text: string): HeuristicsResult`
  </action>
  <verify>
    Write a quick test at the bottom of the file (commented out, not a test framework):
    - Short AI-sounding text (uniform sentences, simple vocab) should score > 0.5
    - A passage of literary prose with varied sentence lengths should score < 0.4
    Console.log the results to confirm the logic works.
  </verify>
  <done>analyseHeuristics() returns a valid HeuristicsResult for any prose input.</done>
</task>
```

---

### Task 2-02: Build the Gemini API route

###PLACEHOLDER TO IMPLEMENT GEMINI API

    SYSTEM PROMPT for Gemini (use this exactly, it is carefully tuned for fiction):
    ```
    You are an expert literary editor and AI detection specialist. Your job is to analyse prose submitted by fiction authors and identify patterns that suggest AI generation.

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

    You will receive:
    1. The full prose text
    2. A numbered list of sentences (for annotation)

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
    ```

    ROUTE IMPLEMENTATION:
    - Accept POST with JSON body: { text: string, sentences: string[] }
    - Validate: text must be non-empty, sentences must be array
    - Build the user message: send full text + numbered sentence list
    - Call Gemini API using fetch to (PLACEHOLDER))
    - Model: PLACEHOLDER
    - max_tokens: PLACEHOLDER
    - Parse the JSON response from Gemini
    - Return GeminiAnalysisResult as JSON
    - Handle errors: return 500 with { error: "Analysis failed", details: string }

    Use GEMINI_API_KEY from process.env. Never expose it to the client.
  </action>
  <verify>
    Test with a curl command or a temporary test page. POST to /api/analyse with a short prose passage. Should return valid JSON with overallScore, summary, sentenceAnnotations, dominantSignals.
  </verify>
  <done>POST /api/analyse returns structured ClaudeAnalysisResult JSON.</done>
</task>
```

---

### Task 2-03: Build the result aggregator and wire up the form

```xml
<task type="auto">
  <n>Aggregate heuristic + Gemini results and wire up the /analyse form submission</n>
  <files>
    src/lib/aggregator.ts
    src/app/analyse/page.tsx (update)
    src/context/AnalysisContext.tsx
  </files>
  <action>
    Create src/lib/aggregator.ts:

    ```typescript
    export type AnalysisResult = {
      overallScore: number;          // 0–1, final combined score
      verdict: 'likely-human' | 'mixed' | 'ai-influence';
      verdictLabel: string;          // "Likely Human" | "Mixed Signals" | "AI Influence Detected"
      heuristicScore: number;
      geminiScore: number;
      burstiScore: number;
      vocabularyScore: number;
      repetitionScore: number;
      summary: string;
      dominantSignals: string[];
      sentences: Array<{
        text: string;
        index: number;
        finalScore: number;          // 0–1
        reason?: string;
      }>;
      wordCount: number;
    }
    ```

    Implement `aggregateResults(heuristics: HeuristicsResult, gemini: GeminiAnalysisResult, sentences: string[]): AnalysisResult`

    Aggregation logic:
    - overallScore = (heuristics.overallHeuristicScore * 0.4) + (gemini.overallScore * 0.6)
    - verdict: < 0.35 = 'likely-human', 0.35–0.65 = 'mixed', > 0.65 = 'ai-influence'
    - Per sentence finalScore: average heuristic sentence score + Gemini annotation score (if present), else just heuristic score
    - Use Gemini's summary and dominantSignals

    Create src/context/AnalysisContext.tsx:
    - React context that holds: { result: AnalysisResult | null, isLoading: boolean, error: string | null }
    - Export useAnalysis() hook
    - Wrap src/app/layout.tsx with this provider

    Update src/app/analyse/page.tsx:
    - On form submit:
      1. Set isLoading = true
      2. Run analyseHeuristics(text) client-side
      3. Split text into sentences array
      4. POST to /api/analyse with { text, sentences }
      5. Call aggregateResults()
      6. Store result in AnalysisContext
      7. Navigate to /results using router.push('/results')
    - Show a loading overlay during analysis: "Analysing your prose..." with a spinner
  </action>
  <verify>
    - Submit prose on /analyse page
    - Console shows heuristics result
    - Network tab shows POST to /api/analyse returning valid JSON
    - After completion, router navigates to /results (404 for now — that's Phase 3)
    - AnalysisContext holds the result
  </verify>
  <done>Full analysis pipeline runs on form submit. Results stored in context. Ready for Phase 3 to render them.</done>
</task>
```

---

## Phase 2 Complete When
- [ ] analyseHeuristics() returns correct structure for any prose input
- [ ] POST /api/analyse returns Gemini's structured analysis
- [ ] Submitting the form triggers both analysis steps
- [ ] aggregateResults() merges both into a single AnalysisResult
- [ ] Result is stored in AnalysisContext
- [ ] Router navigates to /results after analysis
