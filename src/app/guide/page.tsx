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
                            The Playbook
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                            The Art & Science of <br />
                            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                High-Velocity Prompting
                            </span>
                        </h1>
                        <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
                            Stop arguing with AI. Learn the frameworks that turn simple ideas into production-ready code blocks in seconds.
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

                {/* Engineering Defaults */}
                <section className="mb-32 text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-6">Built for Professionals.</h2>
                    <p className="text-xl text-muted-foreground mb-16 leading-relaxed">
                        Standard AI prompts often produce &quot;lazy&quot; code. PromptMint lets you force strict engineering rules directly into the foundation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mx-auto">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Strict TS</h3>
                            <p className="text-sm text-muted-foreground">Force no any, proper interfaces, and exhausted switch checks for enterprise durability.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Error Security</h3>
                            <p className="text-sm text-muted-foreground">Enforce robust try-catch-finally patterns and input sanitization to block vulnerabilities.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold">Accessibility</h3>
                            <p className="text-sm text-muted-foreground">Guarantee ARIA compliance and semantic HTML—building tech that everyone can use.</p>
                        </div>
                    </div>

                    <div className="mt-24 p-8 rounded-2xl bg-muted/20 border border-border text-left">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Pro Tip: The &quot;Production Bias&quot;
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Most AI models gravitate toward generic, tutorial-level code. PromptMint solves this by injecting <strong>Engineering Defaults</strong> that favor design patterns over simple loops. By enabling <i>Functional Preference</i> or <i>Zod Validation</i>, you bypass the tutorial phase and jump straight to the code you&apos;d want in a real pull request.
                        </p>
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
