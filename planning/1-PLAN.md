# Phase 1 Plan — Project Foundation

## Goal
A working Next.js 14 app is scaffolded, committed to the repo, deployed to Vercel, and the input UI is complete. An author can land on the page, read what Uncanny does, paste text or upload a file, and submit it (even though analysis doesn't work yet — that's Phase 2).

## Context
- Developer uses Antigravity IDE with Gemini 2.5 Pro
- Deployment target: Vercel
- Styling: Tailwind CSS
- No auth, no database, no external APIs in this phase

---

## Tasks

---

### Task 1-01: Scaffold Next.js project

```xml
<task type="auto">
  <name>Scaffold Next.js 14 App Router project with Tailwind</name>
  <action>
    Run: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    
    Then install additional dependencies:
    - mammoth (for .docx file reading): npm install mammoth
    
    Update the default next.config.js/ts to ensure no strict mode issues.
    
    Delete the default boilerplate content from src/app/page.tsx and src/app/globals.css (keep the Tailwind directives in globals.css, wipe everything else).
    
    Confirm the dev server starts cleanly with `npm run dev`.
  </action>
  <verify>npm run dev starts without errors. Blank page at localhost:3000.</verify>
  <done>Clean Next.js 14 app scaffold committed, dev server runs.</done>
</task>
```

---

### Task 1-02: Create landing page

```xml
<task type="auto">
  <name>Build the Uncanny landing / home page</name>
  <files>
    src/app/page.tsx
    src/app/globals.css
    src/components/ui/Button.tsx
  </files>
  <action>
    Build src/app/page.tsx as the landing page. It should include:

    HERO SECTION:
    - Large heading: "Uncanny"
    - Subheading: "An AI detection tool built for fiction writers. Find out where the machine crept into your prose."
    - A single CTA button: "Analyse My Writing" — links to /analyse

    HOW IT WORKS SECTION (3 simple cards):
    - Card 1: "Paste or upload your prose" — icon of a page
    - Card 2: "We analyse rhythm, voice & predictability" — icon of a waveform or graph
    - Card 3: "See exactly where AI patterns appear" — icon of a highlighted text / magnifying glass

    FOOTER: "Open source · MIT License · Built for writers"

    Design notes:
    - Clean, minimal, dark background (#0a0a0a or similar near-black)
    - Off-white / cream text (#f5f0e8 or similar)
    - Accent colour: a muted amber or teal — pick one and use it consistently
    - No images needed — typography-driven
    - Fully responsive (mobile-first)

    Create src/components/ui/Button.tsx as a reusable button component.
  </action>
  <verify>Landing page renders at localhost:3000. All three sections visible. CTA button is present. Looks clean on mobile and desktop.</verify>
  <done>Landing page complete and visually presentable.</done>
</task>
```

---

### Task 1-03: Build the text input / analyse page

```xml
<task type="auto">
  <name>Build /analyse page with paste input and file upload</name>
  <files>
    src/app/analyse/page.tsx
    src/components/TextInput.tsx
    src/components/FileUpload.tsx
    src/lib/fileReader.ts
  </files>
  <action>
    Create src/app/analyse/page.tsx. This page is the main input screen.

    LAYOUT:
    - Page heading: "Check Your Prose"
    - Subtext: "Paste your text below, or upload a .txt or .docx file. Minimum 200 words, maximum 10,000 words."
    - Two-tab toggle: "Paste Text" | "Upload File"

    PASTE TEXT TAB:
    - Large <textarea> (min-height 300px) with placeholder: "Paste your prose here..."
    - Live word count display below: "0 / 10,000 words"
    - Word count turns amber at 9,000 words, red at 10,000+

    UPLOAD FILE TAB:
    - Drag-and-drop zone accepting .txt and .docx files only
    - On file select, extract text from the file and populate a preview (first 200 chars + "...X words total")
    - Use mammoth for .docx extraction (client-side via mammoth.extractRawText)
    - For .txt files, use FileReader API

    Create src/lib/fileReader.ts with two exported functions:
    - readTxtFile(file: File): Promise<string>
    - readDocxFile(file: File): Promise<string>

    SUBMIT BUTTON:
    - "Analyse" button — disabled if word count < 200 or > 10,000
    - On click: for now, just console.log the text (Phase 2 will wire up the real analysis)
    - Show a placeholder message: "Analysis coming in Phase 2..." in a toast or inline notice

    VALIDATION MESSAGES:
    - "Your text is too short. Please paste at least 200 words."
    - "Your text exceeds the 10,000 word limit. Please trim it before analysing."

    Back link to home page at top.
  </action>
  <verify>
    - /analyse page loads.
    - Can type/paste in textarea, word count updates live.
    - Can upload a .txt file, text extracts and previews.
    - Can upload a .docx file, text extracts and previews.
    - Submit button disabled below 200 words, enabled above.
    - Submit button disabled above 10,000 words.
  </verify>
  <done>/analyse page fully functional as an input form. File reading works for .txt and .docx.</done>
</task>
```

---

### Task 1-04: Environment setup and README

```xml
<task type="auto">
  <name>Create .env.example, .gitignore additions, and README</name>
  <files>
    .env.example
    .env.local (do NOT commit this)
    .gitignore
    README.md
  </files>
  <action>
    Create .env.example:
    ```
    # Anthropic API key — get yours at https://console.anthropic.com
    ANTHROPIC_API_KEY=your_api_key_here
    ```

    Ensure .gitignore includes:
    - .env.local
    - .env
    - node_modules
    - .next
    - out

    Create README.md:
    ```markdown
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
    ```
  </action>
  <verify>README.md exists and is readable. .env.example exists. .env.local is NOT tracked by git.</verify>
  <done>Project is documented and environment is set up correctly.</done>
</task>
```

---

## Phase 1 Complete When
- [ ] Next.js app runs locally without errors
- [ ] Landing page at / looks good
- [ ] /analyse page input works (paste + file upload)
- [ ] Word count validation works
- [ ] README is in place
- [ ] All changes committed to main branch
- [ ] App deploys to Vercel successfully
