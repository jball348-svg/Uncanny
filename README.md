# Uncanny

An AI detection tool built for fiction writers. Find out where the machine crept into your prose.

## What it does
Uncanny analyses creative writing and prose for AI influence using a hybrid approach:
- Heuristic signals: sentence length variance (burstiness), vocabulary diversity, phrase repetition
- LLM analysis: Claude API pattern detection tuned for fiction

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key (https://console.anthropic.com)

### Local Development
1. Clone the repo: `git clone https://github.com/jball348-svg/Uncanny.git`
2. Install deps: `npm install`
3. Copy the env file: `cp .env.example .env.local`
4. Add your API key to `.env.local`
5. Run: `npm run dev`
6. Open http://localhost:3000

### Deploy to Vercel
1. Push to GitHub
2. Import the repo in Vercel
3. Add `ANTHROPIC_API_KEY` as an environment variable
4. Deploy

## Tech Stack
- Next.js 14 App Router
- Tailwind CSS
- Claude API (Anthropic)
- Vercel

## License
MIT
