# Design Brainstorm: Claude Code Token ROI Website

## Context
A technical guide + live ROI calculator for developers using Claude Code. The audience is engineers and technical leads who want to reduce AI API costs. The tone should feel sharp, data-driven, and credible — not marketing fluff.

---

<response>
<text>
## Idea A: "Terminal Ledger" — Dark Brutalist Data Dashboard

**Design Movement:** Brutalist Data Visualization meets Terminal Aesthetic

**Core Principles:**
1. Raw data is the hero — no decoration that doesn't serve information
2. Monospace type for numbers, sans-serif for prose — a strict two-font system
3. High-contrast dark background with sharp amber/green accent for "live" data
4. Asymmetric column layout: left rail for navigation/metadata, right for content

**Color Philosophy:**
- Background: near-black charcoal (#0D0D0D)
- Surface: dark slate (#1A1A2E)
- Accent: electric amber (#F5A623) for ROI scores and live calculator outputs
- Text: off-white (#E8E8E0) for body, pure white for headings
- Rationale: Evokes a trading terminal or engineering dashboard — signals precision and authority

**Layout Paradigm:**
- Sticky left sidebar with tip index (numbered, ROI score visible)
- Main content in a wide right column with generous vertical rhythm
- Calculator pinned to bottom-right as a floating panel that expands on click
- ROI table rendered as a styled data grid, not a traditional HTML table

**Signature Elements:**
1. ROI score badges styled as terminal output tags `[ROI: 4.5]`
2. Before/After code blocks with a diff-style red/green highlight
3. Animated number counter for calculator outputs

**Interaction Philosophy:**
- Clicking a tip in the sidebar scrolls to it and highlights the row in the data grid
- Calculator inputs update the savings estimate in real-time with a smooth number transition
- Hover on ROI badge shows a tooltip explaining the scoring formula

**Animation:**
- Entrance: tips slide in from left with staggered delay (50ms each)
- Calculator output: numbers count up from 0 when value changes
- Sidebar active state: amber left-border slides in

**Typography System:**
- Display: `Space Grotesk` Bold 700 — for headings and ROI scores
- Body: `Inter` 400/500 — for prose content
- Code/Numbers: `JetBrains Mono` — for all numeric values, before/after examples
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Idea B: "Efficiency Audit" — Clean Editorial with Data Accents

**Design Movement:** Editorial Minimalism meets Financial Report Design

**Core Principles:**
1. Generous whitespace as the primary design element
2. A strict typographic hierarchy that guides the eye without decoration
3. Color used only for data encoding — not decoration
4. Content-first: the layout adapts to the content, not the other way around

**Color Philosophy:**
- Background: warm white (#FAFAF7)
- Surface: light stone (#F2F0EB)
- Primary accent: deep forest green (#1B4332) — signals savings, growth, efficiency
- Data accent: terracotta (#C0533A) for "before" states, green for "after"
- Rationale: Feels like a well-designed annual report — authoritative, calm, trustworthy

**Layout Paradigm:**
- Full-width hero with a large ROI summary table above the fold
- Single-column editorial layout below, with tips as numbered sections
- Calculator embedded as an inline section between tips and conclusion
- Wide left margin used for tip numbers and metadata (like a book's marginalia)

**Signature Elements:**
1. Tip numbers rendered as large, light-weight numerals in the margin (opacity 0.12)
2. ROI bar chart rendered inline next to the summary table
3. Before/After examples in a split-panel card with a vertical divider

**Interaction Philosophy:**
- Minimal animation — the content is the interaction
- Calculator sliders with clean track design, no decorative chrome
- Smooth scroll with offset for sticky header

**Animation:**
- Subtle fade-in on scroll for each tip section
- Slider thumb has a gentle spring on drag-release
- ROI bars animate width from 0 on first viewport entry

**Typography System:**
- Display: `Playfair Display` Bold — for the main headline and section numbers
- Body: `Source Serif 4` Regular — warm, readable, editorial
- Data/UI: `DM Sans` Medium — for labels, badges, calculator UI
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea C: "Token Burn" — Neon-Accented Dark Tech with Glassmorphism

**Design Movement:** Modern SaaS Dark Mode with Glassmorphism accents

**Core Principles:**
1. Dark canvas with glowing accent elements — depth through light, not shadow
2. Glass cards for tips — frosted panels that float above a subtle gradient background
3. The ROI calculator is the centerpiece — large, prominent, interactive
4. Gradient used sparingly but deliberately: only on the hero and CTA elements

**Color Philosophy:**
- Background: deep navy-black (#060B18)
- Glass surface: rgba(255,255,255,0.05) with backdrop-blur
- Primary accent: electric indigo (#6366F1) — modern, technical, trustworthy
- Secondary accent: cyan (#22D3EE) — for "savings" and positive outcomes
- Rationale: Feels like a modern developer tool (Vercel, Linear, Raycast) — premium and technical

**Layout Paradigm:**
- Full-bleed hero with animated gradient mesh background
- Horizontal scrollable tip cards on mobile, grid on desktop
- ROI calculator as a hero-width panel with a glowing border
- Sticky navigation with blur background

**Signature Elements:**
1. Glowing ROI score rings (like a gauge) for each tip
2. Animated gradient border on the calculator panel
3. Particle or grid-dot background in the hero section

**Interaction Philosophy:**
- Rich hover states: cards lift with box-shadow on hover
- Calculator panel glows brighter as savings increase
- Smooth parallax on hero background

**Animation:**
- Hero: gradient mesh slowly shifts color
- Cards: staggered entrance from bottom with spring physics
- Calculator: output value animates with a slot-machine style number roll

**Typography System:**
- Display: `Syne` ExtraBold 800 — futuristic, geometric, strong
- Body: `Manrope` Regular/Medium — clean, modern, highly legible
- Mono: `Fira Code` — for code examples and token counts
</text>
<probability>0.06</probability>
</response>

---

## Selected Approach: **Idea B — "Efficiency Audit" (Editorial Minimalism)**

Rationale: The audience is technical and cost-conscious. A clean, data-forward editorial design signals credibility and respects the reader's intelligence. The warm palette and typographic hierarchy make the content easy to scan and absorb. The ROI calculator benefits from a clean, uncluttered UI where the numbers speak for themselves.
