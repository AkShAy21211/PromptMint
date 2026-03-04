"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stack, StylingType, LanguageType, AnimationType } from "@/lib/types";
import { StackToggle } from "@/components/StackToggle";
import { PromptOutput } from "@/components/PromptOutput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LoginModal } from "@/components/auth/LoginModal";
import { type User } from "@supabase/supabase-js";
import { PromptHistory } from "@/components/PromptHistory";
import { LimitModal } from "@/components/LimitModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migrateLocalPrompts } from "@/lib/supabase/migration";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [userIdea, setUserIdea] = useState("");
  const [stack, setStack] = useState<Stack>({
    styling: "shadcn/ui",
    language: "TypeScript",
    animation: "Framer Motion",
  });
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const MAX_FREE = 5;
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch usage count from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('usage_count, is_pro')
          .eq('id', user.id)
          .single();

        if (profile) {
          setPromptCount(profile.usage_count);
          setIsPro(profile.is_pro);
        }
      } else {
        // Fallback to local storage for guest
        const count = localStorage.getItem("guest_prompt_count");
        setPromptCount(count ? parseInt(count) : 0);
      }
      setIsInitialLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch or create profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('usage_count, is_pro, plan_type')
          .eq('id', session.user.id)
          .maybeSingle();

        const { error: profileError } = await supabase
          .from('profiles')
          .select('usage_count, is_pro, plan_type')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile && !profileError) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({ id: session.user.id, usage_count: 0, is_pro: false, plan_type: 'free' })
            .select()
            .single();

          if (!createError) profile = newProfile;
        }

        if (profile) {
          setPromptCount(profile.usage_count);
          const unlimited = profile.is_pro || profile.plan_type === 'pro' || profile.plan_type === 'lifetime';
          setIsPro(unlimited);

          // Only trigger migration for Pro/Lifetime users
          if (unlimited) {
            await migrateLocalPrompts(session.user.id);
          }
        }
      } else {
        setIsPro(false);
        const count = localStorage.getItem("guest_prompt_count");
        setPromptCount(count ? parseInt(count) : 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined' && 'posthog' in window) {
      (window as unknown as { posthog: { reset: () => void } }).posthog.reset();
    }
    window.location.href = "/";
  };

  const handleGenerate = async () => {
    if (userIdea.trim().length < 4) {
      toast({
        title: "Input too short",
        description: "Please provide a bit more detail about your idea (at least 4 characters).",
        variant: "destructive",
      });
      return;
    }

    // Usage limit check
    if (!isPro && promptCount >= MAX_FREE) {
      setIsLimitModalOpen(true);
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdea, stack }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 || data.error === "LIMIT_REACHED") {
          setPromptCount(MAX_FREE); // Sync UI State immediately
          if (!user) {
            localStorage.setItem("guest_prompt_count", MAX_FREE.toString());
            setIsLoginModalOpen(true);
          }
          throw new Error(data.message || "Limit reached. Please sign in!");
        }
        throw new Error(data.error || "Failed to generate prompt");
      }

      const generatedResult = data.result;
      setResult(generatedResult);

      if (generatedResult.startsWith("ERROR:")) {
        toast({
          title: "Invalid Idea",
          description: generatedResult.replace("ERROR: ", ""),
          variant: "destructive",
        });
        return;
      }

      // Update local UI state
      const newCount = promptCount + 1;
      setPromptCount(newCount);

      const STORAGE_KEY = "promptmint_history";

      if (!isPro) {
        // Save to local history for all free users (Guests + Logged-in Free)
        const saved = localStorage.getItem(STORAGE_KEY);
        const history = saved ? JSON.parse(saved) : [];
        const newEntry = {
          idea: userIdea,
          result: generatedResult,
          stack: stack, // Include stack for better restoration
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...history].slice(0, 10)));

        // Update guest count only if not logged in
        if (!user) {
          localStorage.setItem("guest_prompt_count", newCount.toString());
        }
      }

      if (typeof window !== 'undefined' && 'posthog' in window) {
        (window as unknown as { posthog: { capture: (event: string, properties: unknown) => void } }).posthog.capture('prompt_minted', {
          styling: stack.styling,
          language: stack.language,
          animation: stack.animation,
          is_pro: isPro,
          prompt_length: userIdea.length
        });
      }

      toast({
        title: "Success",
        description: user
          ? `Prompt minted! (${newCount}/${MAX_FREE} used)`
          : `Prompt minted! (${newCount}/${MAX_FREE} total)`,
      });

      // Scroll to result on mobile
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <p className="text-muted-foreground text-sm font-medium tracking-wide">AI Prompt Engineering Suite</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />

            {!isPro && (
              <Button
                variant="ghost"
                onClick={() => router.push("/pricing")}
                className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl px-4 h-11 font-medium"
              >
                Pricing
              </Button>
            )}

            {/* Visual Usage Status */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 rounded-full min-w-[140px] justify-center">
              {isInitialLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 dark:bg-zinc-700 animate-pulse" />
                  <div className="h-3 w-20 bg-muted dark:bg-zinc-800 rounded-md animate-pulse" />
                </div>
              ) : isPro ? (
                <Link href="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">PRO UNLIMITED</span>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      promptCount >= MAX_FREE ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      promptCount >= MAX_FREE ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {MAX_FREE - promptCount}/{MAX_FREE} PROMPTS LEFT
                    </span>
                  </div>
                  {promptCount >= MAX_FREE && (
                    <button
                      onClick={() => router.push("/pricing")}
                      className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest border-l border-zinc-800 pl-3"
                    >
                      Upgrade Pro
                    </button>
                  )}
                </div>
              )}
            </div>

            {!user ? (
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-card/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-xl px-6 h-11"
              >
                Sign In
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/account")}
                  className="w-11 h-11 rounded-xl bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                >
                  <UserIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-11 h-11 rounded-xl bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </nav>

        {/* Hero Section (High Conversion) */}
        <div className="mb-16 mt-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Turn 1 messy idea → <br />
              <span className="text-violet-500">structured AI prompt</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Reduce the friction of AI generation. We architect your initial idea into a CO-STAR mega-prompt that significantly improves the quality of code generated on the first try.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-5 py-2.5 rounded-full border border-emerald-500/20 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Sparkles className="w-4 h-4" /> Save hours on every feature
              </div>
            </div>
          </div>

          {/* Comparison Component */}
          <div className="flex-[1.2] w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[300px]">

            {/* Header */}
            <div className="flex border-b border-zinc-800">
              <div className="flex-1 px-5 py-3 border-r border-zinc-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase">Your prompt</span>
              </div>
              <div className="flex-1 px-5 py-3 flex items-center gap-2 bg-violet-500/5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> After PromptMint
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1">

              {/* Left — Vague Input */}
              <div className="flex-1 p-5 border-r border-zinc-800 flex flex-col gap-4 bg-black/30">
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
              <div className="flex-1 p-5 flex flex-col gap-3 relative bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Column: Input Panel (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-12 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Step 1: Define Your Idea
              </span>
              <div className="relative group">
                <Textarea
                  placeholder="Describe your development task (e.g., 'a secure authentication flow with JWTs', or 'a responsive landing page hero')..."
                  className="min-h-[200px] bg-card/40 dark:bg-zinc-900/40 border-border dark:border-zinc-800 hover:border-border/80 dark:hover:border-zinc-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/10 text-lg resize-none p-5 rounded-2xl transition-all placeholder:text-muted-foreground/40"
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground/40">
                  {userIdea.length} CHARS
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Step 2: Refine Your Stack
              </span>
              <div className="grid gap-6 p-6 rounded-2xl bg-card/20 dark:bg-zinc-900/30 border border-border dark:border-zinc-800/50">
                <StackToggle
                  label="Styling"
                  options={["Tailwind CSS", "shadcn/ui", "CSS Modules", "NativeWind", "SwiftUI", "Jetpack Compose", "Material UI", "Chakra UI", "Bootstrap"]}
                  selected={stack.styling}
                  onChange={(val) => setStack({ ...stack, styling: val as StylingType })}
                />
                <StackToggle
                  label="Language"
                  options={["TypeScript", "JavaScript", "Swift", "Kotlin", "Java", "Python", "Go", "C# (Unity)"]}
                  selected={stack.language}
                  onChange={(val) => setStack({ ...stack, language: val as LanguageType })}
                />
                <StackToggle
                  label="Animation"
                  options={["Framer Motion", "Reanimated", "GSAP", "Lottie", "CSS Keyframes", "None"]}
                  selected={stack.animation}
                  onChange={(val) => setStack({ ...stack, animation: val as AnimationType })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                disabled={isLoading}
                onClick={handleGenerate}
                className="w-full h-16 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-cyan-900/20 transition-all active:scale-[0.98] border border-white/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="mr-3 h-6 w-6" />
                )}
                {isLoading ? "Minting..." : "Mint AI Prompt"}
              </Button>

              <AnimatePresence>
                {result && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleGenerate}
                      className="w-full h-12 border-border dark:border-zinc-800 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800/50 hover:text-foreground dark:hover:text-white rounded-xl"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Output Panel */}
          <div ref={outputRef} className="space-y-6">
            <div className="lg:min-h-[600px] flex flex-col">
              {result || isLoading ? (
                <PromptOutput result={result} isLoading={isLoading} isPro={isPro} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/20 dark:bg-zinc-900/20 border border-dashed border-border dark:border-zinc-800 rounded-3xl min-h-[500px]">
                  <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Reduce friction with AI generation.</h3>
                  <p className="text-muted-foreground max-w-sm mb-8">
                    Type a brief idea. We use the CO-STAR framework to architect a comprehensive mega-prompt that significantly improves the structure of code generated on the first try.
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-lg text-left">
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                      <h4 className="font-bold text-sm text-emerald-500 mb-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Higher Success Rate
                      </h4>
                      <p className="text-xs text-muted-foreground">Minimize back-and-forth iteration loops by giving the AI comprehensive instructions upfront.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                      <h4 className="font-bold text-sm text-cyan-500 mb-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Strict Stack Alignment
                      </h4>
                      <p className="text-xs text-muted-foreground">Forces the AI to strictly respect your chosen frontend, backend, and styling stack.</p>
                    </div>
                  </div>
                </div>
              )}

              <PromptHistory
                onRestore={(entry) => {
                  setResult(entry.result);
                  setUserIdea(entry.idea);
                  if (entry.stack) setStack(entry.stack);

                  setTimeout(() => {
                    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                user={user}
                isPro={isPro}
                refreshTrigger={promptCount}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
        <p>© 2026 PromptMint. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </footer>

      <LoginModal

        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <LimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onLogin={() => {
          setIsLimitModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        isGuest={!user}
      />
      <Toaster />
    </main >
  );
}
