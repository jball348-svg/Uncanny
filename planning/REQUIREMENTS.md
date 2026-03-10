# Requirements — Uncanny

## v1 (This Milestone)

### Must Have
- [ ] REQ-01: Author can paste raw text into an input area and submit for analysis
- [ ] REQ-02: Author can upload a .txt or .docx file instead of pasting
- [ ] REQ-03: System calculates a burstiness score (sentence length variance)
- [ ] REQ-04: System calculates a predictability score (vocabulary diversity, phrase repetition)
- [ ] REQ-05: System sends text to Gemini API for LLM-based AI pattern analysis
- [ ] REQ-06: Results page shows an overall AI-influence score (0–100%)
- [ ] REQ-07: Results page highlights individual sentences/paragraphs by AI-likelihood (colour-coded)
- [ ] REQ-08: Results page shows a plain-English breakdown of which signals were triggered
- [ ] REQ-09: UI is clean, minimal, and speaks to authors (no academic jargon)
- [ ] REQ-10: App is deployable to Vercel with a single environment variable (GEMINI_API_KEY)

### Should Have
- [ ] REQ-11: Loading state with progress indicator during analysis
- [ ] REQ-12: Copy-to-clipboard for the result summary
- [ ] REQ-13: "Analyse another" button to reset without page reload
- [ ] REQ-14: Basic error handling (API failure, text too short, text too long)
- [ ] REQ-15: Mobile-responsive layout

### Nice to Have (v1 stretch)
- [ ] REQ-16: Export results as a simple PDF or text report
- [ ] REQ-17: Dark mode

## v2 (Future Milestone)
- User accounts and saved analysis history
- Genre-aware calibration (literary fiction vs. thriller vs. romance)
- Side-by-side diff view showing original vs. AI-rewritten passages
- Batch file upload
- Public API

## Explicitly Out of Scope
- Plagiarism detection
- Non-English prose
- Mobile app
- Browser extension
