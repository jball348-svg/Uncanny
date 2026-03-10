# Roadmap — Uncanny v1

## Milestone 1: MVP — "Does this read like a machine?"

---

### Phase 1: Project Foundation
**Goal:** Working Next.js app scaffolded, deployed to Vercel, with the input UI complete.

- Next.js 14 App Router project initialised with Tailwind CSS
- Landing page with hero, brief explanation of what Uncanny does, and CTA
- Text input page: large textarea for paste input + file upload (.txt / .docx)
- Character/word count display and validation (min 200 words, max 10,000 words)
- Basic Vercel deployment confirmed working
- Environment variable setup documented in README

**Covers:** REQ-01, REQ-02, REQ-10, REQ-15

---

### Phase 2: Analysis Engine
**Goal:** The actual detection logic is built and returns structured results.

- Client-side heuristics module:
  - Burstiness calculator (sentence length variance)
  - Vocabulary diversity score (type-token ratio)
  - Repetitive phrase detection
  - Sentence-level scoring array (each sentence gets a 0–1 AI-likelihood score)
- Claude API integration:
  - POST /api/analyse route (Next.js API route)
  - Sends prose to Claude with a fiction-tuned system prompt for AI pattern detection
  - Claude returns JSON: overall score + per-sentence annotations
- Result aggregator: merges heuristic scores + Claude scores into final output shape
- Error handling: API failures, timeouts, text length violations

**Covers:** REQ-03, REQ-04, REQ-05, REQ-14

---

### Phase 3: Results UI
**Goal:** Authors see a clear, useful, beautifully presented analysis of their work.

- Overall score display: large percentage with label ("Likely Human" / "Mixed Signals" / "AI Influence Detected")
- Signal breakdown cards: burstiness, predictability, LLM pattern score — each with a plain-English explanation
- Annotated prose view: full text rendered with sentences colour-coded by AI-likelihood (green → amber → red)
- Tooltip on hover showing why a specific sentence was flagged
- Loading state with animated progress indicator
- "Analyse another" reset button
- Copy result summary to clipboard

**Covers:** REQ-06, REQ-07, REQ-08, REQ-09, REQ-11, REQ-12, REQ-13

---

### Phase 4: Polish & Ship
**Goal:** Production-ready, well-documented, publicly shareable.

- README with clear setup instructions, env var docs, and contribution guide
- Open Graph meta tags for social sharing
- Mobile layout review and fixes
- Vercel production deployment confirmed
- GitHub repo description, topics, and homepage URL set
- Optional: dark mode toggle

**Covers:** REQ-10, REQ-15, REQ-17 (stretch)

---

## Phase Status
| Phase | Status |
|-------|--------|
| 1 — Foundation | 🔲 Not started |
| 2 — Analysis Engine | 🔲 Not started |
| 3 — Results UI | 🔲 Not started |
| 4 — Polish & Ship | 🔲 Not started |
