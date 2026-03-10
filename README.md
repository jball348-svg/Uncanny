# Uncanny

An AI detection tool built for fiction writers. Find out where the machine crept into your prose. Uncanny analyses creative writing for AI influence with sentence-level precision.

![Screenshot coming soon](#)

## What it does
- **Sentence-level Analysis**: Pinpoints exactly which sentences feel robotic or predictable.
- **Rhythm & Voice Detection**: Checks for uniform sentence lengths ("burstiness"), avoiding the trap of metronomic prose.
- **Vocabulary Diversity**: Evaluates whether your word choice has the natural range of human writing.
- **Phrase Patterns**: Catches repetitive structures and clichés often relied upon by AI.
- **Fiction-Specific**: Tuned specifically for creative prose, not academic essays.

## How it works
Uncanny uses a hybrid approach to detect AI influence:
1. **Local Heuristics**: Runs client-side analysis on vocabulary diversity, repetition, and sentence length variance.
2. **LLM Pattern Detection**: Uses a manual, privacy-first prompt workflow where you generate an analysis prompt, run it through your own instance of ChatGPT/Claude/Gemini, and paste the JSON back in for rendering. This approach avoids API costs and keeps your unreleased prose out of automated third-party API logs.

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Local Development
1. Clone the repo: 
   ```bash
   git clone https://github.com/jball348-svg/Uncanny.git
   ```
2. Install dependencies: 
   ```bash
   npm install
   ```
3. Start the development server: 
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjball348-svg%2FUncanny)

1. Push your code to GitHub.
2. Go to Vercel and import your repository.
3. Deploy! (No environment variables are required since we use the manual API workaround).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript throughout
- **Deployment**: Vercel

## Contributing
We'd love your help to make Uncanny even better! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
