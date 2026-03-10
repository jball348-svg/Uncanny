# Phase 4 Plan — Polish & Ship

## Goal
Uncanny is production-ready. The README is complete, the Vercel deployment is confirmed, the app is publicly shareable, and the repo looks like a proper open source project.

## Prerequisites
- Phases 1–3 complete
- Full user flow working end-to-end

---

## Tasks

---

### Task 4-01: SEO, meta tags, and Open Graph

```xml
<task type="auto">
  <n>Add metadata, OG tags, and favicon</n>
  <files>
    src/app/layout.tsx
    src/app/opengraph-image.tsx (or a static OG image)
    public/favicon.ico (or favicon.svg)
  </files>
  <action>
    Update src/app/layout.tsx to export a Next.js Metadata object:

    ```typescript
    export const metadata: Metadata = {
      title: 'Uncanny — AI Detection for Fiction Writers',
      description: 'Find out where the machine crept into your prose. Uncanny analyses fiction and creative writing for AI influence with sentence-level precision.',
      openGraph: {
        title: 'Uncanny — AI Detection for Fiction Writers',
        description: 'Find out where the machine crept into your prose.',
        url: 'https://uncanny.vercel.app', // update when real URL known
        siteName: 'Uncanny',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Uncanny — AI Detection for Fiction Writers',
        description: 'Find out where the machine crept into your prose.',
      },
    }
    ```

    Create a simple favicon: a small SVG with the letter "U" or a simple eye/wave icon that fits the brand. Save as public/favicon.svg and reference in the layout.

    Create src/app/opengraph-image.tsx using Next.js ImageResponse to generate a dynamic OG image:
    - Dark background
    - "Uncanny" large text
    - Tagline: "AI Detection for Fiction Writers"
    - Simple, clean — no complex graphics needed
  </action>
  <verify>Browser tab shows the favicon. Pasting the URL into a Slack/Twitter preview shows the OG title and description.</verify>
  <done>Meta tags and OG image in place.</done>
</task>
```

---

### Task 4-02: Mobile layout review and fixes

```xml
<task type="auto">
  <n>Review and fix mobile layout across all pages</n>
  <files>
    src/app/page.tsx
    src/app/analyse/page.tsx
    src/app/results/page.tsx
    src/components/SignalCards.tsx
    src/components/AnnotatedProse.tsx
  </files>
  <action>
    Review every page at 375px width (iPhone SE) and 390px (iPhone 14) using browser devtools.

    Common issues to fix:
    - Horizontal scroll: ensure no element overflows the viewport width
    - Signal cards: should stack vertically on mobile (flex-col on small screens)
    - Score gauge: ensure it scales correctly and isn't clipped
    - Textarea on /analyse: should be comfortable to type in on mobile
    - Tooltips on AnnotatedProse: on mobile, tooltips should appear on tap, not hover. Add a tap-to-show/tap-to-hide behaviour.
    - Typography: ensure heading sizes are readable but not oversized on mobile
    - Action buttons: ensure they are at least 44px tall (touch target size)
    - Padding: ensure pages have adequate horizontal padding on small screens (px-4 minimum)

    Test the full flow on mobile viewport: paste text → submit → loading → results → copy → reset.
  </action>
  <verify>Full user flow works on 375px viewport. No horizontal scroll. Touch targets are large enough. Tooltips work on tap.</verify>
  <done>App is genuinely usable on mobile.</done>
</task>
```

---

### Task 4-03: Error handling review and edge cases

