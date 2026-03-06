"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Layers, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginModal } from "@/components/auth/LoginModal";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";

const EXAMPLES = [
  {
    id: "ui",
    tag: "UI Component",
    tagColor: "text-rose-400",
    input: '"build me a dark navbar"',
    missing: ["Framework?", "CSS approach?", "TypeScript?", "Animations?", "Responsive?"],
    output: [
      { label: "Stack", value: "Next.js + Tailwind + TS", color: "text-cyan-300" },
      { label: "Style", value: "Framer Motion, accessible", color: "text-violet-300" },
      { label: "Output", value: "Mobile-first, dark theme", color: "text-emerald-300" },
    ],
  },
  {
    id: "fullstack",
    tag: "Full-Stack App",
    tagColor: "text-orange-400",
    input: '"CRUD app with Express and PostgreSQL"',
    missing: ["REST or GraphQL?", "ORM setup?", "Auth pattern?", "Frontend stack?", "Schema design?"],
    output: [
      { label: "Backend", value: "Express + PostgreSQL + TS", color: "text-cyan-300" },
      { label: "Frontend", value: "React + shadcn/ui + Framer", color: "text-violet-300" },
      { label: "Schema", value: "Tasks table, UUID keys", color: "text-emerald-300" },
    ],
  },
  {
    id: "backend",
    tag: "API / Backend",
    tagColor: "text-sky-400",
    input: '"auth system with JWT and refresh tokens"',
    missing: ["Language/runtime?", "Token strategy?", "DB for sessions?", "Password hashing?", "Middleware?"],
    output: [
      { label: "Runtime", value: "Node.js + TypeScript", color: "text-cyan-300" },
      { label: "Auth", value: "JWT + Refresh, bcrypt", color: "text-violet-300" },
      { label: "Pattern", value: "Middleware, secure cookies", color: "text-emerald-300" },
    ],
  },
];

const FEATURES = [
  {
    icon: <Layers className="w-5 h-5" />,
    title: "CO-STAR Framework",
    description:
      "Context, Objective, Style, Tone, Audience, Response — every prompt is architectured for precision, not guesswork.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/5 border-cyan-500/20",
    glow: "shadow-cyan-900/20",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Stack-Aware Output",
    description:
      "Bakes your chosen stack directly into the prompt — frontend, backend, or full-stack. The AI respects your constraints every time.",
    color: "text-violet-400",
    bg: "bg-violet-500/5 border-violet-500/20",
    glow: "shadow-violet-900/20",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Multi-Platform Testing",
    description:
      "One click to open your structured prompt in Claude, ChatGPT, Grok, or Perplexity — instantly, no copy-paste friction.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    glow: "shadow-emerald-900/20",
  },
];

const USE_CASES = [
  {
    emoji: "🎨",
    label: "UI & Components",
    examples: ["Dark navbar", "Responsive sidebar", "Animated card grid"],
    color: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
  },
  {
    emoji: "🗄️",
    label: "Backend & APIs",
    examples: ["REST API with auth", "JWT + refresh tokens", "Database schema"],
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
  },
  {
    emoji: "⚡",
    label: "Full-Stack Apps",
    examples: ["CRUD with Express + PG", "Next.js SaaS dashboard", "Real-time chat"],
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) router.push("/editor");
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const current = EXAMPLES[activeExample];

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">

        {/* Top Navigation */}
        <nav className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
           
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                PromptMint
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide">
                AI Prompt Engineering Suite
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl px-4 h-11 font-medium"
            >
              Pricing
            </Button>
            {!user ? (
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-card/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-xl px-6 h-11"
              >
                Sign In
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/editor")}
                className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold rounded-xl px-6 h-11"
              >
                Open Editor
              </Button>
            )}
          </motion.div>
        </nav>

        {/* Hero Section */}
        <div className="mb-20 mt-8 flex flex-col lg:flex-row items-center gap-14">
          {/* Left — Copy */}
          <div className="flex-1 space-y-8">
           

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            >
              Any dev idea →{" "}
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                production-ready
              </span>
              <br />
              AI prompt.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Frontend components, full-stack apps, backend APIs — PromptMint architects your rough idea into a structured CO-STAR mega-prompt that gets you production-quality code on the first try.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              {["UI Components", "REST APIs", "Full-Stack Apps"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 pt-2"
            >
              <Button
                size="lg"
                onClick={() => router.push("/editor")}
                className="h-14 px-10 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-cyan-900/20 transition-all active:scale-[0.98] border border-white/10"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Minting Free
              </Button>
              <span className="text-xs text-zinc-500 font-medium">
                5 free prompts · No card needed
              </span>
            </motion.div>
          </div>

          {/* Right — Interactive Comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-[1.2] w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Tab selector */}
            <div className="flex border-b border-zinc-800 bg-black/20 px-4 pt-3 gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExample(i)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all ${
                    activeExample === i
                      ? "bg-zinc-900 border border-b-0 border-zinc-700 text-white"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {ex.tag}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="flex border-b border-zinc-800">
              <div className="flex-1 px-5 py-3 border-r border-zinc-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase">
                  Your idea
                </span>
              </div>
              <div className="flex-1 px-5 py-3 flex items-center gap-2 bg-violet-500/5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> After PromptMint
                </span>
              </div>
            </div>

            {/* Content */}
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col md:flex-row"
            >
              {/* Left — Vague Input */}
              <div className="md:flex-1 p-5 border-b border-zinc-800 md:border-b-0 md:border-r md:border-zinc-800 flex flex-col gap-4 bg-black/30">
                <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-3 font-mono text-sm text-rose-300">
                  {current.input}
                </div>
                <div className="flex flex-col gap-2">
                  {current.missing.map((q) => (
                    <div key={q} className="flex items-center gap-2 text-xs text-zinc-600">
                      <span className="text-rose-700 font-bold">✗</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto bg-rose-950/30 border border-rose-900/40 rounded-lg p-3 text-xs text-rose-400/80">
                  AI guesses. You argue. 20 min wasted.
                </div>
              </div>

              {/* Right — Structured Output */}
              <div className="md:flex-1 p-5 flex flex-col gap-3 relative bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500"></div>
                {current.output.map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-3"
                  >
                    <span className="text-zinc-500 text-xs w-14 shrink-0">{label}</span>
                    <span className={`text-xs font-medium ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="mt-auto bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-400">
                  ✓ Right output, first try. Every time.
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Use Cases Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-6 text-center">
            Works for every kind of dev task
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {USE_CASES.map(({ emoji, label, examples, color, border, bg }) => (
              <div key={label} className={`p-5 rounded-2xl border ${border} ${bg} flex flex-col gap-3`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emoji}</span>
                  <span className={`font-bold text-sm ${color}`}>{label}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-xs text-zinc-400">
                      <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {FEATURES.map(({ icon, title, description, color, bg }) => (
            <div key={title} className={`p-6 rounded-2xl border ${bg}`}>
              <div className={`flex items-center gap-2 mb-3 ${color}`}>
                {icon}
                <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-16 rounded-3xl bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-emerald-500/10 border border-white/10 p-10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">
              Stop re-prompting. Start shipping.
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              5 free prompts, no credit card. Upgrade to Pro for ₹149/month — unlimited prompts, cloud sync, and .doc export.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push("/editor")}
            className="shrink-0 h-14 px-10 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-cyan-900/20 transition-all active:scale-[0.98] border border-white/10"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Try PromptMint Free
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-4 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
        <p>© 2026 PromptMint. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>
      </footer>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </main>
  );
}