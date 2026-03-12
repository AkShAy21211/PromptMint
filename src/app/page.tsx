"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Layers, Globe, Cpu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/Logo";

const EXAMPLES = [
  {
    id: "ui",
    tag: "UI Component",
    tagColor: "text-rose-400",
    input: '"build me a dark navbar"',
    missing: ["Framework?", "CSS approach?", "TypeScript?", "Animations?", "Responsive?"],
    prompt: [
      { section: "CONTEXT", content: "Executive dashboard, dark mode, high-density UI." },
      { section: "OBJECTIVE", content: "Build a responsive, accessible Sticky Navbar." },
      { section: "STACK", content: "Next.js 14, Tailwind, Framer Motion, Lucide." },
      { section: "CONSTRAINTS", content: "No external CSS files. Must use CSS variables." },
    ],
  },
  {
    id: "fullstack",
    tag: "Full-Stack App",
    tagColor: "text-orange-400",
    input: '"CRUD app with Express and PostgreSQL"',
    missing: ["REST or GraphQL?", "ORM setup?", "Auth pattern?", "Frontend stack?", "Schema design?"],
    prompt: [
      { section: "CONTEXT", content: "Inventory management tool for small business." },
      { section: "OBJECTIVE", content: "Implement secure CRUD with relational integrity." },
      { section: "STACK", content: "Node (TS), Express, Prisma, PostgreSQL." },
      { section: "PHASE 1", content: "Database schema (Prisma) & Migration strategy." },
    ],
  },
  {
    id: "backend",
    tag: "API / Backend",
    tagColor: "text-sky-400",
    input: '"auth system with JWT and refresh tokens"',
    missing: ["Language/runtime?", "Token strategy?", "DB for sessions?", "Password hashing?", "Middleware?"],
    prompt: [
      { section: "CONTEXT", content: "Scalable SaaS auth microservice." },
      { section: "OBJECTIVE", content: "Implement JWT/Refresh Token rotation system." },
      { section: "STACK", content: "Fastify, Redis (sessions), Argon2 hashing." },
      { section: "SECURITY", content: "HttpOnly cookies, CSRF protection, Rate limiting." },
    ],
  },
];

const FEATURES = [
  {
    icon: <Layers className="w-5 h-5" />,
    title: "CO-STAR Engineering",
    description:
      "Context, Objective, Style, Tone, Audience, and Response — the industry standard for structured AI orchestration, baked into every output.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/5 border-cyan-500/20",
    glow: "shadow-cyan-900/20",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "Smart Stack Inference",
    description:
      "Stop manual configuration. Our engine analyzes your technical intent to auto-optimize the best-fit database, framework, and auth patterns.",
    color: "text-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    glow: "shadow-amber-900/20",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Architecture Guardrails",
    description:
      "Enforce engineering standards and naming conventions. Your AI assistant stays within your project's architectural bounds.",
    color: "text-violet-400",
    bg: "bg-violet-500/5 border-violet-500/20",
    glow: "shadow-violet-900/20",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Agentic Flight Plans",
    description:
      "Don't just get a prompt. Get a multi-phase implementation roadmap specialized for Antigravity, Claude, or Cursor workflows.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    glow: "shadow-emerald-900/20",
  },
];

