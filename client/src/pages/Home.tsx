/* =============================================================
   PAGE: Home
   DESIGN: "Efficiency Audit" — Editorial Minimalism
   - Warm white (#FAFAF7) background, forest green primary, terracotta accent
   - Playfair Display for headings, Source Serif 4 for body, DM Sans for UI
   - Wide left margin for tip numbers, generous vertical rhythm
   - ROI summary table above fold, live calculator as inline section
   ============================================================= */

import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const TIPS = [
  {
    rank: 1,
    title: "Use the Right Model for the Right Job",
    impact: 9,
    complexity: 2,
    roi: 4.5,
    summary:
      "Model selection is a multiplier on every single token processed. Switching from a frontier model to a lightweight model for simple tasks can reduce cost per token by 10–20×.",
    body: "Not every task requires the most powerful, and therefore most expensive, model. Using a heavy model for everything leads to unnecessary token burn without providing any real benefit. A simple rule: use the cheapest model that can handle the task.",
    before:
      "Using Claude 3.5 Sonnet to fix a typo in a README file or to format a JSON string.",
    after:
      "Using Claude 3 Haiku for JSON formatting and simple edits. Saving Sonnet for debugging a complex asynchronous race condition.",
    complexity_note:
      "Requires knowing which model to pick, but the decision rule is simple. No workflow restructuring needed — just a one-time habit of checking the model selector.",
    impact_note:
      "Applies to every single request. Even partial adoption yields outsized savings because it is a cost-per-token multiplier.",
    color: "#1B4332",
  },
  {
    rank: 2,
    title: "Keep Your Sessions Short and Clean",
    impact: 9,
    complexity: 3,
    roi: 3.0,
    summary:
      "Context window growth is cumulative and compounding. A 50-message thread can carry 50,000+ tokens of history that gets re-read on every new message.",
    body: "Long chat threads are one of the biggest hidden token drains. Every time you send a new message, Claude must re-read the entire conversation history, including old instructions, outdated code, and resolved issues. Use /clear when the previous context is no longer needed, and avoid mixing unrelated problems in a single thread.",
    before:
      "After 15 messages building a Python script, you ask a SQL question in the same thread. Claude re-processes all the Python code just to answer.",
    after:
      "Once the Python script is complete, use /clear or start a new session. Ask the SQL question in a fresh, empty context.",
    complexity_note:
      "Requires a habit change (using /clear or starting new sessions), but no technical skill. The main friction is remembering to do it.",
    impact_note:
      "Context window growth is exponential, not linear. Clearing context eliminates this entirely — one of the most structurally significant sources of token waste.",
    color: "#2D6A4F",
  },
  {
    rank: 3,
    title: "Batch Tasks Instead of Splitting Them",
    impact: 7,
    complexity: 3,
    roi: 2.33,
    summary:
      "Each separate message re-sends the entire conversation history. Batching 3 tasks into 1 message can reduce token usage by roughly 60–70% for that work unit.",
    body: "Breaking work into multiple small steps might feel natural, but it is highly expensive in terms of token usage. When you batch tasks together, the model reads the context once, produces one complete solution, and avoids the repeated reloading of the same information.",
    before:
      "Message 1: 'Fix the null pointer exception.' Message 2: 'Now refactor to modern syntax.' Message 3: 'Write unit tests.'",
    after:
      "Single message: 'Fix the null pointer exception, refactor to modern syntax, and write comprehensive unit tests.'",
    complexity_note:
      "Requires thinking ahead before sending a message — a mild cognitive shift. No tooling required.",
    impact_note:
      "Significant savings per work unit, bounded by how naturally tasks can be grouped together.",
    color: "#40916C",
  },
  {
    rank: 4,
    title: "Stop Over-Iterating Prompts",
    impact: 7,
    complexity: 4,
    roi: 1.75,
    summary:
      "Rapid-fire follow-up corrections are extremely common. A 5-message correction chain on a 10-message thread can waste 3–4× the tokens of a single well-written prompt.",
    body: "A common habit is sending many rapid follow-up messages: 'change this a bit,' 'now fix that,' 'also adjust this.' Every single message forces the model to reprocess the entire conversation history again. A more efficient approach is to write a complete, comprehensive prompt in one go.",
    before:
      "Message 1: 'Write a sort function.' Message 2: 'Make it descending.' Message 3: 'Handle empty arrays.'",
    after:
      "Single message: 'Write a function to sort an array in descending order. Handle edge cases such as an empty array.'",
    complexity_note:
      "Requires slowing down to write a more complete initial prompt. Moderate habit change — feels slower upfront but saves tokens downstream.",
    impact_note:
      "High impact because this pattern is nearly universal in practice. The savings compound with every correction avoided.",
    color: "#52B788",
  },
  {
    rank: 5,
    title: "Be Strict With the Context You Share",
    impact: 6,
    complexity: 5,
    roi: 1.2,
    summary:
      "Pasting entire files or large logs instead of relevant snippets can add thousands of unnecessary tokens per message.",
    body: "A major hidden cost comes from pasting too much information. Claude processes everything you send, even if most of it is not useful for the task at hand. Better habits include sharing only the relevant snippet, trimming logs before pasting, and referencing files instead of re-pasting them.",
    before:
      "Pasting a 2,000-line app.js file and a 500-line server log to ask why a specific API endpoint on line 145 is returning a 404.",
    after:
      "Pasting only the 20 lines related to the API endpoint and the 3 log lines that show the actual 404 error.",
    complexity_note:
      "Requires actively trimming and curating input before sending. Takes time and judgment to identify what is relevant.",
    impact_note:
      "High per occurrence, but depends on workflow. Developers working with large codebases benefit most.",
    color: "#74C69D",
  },
  {
    rank: 6,
    title: "Avoid Endless Correction Loops",
    impact: 6,
    complexity: 5,
    roi: 1.2,
    summary:
      "When a thread spirals, the compounding cost is very high. Correction loops represent the worst-case scenario of over-iteration.",
    body: "If you find yourself repeatedly fixing the same response in a single thread, the conversation becomes longer and more expensive with each iteration. A better approach is to recognize when a thread is spiraling, restart the session, reframe the problem clearly, and provide the final requirements instead of incremental fixes.",
    before:
      "You ask for a UI component. It looks wrong. 'Fix the padding.' Still wrong. 'Make the button blue.' It breaks the layout. 10 messages of patching a bad initial generation.",
    after:
      "After the second failed attempt, start a new session with a clear, detailed prompt: 'Build a UI component with 16px padding, a blue button (#007BFF), and a flexbox layout centered.'",
    complexity_note:
      "Requires recognizing when a thread has gone wrong and having the discipline to abandon it. Psychologically difficult due to sunk-cost bias.",
    impact_note:
      "Less frequent than general over-iteration, but represents the worst-case token waste scenario when it does occur.",
    color: "#95D5B2",
  },
  {
    rank: 7,
    title: "Keep Prompts Simple and Direct",
    impact: 4,
    complexity: 4,
    roi: 1.0,
    summary:
      "Verbose prompts add tokens, but the marginal cost of a few extra sentences is small compared to the cost of a long conversation history.",
    body: "Long and overly detailed prompts often increase token usage without improving output quality. Avoid repeating instructions, adding unnecessary background explanations, or over-specifying obvious details. Be clear, be direct, and focus only on what matters.",
    before:
      "'Hello Claude, I am working on a fintech startup project... we have been struggling for three days... please make sure you use Python 3... write a function that adds two numbers together. Do not use Java.'",
    after:
      "'Write a clean Python 3 function that adds two numbers together.'",
    complexity_note:
      "Requires good prompt-writing discipline and the confidence to be concise. Moderate friction.",
    impact_note:
      "Real but modest savings in isolation. Most valuable when combined with the higher-ROI habits above.",
    color: "#B7E4C7",
  },
];

