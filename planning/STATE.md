# State — Uncanny

## Current Position
- **Milestone:** 1 — MVP
- **Active Phase:** 1 — Project Foundation
- **Status:** Not started — repo is empty, ready to scaffold

## Key Decisions Made
- **Framework:** Next.js 14 App Router (consistent with developer's existing workflow)
- **Styling:** Tailwind CSS
- **Detection approach:** Hybrid — client-side heuristics (burstiness, vocabulary diversity) + Claude API for LLM pattern analysis
- **Target user:** Authors checking their own creative writing
- **Tone:** Fiction-first — all copy speaks to writers, not academics or educators
- **Deployment:** Vercel (single env var: ANTHROPIC_API_KEY)
- **License:** MIT (open source)

## Coding Agent
- **IDE:** Antigravity (Google's IDE, similar to Windsurf/Cursor)
- **Model:** Gemini 2.5 Pro
- **Developer style:** Vibe coding — high-level prompts, agent does implementation

## Open Questions
- Should the Claude API call use streaming so authors see results appear progressively? (Nice UX for long texts — decide at Phase 2)
- Word/character limit: 10,000 words is suggested but needs testing against Claude API token limits
- Should the annotated prose view show the original text with inline highlights, or a separate panel? (Decide at Phase 3 context discussion)

## Blockers
- None currently

## Session Log
| Date | Action |
|------|--------|
| 2026-03-10 | Repo created on GitHub (jball348-svg/Uncanny), MIT license, .gitattributes only |
| 2026-03-10 | GSD scaffold created: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, all 4 phase plans |
