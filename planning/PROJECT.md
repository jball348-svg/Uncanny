# Uncanny — AI Detection for Fiction & Prose

## Vision
Uncanny is an open-source web tool that helps authors check their own creative writing for AI influence. Unlike generic AI detectors built for academic essays, Uncanny is specifically tuned for the patterns of fiction and literary prose — sentence rhythm, voice consistency, stylistic burstiness, and the telltale flatness of machine-generated narrative.

## The Problem
Existing AI detectors (GPTZero, Originality.ai) are calibrated for academic writing. They produce false positives on literary prose and don't give authors the granular, sentence-level feedback they need. Authors collaborating with AI tools (co-writing, editing, brainstorming) have no honest way to understand how much AI influence has crept into their final manuscript.

## The Solution
A clean, paste-or-upload interface where an author submits prose and receives:
1. An overall AI-influence score (0–100%)
2. Sentence-level highlighting showing which passages read as AI-generated
3. A breakdown of the signals that triggered the detection (burstiness, predictability, stylistic flatness)
4. Plain-English explanations tailored to fiction writers, not academics

## Target User
Authors — novelists, short story writers, narrative non-fiction writers — who want to understand the "AI fingerprint" in their own work, whether they used AI tools directly or want to verify their voice is intact.

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS
- **Analysis**: Hybrid approach — client-side heuristics (burstiness, sentence length variance, vocabulary diversity) + Claude API for deep LLM-based pattern analysis
- **Deployment**: Vercel
- **Repo**: https://github.com/jball348-svg/Uncanny

## Core Principles
- Fiction-first: all copy, scoring, and UI speaks to authors, not academics
- Sentence-level granularity: highlight exactly where AI patterns appear
- Transparent signals: explain *why* something was flagged, not just *that* it was
- Open source / MIT: free for all authors

## Out of Scope (v1)
- User accounts / saved history
- Batch processing multiple documents
- API access for third parties
- Plagiarism checking
- Non-English text