const USE_CASES = [
  {
    emoji: "🏗️",
    label: "Complex UI Systems",
    examples: ["Stateful multi-step forms", "Enterprise data tables", "Design system primitives"],
    color: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
  },
  {
    emoji: "🔐",
    label: "Secure Backend flows",
    examples: ["RBAC Middleware", "OIDC/OAuth integrations", "Optimized DB schemas"],
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
  },
  {
    emoji: "🛰️",
    label: "Agentic Systems",
    examples: ["Multi-phase CLI tools", "AI-driven edge handlers", "Automated migration scripts"],
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);

  useEffect(() => {
    // We already have user from context, but we want to handle the auto-redirect if signed in
    if (user && !authLoading) {
      router.push("/editor");
    }
  }, [user, authLoading, router]);

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
            <Logo />
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
            {authLoading ? (
              <div className="w-24 h-11 bg-muted dark:bg-zinc-800 rounded-xl animate-pulse" />
            ) : !user ? (
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-card/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-xl px-6 h-11"
              >
                Sign In
              </Button>
            ) : (
              <></>
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
              className="text-4xl md:text-6xl lg:text-7xl font-[900] tracking-[-0.04em] leading-[0.95] mb-4"
            >
              Stop fighting AI hallucinations.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Start architecting.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              PromptMint is the Senior Architect for your AI assistants. We transform rough ideas into structured, tech-stack-aware CO-STAR prompts that get you production-quality code on the first try.
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
                  className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 px-3 py-1.5 rounded-full"
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
                className="h-14 px-10 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-cyan-500/20 transition-all active:scale-[0.98] border border-white/10"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Architecting Free
              </Button>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  Industrial Grade
                </span>
                <span className="text-[10px] text-zinc-400">
                  5 free prompts · Razorpay Secure
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right — Interactive Comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-[1.2] w-full bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Tab selector */}
            <div className="flex border-b border-white/5 bg-white/[0.02] px-4 pt-3 gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    if (i === activeExample) return;
                    setIsTransforming(true);
                    setTimeout(() => {
                      setActiveExample(i);
                      setIsTransforming(false);
                    }, 400);
                  }}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-t-lg transition-all ${activeExample === i
                    ? "bg-zinc-900 border border-b-0 border-white/10 text-white"
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
                <div className="flex flex-col gap-2 relative">
                  {current.missing.map((q, idx) => (
                    <motion.div 
                      key={q} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-center gap-2 text-xs text-zinc-600"
                    >
                      <span className="text-rose-700 font-bold">✗</span>
                      <span>{q}</span>
                    </motion.div>
                  ))}
                  
                  {/* Floating Senior Hint */}
                  <motion.div
                    key={`hint-${current.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-rose-400/50 hidden md:block whitespace-nowrap"
                  >
                    Too vague for AI!
                  </motion.div>
                </div>
                <div className="mt-auto bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 italic">
                  AI guesses. You argue. 20 min wasted.
                </div>
              </div>

              {/* Right — Structured Output */}
              <div className="md:flex-1 p-5 flex flex-col gap-3 relative bg-card/10 backdrop-blur-xl group/output">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-violet-500 via-cyan-500 to-transparent"></div>
                
                {isTransforming ? (
                  <div className="flex flex-col gap-4 animate-pulse opacity-50">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 bg-white/5 border border-white/10 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {current.prompt.map(({ section, content }) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={section}
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-1.5 group-hover/output:border-violet-500/30 transition-colors"
                      >
                        <span className="text-[10px] font-black text-violet-400 tracking-[0.2em]">{section}</span>
                        <span className="text-xs font-medium text-zinc-300 leading-relaxed">{content}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="mt-auto bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400/90 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Architectural accuracy verified.
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
              <div key={label} className={`p-5 rounded-2xl border ${border} ${bg} backdrop-blur-md flex flex-col gap-3 group/usecase hover:bg-white/[0.02] dark:hover:bg-white/[0.04] transition-all duration-300`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl group-hover/usecase:scale-110 transition-transform">{emoji}</span>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {FEATURES.map(({ icon, title, description, color, bg }) => (
            <div key={title} className={`p-6 rounded-2xl border ${bg} hover:border-border/50 transition-all`}>
              <div className={`flex items-center gap-2 mb-3 ${color}`}>
                {icon}
                <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </motion.div>

        {/* The Senior Bridge Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32 p-12 rounded-[3.5rem] bg-zinc-950 border border-cyan-500/10 shadow-[0_0_50px_-12px_rgba(34,211,238,0.1)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-violet-600/10 transition-colors" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter">Built for engineers, not tourists.</h2>
            <div className="space-y-6 text-lg md:text-xl text-zinc-400 leading-relaxed font-medium">
              <p>
                Generic prompts lead to generic bugs. When you ask a standard LLM to &quot;build a login page,&quot; you spend more time fixing what it ignored than writing new features.
              </p>
              <p className="text-white/90">
                PromptMint bridges the gap between your intent and the AI&apos;s execution. We enforce your stack, inject architecture guardrails, and structure the output into a multi-phase **Agentic Flight Plan**.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-16 rounded-3xl bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-emerald-500/10 border border-zinc-200 dark:border-white/10 p-10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">
              Stop re-prompting. Start shipping.
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              5 free prompts, no credit card. Upgrade to Pro for ₹149/month — unlimited prompts, cloud sync, and interactive Agentic Dashboards.
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