```xml
<task type="auto">
  <n>Review and harden error handling across the app</n>
  <files>
    src/app/api/analyse/route.ts
    src/app/analyse/page.tsx
    src/context/AnalysisContext.tsx
  </files>
  <action>
    Review and improve error handling for these cases:

    1. ANTHROPIC_API_KEY missing in production:
    - API route should return a clear 500 with message: "API key not configured"
    - Front-end should show: "Analysis unavailable. Please try again later."

    2. Claude API rate limit or timeout:
    - Catch HTTP 429 and 5xx from Claude API
    - Show user-friendly message: "Our analysis is taking longer than expected. Please try again in a moment."

    3. Claude returns malformed JSON:
    - Wrap JSON.parse in try/catch in the API route
    - Fall back gracefully: return heuristics-only result with a note that deep analysis was unavailable

    4. Text too long for Claude's context window:
    - If text > 8000 words, truncate to 8000 before sending to Claude (heuristics still run on full text)
    - Add a small notice on the results page: "Analysis based on first 8,000 words due to length."

    5. Network failure client-side:
    - If the fetch to /api/analyse fails entirely, show: "Connection error. Please check your internet and try again."
    - Ensure the loading overlay is dismissed on any error

    6. User navigates directly to /results with no data:
    - Already handled (redirect to /analyse) — verify this works correctly

    All error messages should go into AnalysisContext error field and be displayed in a visible error banner on the /analyse page.
  </action>
  <verify>
    - Temporarily break the API key → correct error message shown
    - Navigate directly to /results → redirects to /analyse
    - Error banner is visible and dismissible
  </verify>
  <done>App handles all common error cases gracefully.</done>
</task>
```

---

### Task 4-04: Final README and repo polish

```xml
<task type="auto">
  <n>Finalise README and polish the GitHub repo</n>
  <files>
    README.md
    CONTRIBUTING.md
  </files>
  <action>
    Update README.md to be complete and presentable for a public open source repo:

    Include sections:
    - Project header with name and tagline
    - A screenshot or GIF of the app (placeholder: "Screenshot coming soon" if no image available)
    - What it does (clear, 3–5 bullet points)
    - How it works (brief explanation of heuristics + Claude API approach)
    - Getting started (clone, install, env setup, run)
    - Deploy to Vercel (step-by-step, include the Vercel deploy button if possible)
    - Tech stack
    - Contributing
    - License

    Create CONTRIBUTING.md:
    ```markdown
    # Contributing to Uncanny

    Thanks for your interest! Uncanny is an MIT-licensed open source project.

    ## Getting started
    1. Fork the repo
    2. Create a feature branch: `git checkout -b feature/your-feature-name`
    3. Make your changes
    4. Open a pull request with a clear description of what you've changed and why

    ## What we'd love help with
    - Improving the heuristics scoring accuracy for different genres
    - Adding support for more file formats (.pdf, .epub)
    - Improving mobile experience
    - Writing tests
    - Improving the Claude system prompt for better fiction-specific detection

    ## Code style
    - TypeScript throughout
    - Tailwind for styling
    - No unnecessary dependencies
    ```
  </action>
  <verify>README renders correctly on GitHub. All code blocks are valid. Links work.</verify>
  <done>Repo is publicly presentable as an open source project.</done>
</task>
```

---

### Task 4-05: Production deployment verification

```xml
<task type="auto">
  <n>Verify production Vercel deployment end-to-end</n>
  <action>
    1. Ensure all environment variables are set in Vercel dashboard:
       - ANTHROPIC_API_KEY

    2. Trigger a production deployment (push to main or manually trigger in Vercel)

    3. Test the full flow on the production URL:
       - Landing page loads correctly
       - /analyse page loads correctly
       - Submit a ~300 word prose passage
       - Loading overlay appears
       - Results page renders with score, signals, and annotated prose
       - "Copy Summary" works
       - "Analyse Another Piece" resets correctly
       - Test on mobile viewport

    4. Check browser console for any errors in production

    5. Verify the page title and favicon appear correctly in browser tab

    6. Update STATE.md to reflect Phase 4 complete and milestone 1 shipped
  </action>
  <verify>Production URL works end-to-end with real API key. No console errors. Mobile flow works.</verify>
  <done>Uncanny v1 is live on Vercel and fully functional.</done>
</task>
```

---

## Phase 4 Complete When
- [ ] Favicon and OG meta tags in place
- [ ] Mobile layout works on 375px viewport
- [ ] All error cases handled gracefully
- [ ] README is complete and presentable
- [ ] CONTRIBUTING.md exists
- [ ] Production Vercel deployment confirmed working end-to-end
- [ ] STATE.md updated to reflect v1 shipped