const ROI_CHART_DATA = TIPS.map((t) => ({
  name: `#${t.rank}`,
  roi: t.roi,
  title: t.title,
  color: t.color,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoiBar({ value, max = 4.5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-[#E8E4DC] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "oklch(0.32 0.09 155)",
          }}
        />
      </div>
      <span
        className="ui-font font-bold text-sm tabular-nums"
        style={{ color: "oklch(0.32 0.09 155)", minWidth: "2.5rem" }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function ScoreDot({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[#E8E4DC] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="ui-font text-xs font-semibold tabular-nums" style={{ color }}>
        {value}/10
      </span>
    </div>
  );
}

function TipCard({ tip, index }: { tip: (typeof TIPS)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      id={`tip-${tip.rank}`}
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s`,
      }}
    >
      {/* Left margin number */}
      <div
        className="absolute -left-16 top-0 hidden lg:flex flex-col items-end"
        style={{ width: "3.5rem" }}
      >
        <span
          className="font-bold leading-none select-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "3.5rem",
            color: "oklch(0.32 0.09 155)",
            opacity: 0.12,
            lineHeight: 1,
          }}
        >
          {tip.rank}
        </span>
      </div>

      {/* Card */}
      <div
        className="border rounded-lg overflow-hidden"
        style={{
          borderColor: "oklch(0.88 0.008 80)",
          background: "oklch(0.975 0.005 80)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span
                  className="ui-font text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.32 0.09 155)",
                    color: "oklch(0.97 0.005 85)",
                  }}
                >
                  #{tip.rank}
                </span>
                <span
                  className="ui-font text-xs font-medium px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.94 0.008 80)",
                    color: "oklch(0.40 0.015 60)",
                  }}
                >
                  ROI {tip.roi.toFixed(2)}
                </span>
              </div>
              <h3
                className="text-xl font-bold leading-snug"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.015 60)" }}
              >
                {tip.title}
              </h3>
            </div>
          </div>
          <p
            className="mt-2 text-base leading-relaxed"
            style={{ color: "oklch(0.40 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
          >
            {tip.summary}
          </p>
        </div>

        {/* Scores row */}
        <div
          className="px-6 py-3 grid grid-cols-2 gap-4 border-t"
          style={{ borderColor: "oklch(0.92 0.006 80)", background: "oklch(0.985 0.004 85)" }}
        >
          <div>
            <p className="ui-font text-xs text-muted-foreground mb-1 uppercase tracking-wider">Impact</p>
            <ScoreDot value={tip.impact} color="oklch(0.32 0.09 155)" />
          </div>
          <div>
            <p className="ui-font text-xs text-muted-foreground mb-1 uppercase tracking-wider">Complexity</p>
            <ScoreDot value={tip.complexity} color="oklch(0.56 0.12 35)" />
          </div>
        </div>

        {/* Expandable detail */}
        <div className="px-6 pt-3 pb-4">
          <button
            onClick={() => setOpen(!open)}
            className="ui-font text-sm font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: "oklch(0.32 0.09 155)" }}
          >
            <span>{open ? "Hide details" : "Show details & examples"}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {open && (
            <div className="mt-4 space-y-4">
              <p
                className="text-base leading-relaxed"
                style={{ color: "oklch(0.30 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
              >
                {tip.body}
              </p>

              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className="rounded-md p-4"
                  style={{ background: "oklch(0.97 0.015 35)", border: "1px solid oklch(0.88 0.04 35)" }}
                >
                  <p
                    className="ui-font text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.45 0.12 35)" }}
                  >
                    Before — Inefficient
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.30 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
                  >
                    {tip.before}
                  </p>
                </div>
                <div
                  className="rounded-md p-4"
                  style={{ background: "oklch(0.97 0.04 155)", border: "1px solid oklch(0.88 0.06 155)" }}
                >
                  <p
                    className="ui-font text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.32 0.09 155)" }}
                  >
                    After — Efficient
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.30 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
                  >
                    {tip.after}
                  </p>
                </div>
              </div>

              {/* Impact & Complexity notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="ui-font text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "oklch(0.32 0.09 155)" }}>
                    Why the impact is high
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.42 0.015 60)", fontFamily: "'Source Serif 4', serif" }}>
                    {tip.impact_note}
                  </p>
                </div>
                <div>
                  <p className="ui-font text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "oklch(0.56 0.12 35)" }}>
                    Adoption complexity
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.42 0.015 60)", fontFamily: "'Source Serif 4', serif" }}>
                    {tip.complexity_note}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(target);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    cancelAnimationFrame(frameRef.current);

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

function Calculator() {
  // Inputs
  const [messagesPerDay, setMessagesPerDay] = useState(30);
  const [avgTokensPerMsg, setAvgTokensPerMsg] = useState(8000);
  const [costPer1M, setCostPer1M] = useState(3.0);
  const [workingDays, setWorkingDays] = useState(22);

  // Which tips are adopted (default: all on)
  const [adopted, setAdopted] = useState<boolean[]>(TIPS.map(() => true));

  // Reduction factors per tip (conservative estimates of % token reduction)
  const TIP_REDUCTIONS = [0.35, 0.25, 0.15, 0.10, 0.08, 0.05, 0.03];

  const baseMonthlyTokens = messagesPerDay * avgTokensPerMsg * workingDays;
  const baseMonthlyCost = (baseMonthlyTokens / 1_000_000) * costPer1M;

  const totalReduction = adopted.reduce((acc, on, i) => {
    if (!on) return acc;
    return acc + TIP_REDUCTIONS[i] * (1 - acc); // compound
  }, 0);

  const savedTokens = Math.round(baseMonthlyTokens * totalReduction);
  const savedCost = (savedTokens / 1_000_000) * costPer1M;
  const optimisedCost = baseMonthlyCost - savedCost;

  const animSavedTokens = useAnimatedNumber(savedTokens);
  const animSavedCost = useAnimatedNumber(Math.round(savedCost * 100));
  const animOptCost = useAnimatedNumber(Math.round(optimisedCost * 100));
  const animPct = useAnimatedNumber(Math.round(totalReduction * 100));

  const fmt = (n: number) => n.toLocaleString();
  const fmtCost = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section
      id="calculator"
      className="py-20"
      style={{ background: "oklch(0.975 0.005 80)" }}
    >
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p
              className="ui-font text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.56 0.12 35)" }}
            >
              Interactive Tool
            </p>
            <h2
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.015 60)" }}
            >
              ROI Calculator
            </h2>
            <p
              className="text-lg max-w-2xl"
              style={{ color: "oklch(0.42 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
            >
              Estimate your monthly token savings based on your current usage. Toggle which tips your team has adopted to see the compounding effect.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-3 space-y-6">
              <div
                className="rounded-lg p-6 border"
                style={{ background: "oklch(0.985 0.004 85)", borderColor: "oklch(0.88 0.008 80)" }}
              >
                <h3
                  className="ui-font text-sm font-semibold uppercase tracking-wider mb-5"
                  style={{ color: "oklch(0.42 0.015 60)" }}
                >
                  Your Usage Profile
                </h3>
                <div className="space-y-5">
                  {/* Messages per day */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="ui-font text-sm font-medium" style={{ color: "oklch(0.30 0.015 60)" }}>
                        Messages per day
                      </label>
                      <span className="ui-font text-sm font-bold tabular-nums" style={{ color: "oklch(0.32 0.09 155)" }}>
                        {messagesPerDay}
                      </span>
                    </div>
                    <input
                      type="range" min={5} max={200} step={5}
                      value={messagesPerDay}
                      onChange={(e) => setMessagesPerDay(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between ui-font text-xs text-muted-foreground mt-1">
                      <span>5</span><span>200</span>
                    </div>
                  </div>

                  {/* Avg tokens per message */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="ui-font text-sm font-medium" style={{ color: "oklch(0.30 0.015 60)" }}>
                        Avg tokens per message (context + output)
                      </label>
                      <span className="ui-font text-sm font-bold tabular-nums" style={{ color: "oklch(0.32 0.09 155)" }}>
                        {fmt(avgTokensPerMsg)}
                      </span>
                    </div>
                    <input
                      type="range" min={1000} max={100000} step={1000}
                      value={avgTokensPerMsg}
                      onChange={(e) => setAvgTokensPerMsg(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between ui-font text-xs text-muted-foreground mt-1">
                      <span>1K</span><span>100K</span>
                    </div>
                  </div>

                  {/* Cost per 1M tokens */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="ui-font text-sm font-medium" style={{ color: "oklch(0.30 0.015 60)" }}>
                        Cost per 1M tokens (USD)
                      </label>
                      <span className="ui-font text-sm font-bold tabular-nums" style={{ color: "oklch(0.32 0.09 155)" }}>
                        ${costPer1M.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range" min={0.25} max={15} step={0.25}
                      value={costPer1M}
                      onChange={(e) => setCostPer1M(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between ui-font text-xs text-muted-foreground mt-1">
                      <span>$0.25</span><span>$15.00</span>
                    </div>
                  </div>

                  {/* Working days */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="ui-font text-sm font-medium" style={{ color: "oklch(0.30 0.015 60)" }}>
                        Working days per month
                      </label>
                      <span className="ui-font text-sm font-bold tabular-nums" style={{ color: "oklch(0.32 0.09 155)" }}>
                        {workingDays}
                      </span>
                    </div>
                    <input
                      type="range" min={10} max={31} step={1}
                      value={workingDays}
                      onChange={(e) => setWorkingDays(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between ui-font text-xs text-muted-foreground mt-1">
                      <span>10</span><span>31</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips toggle */}
              <div
                className="rounded-lg p-6 border"
                style={{ background: "oklch(0.985 0.004 85)", borderColor: "oklch(0.88 0.008 80)" }}
              >
                <h3
                  className="ui-font text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "oklch(0.42 0.015 60)" }}
                >
                  Tips Your Team Has Adopted
                </h3>
                <div className="space-y-2.5">
                  {TIPS.map((tip, i) => (
                    <label key={tip.rank} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => {
                          const next = [...adopted];
                          next[i] = !next[i];
                          setAdopted(next);
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: adopted[i] ? "oklch(0.32 0.09 155)" : "oklch(0.94 0.008 80)",
                          border: `1.5px solid ${adopted[i] ? "oklch(0.32 0.09 155)" : "oklch(0.80 0.010 80)"}`,
                        }}
                      >
                        {adopted[i] && (
                          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="ui-font text-sm font-medium"
                          style={{ color: adopted[i] ? "oklch(0.22 0.015 60)" : "oklch(0.60 0.010 60)" }}
                        >
                          #{tip.rank} {tip.title}
                        </span>
                      </div>
                      <span
                        className="ui-font text-xs font-semibold tabular-nums flex-shrink-0"
                        style={{ color: "oklch(0.32 0.09 155)" }}
                      >
                        −{Math.round(TIP_REDUCTIONS[i] * 100)}%
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Savings highlight */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  background: "oklch(0.32 0.09 155)",
                  borderColor: "oklch(0.28 0.09 155)",
                }}
              >
                <p
                  className="ui-font text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "oklch(0.75 0.06 155)" }}
                >
                  Monthly Savings
                </p>
                <div
                  className="text-5xl font-bold tabular-nums leading-none mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.97 0.005 85)" }}
                >
                  {animPct}%
                </div>
                <p className="ui-font text-sm" style={{ color: "oklch(0.80 0.04 155)" }}>
                  token reduction
                </p>
                <div
                  className="mt-4 pt-4 border-t"
                  style={{ borderColor: "oklch(0.40 0.09 155)" }}
                >
                  <p className="ui-font text-xs" style={{ color: "oklch(0.75 0.06 155)" }}>
                    Tokens saved
                  </p>
                  <p
                    className="ui-font text-2xl font-bold tabular-nums"
                    style={{ color: "oklch(0.97 0.005 85)" }}
                  >
                    {fmt(animSavedTokens)}
                  </p>
                </div>
              </div>

              {/* Cost cards */}
              <div
                className="rounded-lg p-5 border"
                style={{ background: "oklch(0.985 0.004 85)", borderColor: "oklch(0.88 0.008 80)" }}
              >
                <p className="ui-font text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Monthly cost — before
                </p>
                <p
                  className="ui-font text-2xl font-bold tabular-nums"
                  style={{ color: "oklch(0.56 0.12 35)" }}
                >
                  ${baseMonthlyCost.toFixed(2)}
                </p>
                <p className="ui-font text-xs text-muted-foreground mt-0.5">
                  {fmt(baseMonthlyTokens)} tokens
                </p>
              </div>

              <div
                className="rounded-lg p-5 border"
                style={{ background: "oklch(0.97 0.04 155)", borderColor: "oklch(0.88 0.06 155)" }}
              >
                <p
                  className="ui-font text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "oklch(0.32 0.09 155)" }}
                >
                  Monthly cost — after
                </p>
                <p
                  className="ui-font text-2xl font-bold tabular-nums"
                  style={{ color: "oklch(0.22 0.09 155)" }}
                >
                  {fmtCost(animOptCost)}
                </p>
                <p className="ui-font text-xs mt-0.5" style={{ color: "oklch(0.42 0.06 155)" }}>
                  {fmt(baseMonthlyTokens - savedTokens)} tokens
                </p>
              </div>

              <div
                className="rounded-lg p-5 border"
                style={{ background: "oklch(0.985 0.004 85)", borderColor: "oklch(0.88 0.008 80)" }}
              >
                <p className="ui-font text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Cost saved per month
                </p>
                <p
                  className="ui-font text-2xl font-bold tabular-nums"
                  style={{ color: "oklch(0.32 0.09 155)" }}
                >
                  {fmtCost(animSavedCost)}
                </p>
                <p className="ui-font text-xs text-muted-foreground mt-0.5">
                  ≈ {fmtCost(animSavedCost * 12)} per year
                </p>
              </div>

              <p
                className="ui-font text-xs leading-relaxed"
                style={{ color: "oklch(0.60 0.010 60)" }}
              >
                * Reduction estimates are conservative and compound multiplicatively. Actual savings depend on your specific workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeNav, setActiveNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = TIPS.map((t) => document.getElementById(`tip-${t.rank}`));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i];
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveNav(`tip-${TIPS[i].rank}`);
          return;
        }
      }
      setActiveNav(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.985 0.004 85)" }}>
      {/* ── Sticky Nav ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "oklch(0.985 0.004 85 / 0.95)",
          backdropFilter: "blur(8px)",
          borderColor: "oklch(0.88 0.008 80)",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-base"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.015 60)" }}
              >
                Claude Code
              </span>
              <span
                className="ui-font text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: "oklch(0.32 0.09 155)", color: "oklch(0.97 0.005 85)" }}
              >
                Token ROI Guide
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {TIPS.map((t) => (
                <button
                  key={t.rank}
                  onClick={() => scrollTo(`tip-${t.rank}`)}
                  className="ui-font text-xs font-medium px-2.5 py-1.5 rounded transition-all"
                  style={{
                    background: activeNav === `tip-${t.rank}` ? "oklch(0.32 0.09 155)" : "transparent",
                    color: activeNav === `tip-${t.rank}` ? "oklch(0.97 0.005 85)" : "oklch(0.50 0.015 60)",
                  }}
                >
                  #{t.rank}
                </button>
              ))}
              <button
                onClick={() => scrollTo("calculator")}
                className="ui-font text-xs font-semibold px-3 py-1.5 rounded ml-2 transition-all"
                style={{
                  background: "oklch(0.56 0.12 35)",
                  color: "oklch(0.97 0.005 85)",
                }}
              >
                Calculator
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663568977484/BRGEbe92Va2XVXgqScC3PU/hero-bg-N5GxE45FKeu5JYbmKBwPqV.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container py-20 lg:py-28">
          <div className="max-w-3xl">
            <p
              className="ui-font text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.56 0.12 35)" }}
            >
              Efficiency Audit · 7 Strategies Ranked by ROI
            </p>
            <h1
              className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.18 0.015 60)" }}
            >
              Reduce Claude Code Token Usage by{" "}
              <span style={{ color: "oklch(0.32 0.09 155)" }}>90%</span>
            </h1>
            <p
              className="text-xl leading-relaxed max-w-2xl mb-8"
              style={{ color: "oklch(0.35 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
            >
              Seven strategies ranked by their return on investment — highest impact, lowest friction first. Each tip is scored on impact and complexity so you know exactly where to start.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("tip-1")}
                className="ui-font font-semibold px-6 py-3 rounded-md transition-all hover:opacity-90"
                style={{ background: "oklch(0.32 0.09 155)", color: "oklch(0.97 0.005 85)" }}
              >
                Read the Guide
              </button>
              <button
                onClick={() => scrollTo("calculator")}
                className="ui-font font-semibold px-6 py-3 rounded-md border transition-all hover:opacity-90"
                style={{
                  background: "transparent",
                  color: "oklch(0.32 0.09 155)",
                  borderColor: "oklch(0.32 0.09 155)",
                }}
              >
                Open Calculator
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── ROI Summary Table + Chart ── */}
      <section
        className="py-16 border-b"
        style={{ background: "oklch(0.975 0.005 80)", borderColor: "oklch(0.88 0.008 80)" }}
      >
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.015 60)" }}
            >
              ROI Summary
            </h2>
            <p
              className="text-base mb-8"
              style={{ color: "oklch(0.50 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
            >
              All 7 strategies ranked by ROI = Impact ÷ Complexity. Higher is better.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Table */}
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "oklch(0.88 0.008 80)" }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "oklch(0.32 0.09 155)" }}>
                      {["Rank", "Tip", "Impact", "Complexity", "ROI"].map((h) => (
                        <th
                          key={h}
                          className="ui-font text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left"
                          style={{ color: "oklch(0.85 0.04 155)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIPS.map((tip, i) => (
                      <tr
                        key={tip.rank}
                        className="border-t cursor-pointer transition-colors hover:bg-[oklch(0.97_0.04_155)]"
                        style={{ borderColor: "oklch(0.92 0.006 80)" }}
                        onClick={() => scrollTo(`tip-${tip.rank}`)}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="ui-font text-xs font-bold w-6 h-6 rounded flex items-center justify-center"
                            style={{
                              background: i < 3 ? "oklch(0.32 0.09 155)" : "oklch(0.94 0.008 80)",
                              color: i < 3 ? "oklch(0.97 0.005 85)" : "oklch(0.42 0.015 60)",
                            }}
                          >
                            {tip.rank}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 ui-font text-xs font-medium max-w-[140px]"
                          style={{ color: "oklch(0.30 0.015 60)" }}
                        >
                          {tip.title}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="ui-font text-xs font-semibold tabular-nums"
                            style={{ color: "oklch(0.32 0.09 155)" }}
                          >
                            {tip.impact}/10
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="ui-font text-xs font-semibold tabular-nums"
                            style={{ color: "oklch(0.56 0.12 35)" }}
                          >
                            {tip.complexity}/10
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RoiBar value={tip.roi} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bar chart */}
              <div>
                <p
                  className="ui-font text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "oklch(0.50 0.015 60)" }}
                >
                  ROI Score by Tip
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={ROI_CHART_DATA}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    barSize={18}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "oklch(0.55 0.015 60)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: "oklch(0.40 0.015 60)", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      cursor={{ fill: "oklch(0.94 0.008 80)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div
                            className="rounded-md px-3 py-2 shadow-md border"
                            style={{
                              background: "oklch(0.985 0.004 85)",
                              borderColor: "oklch(0.88 0.008 80)",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            <p className="text-xs font-semibold" style={{ color: "oklch(0.22 0.015 60)" }}>
                              {d.title}
                            </p>
                            <p className="text-xs" style={{ color: "oklch(0.32 0.09 155)" }}>
                              ROI: {d.roi}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                      {ROI_CHART_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tips ── */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.015 60)" }}
              >
                The 7 Strategies
              </h2>
              <p
                className="text-base"
                style={{ color: "oklch(0.50 0.015 60)", fontFamily: "'Source Serif 4', serif" }}
              >
                Sorted by ROI — best bang for your buck first. Click "Show details" on any tip to see before/after examples.
              </p>
            </div>

            {/* Tips with left margin offset */}
            <div className="relative pl-0 lg:pl-20 space-y-6">
              {TIPS.map((tip, i) => (
                <TipCard key={tip.rank} tip={tip} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ── */}
      <Calculator />

      {/* ── Footer ── */}
      <footer
        className="py-10 border-t"
        style={{ borderColor: "oklch(0.88 0.008 80)", background: "oklch(0.975 0.005 80)" }}
      >
        <div className="container">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p
                className="font-bold text-sm"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.30 0.015 60)" }}
              >
                Claude Code Token ROI Guide
              </p>
              <p className="ui-font text-xs mt-0.5" style={{ color: "oklch(0.60 0.010 60)" }}>
                Strategies ranked by impact ÷ complexity. Start with #1.
              </p>
            </div>
            <div className="flex gap-6">
              {TIPS.map((t) => (
                <button
                  key={t.rank}
                  onClick={() => scrollTo(`tip-${t.rank}`)}
                  className="ui-font text-xs font-medium transition-colors hover:opacity-70"
                  style={{ color: "oklch(0.50 0.015 60)" }}
                >
                  #{t.rank}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
