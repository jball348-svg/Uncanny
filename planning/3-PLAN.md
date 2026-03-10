# Phase 3 Plan — Results UI

## Goal
Authors see a clear, useful, well-designed results page. The full text is displayed with sentences colour-coded by AI likelihood. Signal breakdowns explain what was found. The experience feels made for writers, not for academics.

## Prerequisites
- Phase 2 complete
- AnalysisContext holds a valid AnalysisResult after form submission

---

## Tasks

---

### Task 3-01: Build the results page layout and score display

```xml
<task type="auto">
  <n>Build /results page with overall score and verdict display</n>
  <files>
    src/app/results/page.tsx
    src/components/ScoreDisplay.tsx
    src/components/VerdictBadge.tsx
  </files>
  <action>
    Create src/app/results/page.tsx.

    The page should:
    - Read result from AnalysisContext via useAnalysis()
    - If result is null (user navigated directly to /results), redirect to /analyse
    - If isLoading is true, show the loading state (see Task 3-03)

    PAGE STRUCTURE (top to bottom):
    1. Nav bar: "← Analyse another" button (resets context, goes to /analyse) + "Uncanny" wordmark
    2. Score section (ScoreDisplay component)
    3. Signal breakdown section (Task 3-02)
    4. Annotated prose section (Task 3-02)

    Create src/components/ScoreDisplay.tsx:
    - Large circular or arc gauge showing the overall score as a percentage (e.g. 73%)
    - Below the gauge: VerdictBadge
    - Below the badge: result.summary text (Claude's plain English summary)

    The gauge should be implemented in pure CSS/SVG — no chart library needed.
    Colour coding:
    - 0–34%: green tones — "Likely Human"
    - 35–65%: amber tones — "Mixed Signals"  
    - 66–100%: red tones — "AI Influence Detected"

    Create src/components/VerdictBadge.tsx:
    - A pill/badge showing the verdict label
    - Styled to match the colour tier above

    Overall design language:
    - Dark background (consistent with landing page)
    - Clean typography, generous whitespace
    - Results should feel like a literary critique, not a school report
  </action>
  <verify>
    Navigate to /analyse, submit some text, land on /results.
    Score gauge renders. Verdict badge shows. Summary text appears.
  </verify>
  <done>/results page loads with score, verdict, and summary from AnalysisContext.</done>
</task>
```

---

### Task 3-02: Build signal breakdown cards and annotated prose view

```xml
<task type="auto">
  <n>Build signal breakdown section and colour-coded prose view</n>
  <files>
    src/components/SignalCards.tsx
    src/components/AnnotatedProse.tsx
    src/components/SentenceChip.tsx
  </files>
  <action>
    Create src/components/SignalCards.tsx:

    Show 3 signal breakdown cards in a row (stack on mobile):

    CARD 1 — Voice Rhythm (Burstiness)
    - Title: "Voice Rhythm"
    - Metric: result.burstiScore as a mini bar or score chip
    - Explanation (conditional):
      - Low score: "Your sentence lengths vary naturally — a strong sign of human voice."
      - High score: "Your sentences follow a uniform rhythm. AI writing tends to be metronomic."

    CARD 2 — Vocabulary Range  
    - Title: "Vocabulary Range"
    - Metric: result.vocabularyScore
    - Explanation (conditional):
      - Low score: "The vocabulary is narrower than typical human prose."
      - High score: "Good range of vocabulary — humans naturally reach for varied words."

    CARD 3 — Phrase Patterns
    - Title: "Phrase Patterns"
    - Metric: result.repetitionScore
    - Explanation (conditional):
      - High score: "Repeated phrases detected — AI models often reuse the same constructions."
      - Low score: "No notable phrase repetition."

    Below the cards: a "Dominant Signals" row showing result.dominantSignals as small tags/pills.

    ---

    Create src/components/AnnotatedProse.tsx:

    Section heading: "Your Prose, Annotated"
    Subtext: "Sentences are highlighted by AI likelihood. Hover or tap any highlighted sentence to see why it was flagged."

    Render the full prose text by mapping over result.sentences.
    Each sentence is rendered as an inline <span> (so text flows naturally, not as a list).

    Colour the background of each sentence span based on finalScore:
    - 0.0–0.3: no highlight (transparent)
    - 0.3–0.5: very subtle amber tint
    - 0.5–0.7: amber
    - 0.7–1.0: red/rose

    Create src/components/SentenceChip.tsx:
    - Wraps a sentence span
    - On hover (desktop) or tap (mobile): shows a small tooltip/popover above the sentence
    - Tooltip shows: the sentence's finalScore as a percentage + the reason string (if any)
    - If no reason string, show: "Statistical pattern detected"

    Implementation note: use a simple React state (hoveredIndex) in AnnotatedProse to manage tooltip visibility. No external tooltip library needed.
  </action>
  <verify>
    - 3 signal cards render with correct scores and explanations
    - Dominant signals show as pills
    - Full prose text renders in the annotated section
    - High-scoring sentences have visible amber/red highlights
    - Hovering a highlighted sentence shows a tooltip with the reason
  </verify>
  <done>Signal breakdown and annotated prose view fully functional.</done>
</task>
```

---

### Task 3-03: Loading state and utility actions

```xml
<task type="auto">
  <n>Build loading overlay and utility action buttons</n>
  <files>
    src/components/LoadingOverlay.tsx
    src/components/ActionBar.tsx
    src/app/analyse/page.tsx (update)
    src/app/results/page.tsx (update)
  </files>
  <action>
    Create src/components/LoadingOverlay.tsx:
    - Full-screen overlay (fixed position, dark semi-transparent bg)
    - Animated spinner or pulsing dots
    - Text: "Analysing your prose..."
    - Sub-text cycling through messages every 2 seconds:
      - "Measuring sentence rhythm..."
      - "Checking vocabulary patterns..."
      - "Running literary analysis..."
      - "Almost there..."
    - Use React useState + useEffect with setInterval for the message cycling
    - Show this overlay when AnalysisContext isLoading === true

    Update src/app/analyse/page.tsx to render <LoadingOverlay /> when loading.

    Create src/components/ActionBar.tsx for the results page:
    This bar sits at the bottom of the results page (or below the annotated prose):

    BUTTON 1: "Analyse Another Piece"
    - Resets AnalysisContext result to null
    - Navigates to /analyse

    BUTTON 2: "Copy Summary"
    - Copies a plain-text version of the results to clipboard:
      ```
      Uncanny Analysis Result
      Overall Score: X%
      Verdict: [verdict label]

      [summary text]

      Signals detected: [dominantSignals joined with ", "]
      ```
    - Button text changes to "Copied!" for 2 seconds after click

    Add ActionBar to the bottom of the results page.
  </action>
  <verify>
    - Submit text on /analyse page — loading overlay appears
    - Loading messages cycle during the wait
    - On results page: "Copy Summary" copies correct text to clipboard
    - "Analyse Another Piece" returns to /analyse with a blank form
  </verify>
  <done>Loading overlay works. Action buttons work. Full user flow is complete.</done>
</task>
```

---

## Phase 3 Complete When
- [ ] /results page renders with score gauge and verdict
- [ ] 3 signal breakdown cards show with correct data and explanations
- [ ] Full annotated prose renders with colour-coded sentences
- [ ] Hovering highlighted sentences shows tooltips with reasons
- [ ] Loading overlay shows during analysis
- [ ] "Copy Summary" works
- [ ] "Analyse Another Piece" resets correctly
- [ ] Full user flow works end-to-end: paste → submit → loading → results → reset
