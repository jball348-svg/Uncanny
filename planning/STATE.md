# State — Uncanny

## Current Position
- **Milestone:** 1 — MVP (Shipped)
- **Active Phase:** Complete
- **Status:** v1 Shipped

## Key Decisions Made
- **Framework:** Next.js 14 App Router (consistent with developer's existing workflow)
- **Styling:** Tailwind CSS
- **Detection approach:** Hybrid — client-side heuristics (burstiness, vocabulary diversity) + Claude API for LLM pattern analysis
- **Target user:** Authors checking their own creative writing
- **Tone:** Fiction-first — all copy speaks to writers, not academics or educators
- **Deployment:** Vercel (manual LLM workflow avoids API key requirement for now)
- **License:** MIT (open source)

## Coding Agent
- **IDE:** Antigravity (Google's IDE, similar to Windsurf/Cursor)
- **Model:** Gemini 2.5 Pro
- **Developer style:** Vibe coding — high-level prompts, agent does implementation

## Open Questions
- Word/character limit: 10,000 words is suggested but needs testing against Claude API token limits
- Real backend API implementation vs keeping the manual copy/paste workaround.

## Blockers
- None currently

## Session Log
| Date | Action |
|------|--------|
| 2026-03-10 | Repo created on GitHub (jball348-svg/Uncanny), MIT license, .gitattributes only |
| 2026-03-10 | GSD scaffold created: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, all 4 phase plans |
| 2026-03-10 | Phase 4 complete, Uncanny v1 shipped and ready for deployment |
