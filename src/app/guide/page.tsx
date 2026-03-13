"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    Target,
    Zap,
    ShieldCheck,
    MessageSquare,
    Users,
    Trophy,
    CheckCircle2,
    Sparkles,
    Code2,
    Cpu,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

// Note: In Next.js App Router, metadata should be in a separate layout or sibling page file if this is a Client Component.
// However, for this task, I will focus on internal SEO markers like structured data and semantic headings.

export default function GuidePage() {



    const costarSteps = [
        {
            letter: "C",
            title: "Context",
            description: "Provide background information to set the stage. What is the specific scenario, technical stack, or background the AI must know?",
            icon: <Users className="w-5 h-5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            letter: "O",
            title: "Objective",
            description: "Clearly define the goal. What exactly do you want the AI to achieve? Be explicit about the desired outcome.",
            icon: <Target className="w-5 h-5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            letter: "S",
            title: "Style",
            description: "Specify the desired writing or coding style. Should it emulate a specific expert, be terse, or follow a professional framework?",
            icon: <Sparkles className="w-5 h-5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            letter: "T",
            title: "Tone",
            description: "Indicate the emotional character or attitude. Should the response be confident, encouraging, neutral, or strictly objective?",
            icon: <MessageSquare className="w-5 h-5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            letter: "A",
            title: "Audience",
            description: "Identify the intended recipients. Tailoring to a senior architect vs a non-technical client changes the vocabulary and complexity.",
            icon: <Users className="w-5 h-5" />,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
        {
            letter: "R",
            title: "Response",
            description: "Define the output format and structure. JSON, Markdown, a specific file tree, or bullet points—specify for zero-shot accuracy.",
            icon: <Trophy className="w-5 h-5" />,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10"
        }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "The Art & Science of High-Velocity Prompting",
        "description": "Learn the CO-STAR framework and model-specific prompting techniques for Claude 3.5 Sonnet and GPT-4o.",
        "author": {
            "@type": "Organization",
            "name": "PromptMint"
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-20 relative z-10">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                        <Link href="/editor">
                            <Button
                                variant="ghost"
                                className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Editor
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="mb-24 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                            <BookOpen className="w-3 h-3" />
                            AI Strategy Manual
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                            The Standards for <br />
                            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                Engineering Orchestration
                            </span>
                        </h1>
                        <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
                            Stop fighting prompt drift. Master the frameworks that turn technical intent into production-grade architectures.
                        </p>
                    </motion.div>
                </header>

                {/* The CO-STAR Framework */}
                <section className="mb-32">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="md:w-1/3 space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">The CO-STAR <br />Framework</h2>
                            <p className="text-muted-foreground">
                                PromptMint is built on the CO-STAR method—a gold-standard framework for structuring AI instructions. By following these 6 pillars, you eliminate ambiguity and get exactly what you need on the first try.
                            </p>
                            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                                <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
                                    &quot;The quality of your AI&apos;s output is directly proportional to the clarity of your constraints.&quot;
                                </blockquote>
                            </div>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {costarSteps.map((step, idx) => (
                                <motion.div
                                    key={step.letter}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 rounded-2xl bg-card border border-border hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5 group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        {step.icon}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xl font-black ${step.color}`}>{step.letter}</span>
                                        <h3 className="font-bold">{step.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Step 3: Target AI & IDEs */}
                <section className="mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-8 rounded-[2rem] bg-card border border-border space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                                <Target className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black">Choosing Your Goal Mode</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Goal Modes define the <strong>depth and complexity</strong> of the generated prompt. Choosing the right mode ensures the AI focuses on what matters most for your current task.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-500 mt-1">1</div>
                                    <div>
                                        <h4 className="font-bold text-sm">Scaffold</h4>
                                        <p className="text-xs text-muted-foreground">Generates a high-level project structure and boilerplate. Best for starting from scratch or exploring folder architectures.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500 mt-1">2</div>
                                    <div>
                                        <h4 className="font-bold text-sm">Production-ready</h4>
                                        <p className="text-xs text-muted-foreground">Forces the AI to include error handling, logging, Zod validation, and unit test placeholders. Use this for scalable, real-world apps.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-500 mt-1">3</div>
                                    <div>
                                        <h4 className="font-bold text-sm">Agentic Flight Plan</h4>
                                        <p className="text-xs text-muted-foreground">Creates a multi-phase implementation roadmap. It breaks down complex tasks into manageable chunks that you can execute sequentially.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-500 mt-1">4</div>
                                    <div>
                                        <h4 className="font-bold text-sm">Refactor existing code</h4>
                                        <p className="text-xs text-muted-foreground">Instructs the AI to analyze and optimize your logic, focusing on clean code principles and performance without changing behavior.</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-8 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Pro Tip: Goal Selection
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Use <strong>Agentic Flight Plan</strong> first to define the logic, then switch to <strong>Production-ready</strong> to generate the actual implementation components.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 text-white space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black">Target AI & IDEs</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Every major LLM has a unique &quot;personality&quot; and prompt sensitivity. Choosing the correct model flavor changes how PromptMint structures the final instructions.
                            </p>
                            <div className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-cyan-400 text-sm">AI IDEs & Agents (Cursor, Windsurf, Trae)</h4>
                                    <p className="text-xs text-zinc-500">Optimized for <strong>multi-file editing</strong> and agentic behavior. We prioritize whole-file context and surgical edits over simple chat snippets.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-amber-400 text-sm">Web Builders (v0, Bolt.new, Lovable)</h4>
                                    <p className="text-xs text-zinc-500">These tools love <strong>single-file masterpieces</strong> or Vite-based scaffolds. We optimize for code that runs instantly in the browser without manual stitching.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-indigo-400 text-sm">Claude 3.5 Sonnet (Nuance King)</h4>
                                    <p className="text-xs text-zinc-500">Excels at long-form reasoning. We use <strong>XML tagging</strong> and strict &quot;Context-before-Task&quot; ordering.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-emerald-400 text-sm">GPT-4o (Reasoning Powerhouse)</h4>
                                    <p className="text-xs text-zinc-500">Best for following strict negative rules. We structure the prompt with clear <strong>Objective vs. Constraints</strong> blocks.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-pink-400 text-sm">Antigravity (Agentic Mastery)</h4>
                                    <p className="text-xs text-zinc-500">Optimized for <strong>complex, high-velocity engineering</strong>. We focus on deep architectural reasoning and broken-flow prevention.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Target Model Flavors */}
                <section className="mb-32">
                    <div className="rounded-3xl bg-zinc-900 dark:bg-zinc-900 overflow-hidden border border-zinc-800 text-white relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 pointer-events-none" />
                        <div className="px-8 py-16 md:p-16 relative z-10">
                            <div className="max-w-3xl">
                                <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                                    Why &quot;Model Flavors&quot; Matter.
                                </h2>
                                <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
                                    Not all LLMs are created equal. Claude 3.5 Sonnet excels at logical nuance and code structure, while GPT-4o is a monster at following multi-step formatting instructions. One prompt does NOT fit all.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                                <Cpu className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-bold">Claude 3.5 Sonnet</h4>
                                        </div>
                                        <p className="text-sm text-zinc-500">
                                            Claude excels at nuanced reasoning and large context (200k). For 100% accuracy, use XML tags like <span className="text-orange-400/80 font-mono text-[10px]">&lt;context&gt;</span> or <span className="text-orange-400/80 font-mono text-[10px]">&lt;task&gt;</span>. Place context before the question to guide its attention properly.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-bold">GPT-4o</h4>
                                        </div>
                                        <p className="text-sm text-zinc-500">
                                            A powerhouse for strict instruction following and multimodal logic (128k context). Focus your prompt on &quot;Negative Constraints&quot; (what NOT to do) and strict output schemas to prevent conversational drift.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Architecture Guardrails */}
                <section className="mb-32 text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-6">Built for Professionals.</h2>
                    <p className="text-xl text-muted-foreground mb-16 leading-relaxed">
                        Standard AI prompts often produce &quot;lazy&quot; code. PromptMint lets you force strict <strong>Architecture Guardrails</strong> directly into the foundation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mx-auto">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Strict Type Safety</h3>
                            <p className="text-sm text-muted-foreground">Force no &apos;any&apos;, proper interfaces, and exhaustive checks for enterprise-grade durability.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Quality Blueprints</h3>
                            <p className="text-sm text-muted-foreground">Apply production-grade standards with 1-click presets: Architect, Sprinter, or Minimalist.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Security & a11y</h3>
                            <p className="text-sm text-muted-foreground">Guarantee ARIA compliance, semantic HTML, and secure patterns—building tech that everyone can trust.</p>
                        </div>
                    </div>

                    <div className="mt-24 p-8 rounded-2xl bg-muted/20 border border-border text-left relative group overflow-hidden">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                        <div className="relative">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Pro Engineering: The &quot;Quality Multiplier&quot;
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                Most AI models gravitate toward generic, tutorial-level code. PromptMint solves this by injecting <strong>Architecture Guardrails</strong> that favor design patterns over simple loops.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <h4 className="font-bold text-xs mb-2">Zod Schema Validation</h4>
                                    <p className="text-[11px] text-muted-foreground">Toggles &quot;Shared Type Safety&quot; - ensures the AI generates Zod validation schemas for data objects, preventing runtime crashes.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <h4 className="font-bold text-xs mb-2">Modular Feature Folders</h4>
                                    <p className="text-[11px] text-muted-foreground">The AI will avoid messy flat folder structures, focusing on a scalable modular architecture organized by domain area.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <h4 className="font-bold text-xs mb-2">App Router Patterns</h4>
                                    <p className="text-[11px] text-muted-foreground">Forces modern Next.js/React patterns like Server Components (RSC) and Suspense boundaries for maximum performance.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                    <h4 className="font-bold text-xs mb-2">Vitest + React Testing</h4>
                                    <p className="text-[11px] text-muted-foreground">The AI will architect logic to be 100% testable, including props-based isolation and mocked API interactions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How Magic Choice Works */}
                <section className="mb-32">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="md:w-1/3 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                                <Zap className="w-3 h-3" />
                                Smart Inference
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">How Smart <br />Stack Inference Works</h2>
                            <p className="text-muted-foreground">
                                The Smart Inference engine analyzes your technical intent to detect your stack — operating in two distinct modes.
                            </p>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/5 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold mb-2">Extraction Mode</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    <strong>Default behavior.</strong> Only selects technologies you explicitly name. Everything else stays &quot;None&quot; — giving you full manual control.
                                </p>
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Example</p>
                                    <p className="text-xs font-mono text-cyan-500">&quot;auth system using MongoDB and Node.js&quot;</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">→ Express, MongoDB, JavaScript. Everything else: None.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-2xl bg-card border border-border hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold mb-2">Full Inference Mode</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    Triggered when you ask the AI to decide. It fills <strong>all</strong> categories with the best modern choices for your idea.
                                </p>
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Example</p>
                                    <p className="text-xs font-mono text-violet-500">&quot;Build a SaaS app, choose the best stack for me&quot;</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">→ Next.js, PostgreSQL, Tailwind, Clerk, Vercel, Zustand…</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                                Trigger Phrases for Full Inference
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "choose for me",
                                    "pick the best",
                                    "recommend a stack",
                                    "suggest technologies",
                                    "you decide",
                                    "auto-select everything",
                                ].map((phrase) => (
                                    <span
                                        key={phrase}
                                        className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono text-cyan-600 dark:text-cyan-400"
                                    >
                                        &quot;{phrase}&quot;
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-violet-500" />
                                Pro Tip: UI Interaction
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                Did you know? You can <strong>click the sector title</strong> (e.g., &quot;Frontend&quot; or &quot;Database&quot;) in Step 2 to quickly toggle between <strong>None</strong> and <strong>Smart Inference</strong> for that entire category.
                            </p>
                            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-widest border border-violet-500/20 rounded-lg px-2 py-1">
                                <Zap className="w-3 h-3" />
                                Use this to save time
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Quality Blueprint */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">The 100% Quality Blueprint</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Follow this 4-step surgical workflow to ensure your minted prompts produce industrial-grade logic every single time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Prime for Inference",
                                desc: "End your idea with \"choose the best stack for me\". This triggers the full engine to architect your entire foundation.",
                                icon: <Sparkles className="w-5 h-5 text-amber-500" />
                            },
                            {
                                step: "02",
                                title: "Inject Guardrails",
                                desc: "Switch to Visual/Infra tabs and ensure \"Modular Folders\" and \"Strict Type Safety\" are active. These prevent lazy code.",
                                icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            },
                            {
                                step: "03",
                                title: "Depth selection",
                                desc: "Set Goal Mode to \"Production-ready\" or \"Agentic Flight Plan\". Never settle for Default unless it's a quick prototype.",
                                icon: <Target className="w-5 h-5 text-rose-500" />
                            },
                            {
                                step: "04",
                                title: "Model Alignment",
                                desc: "Target \"Claude 3.5 Sonnet\" for logic depth or \"AI IDEs\" if you are copying directly into Cursor's Composer.",
                                icon: <Cpu className="w-5 h-5 text-cyan-500" />
                            }
                        ].map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="p-8 rounded-3xl bg-card border border-border group-hover:border-violet-500/30 transition-all">
                                    <span className="text-4xl font-black text-muted-foreground/10 absolute top-4 right-6 group-hover:text-violet-500/20 transition-colors">{item.step}</span>
                                    <div className="mb-6">{item.icon}</div>
                                    <h3 className="text-lg font-black mb-3">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mb-24">
                    <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-700 text-white text-center shadow-2xl shadow-violet-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -ml-32 -mb-32" />

                        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Ready to mint your <br />next big idea?</h2>
                        <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">
                            Join the growing community of developers using industrial-grade prompts to ship faster.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link href="/">
                                <Button size="lg" className="rounded-full px-8 bg-white text-violet-600 hover:bg-zinc-100 font-bold text-lg h-14 w-full sm:w-auto">
                                    Get Started for Free
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="default" size="lg" className="rounded-full px-8 border-white/20 hover:bg-white/10 text-white font-bold text-lg h-14 w-full sm:w-auto">
                                    View Pro Features
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-4 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
                    <p>© 2026 PromptMint. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
