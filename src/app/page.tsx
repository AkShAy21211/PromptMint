"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginModal } from "@/components/auth/LoginModal";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
      // If user just signed in from landing, send them to editor
      if (session?.user) router.push("/editor");
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

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
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-xl shadow-cyan-900/20 border border-white/10">
              <Image
                src="/icons/icon-192x192.png"
                alt="PromptMint Logo"
                fill
                className="object-cover"
              />
            </div>
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
        <div className="mb-16 mt-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            >
              Turn 1 messy idea → <br />
              <span className="text-violet-500">structured AI prompt</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Reduce the friction of AI generation. We architect your initial
              idea into a CO-STAR mega-prompt that significantly improves the
              quality of code generated on the first try.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-5 py-2.5 rounded-full border border-emerald-500/20 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Sparkles className="w-4 h-4" /> Save hours on every feature
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={() => router.push("/editor")}
                className="h-16 px-10 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-cyan-900/20 transition-all active:scale-[0.98] border border-white/10"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Start Minting Free
              </Button>
            </motion.div>
          </div>

          {/* Comparison Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-[1.2] w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex border-b border-zinc-800">
              <div className="flex-1 px-5 py-3 border-r border-zinc-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase">
                  Your prompt
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
            <div className="flex flex-col md:flex-row">
              {/* Left — Vague Input */}
              <div className="md:flex-1 p-5 border-b border-zinc-800 md:border-b-0 md:border-r md:border-zinc-800 flex flex-col gap-4 bg-black/30">
                <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-3 font-mono text-sm text-rose-300">
                  &quot;build me a dark navbar&quot;
                </div>
                <div className="flex flex-col gap-2">
                  {["Framework?", "CSS approach?", "TypeScript?", "Animations?", "Responsive?"].map((q) => (
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
                {[
                  { label: "Stack", value: "Next.js + Tailwind + TS", color: "text-cyan-300" },
                  { label: "Style", value: "Framer Motion, accessible", color: "text-violet-300" },
                  { label: "Output", value: "Mobile-first, dark theme", color: "text-emerald-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-3">
                    <span className="text-zinc-500 text-xs w-12 shrink-0">{label}</span>
                    <span className={`text-xs font-medium ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="mt-auto bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-400">
                  ✓ Right output, first try. Every time.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Proof / Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              title: "CO-STAR Framework",
              description: "Context, Objective, Style, Tone, Audience, Response — every prompt is architectured for precision.",
              color: "text-cyan-500",
              bg: "bg-cyan-500/5 border-cyan-500/20",
            },
            {
              title: "Stack-Aware Output",
              description: "Forces the AI to strictly respect your chosen frontend, backend, and styling stack. No surprises.",
              color: "text-violet-500",
              bg: "bg-violet-500/5 border-violet-500/20",
            },
            {
              title: "5 Free Prompts",
              description: "Get started immediately — no credit card required. Upgrade to Pro for unlimited generation.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/5 border-emerald-500/20",
            },
          ].map(({ title, description, color, bg }) => (
            <div key={title} className={`p-6 rounded-2xl border ${bg}`}>
              <h3 className={`font-bold text-sm ${color} mb-2 uppercase tracking-wide`}>{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
        <p>© 2026 PromptMint. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </main>
  );
}