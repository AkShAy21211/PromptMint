"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stack,
  StylingType,
  LanguageType,
  AnimationType,
  FrameworkType,
  DatabaseType,
  ApiPatternType,
} from "@/lib/types";
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

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FREE = 5;

// Frameworks that are purely backend — when selected, animation and styling
// are hidden since they don't apply to a server-only context.
const BACKEND_ONLY_FRAMEWORKS: FrameworkType[] = [
  "Express",
  "NestJS",
  "FastAPI",
  "Django",
  "Spring Boot",
  "Laravel",
];
// ─── Free Tier Stack Limits ───────────────────────────────────────────────────

const FREE_STACKS = {
  framework: ["None", "React", "Next.js", "Express"] as FrameworkType[],
  database: ["None", "MongoDB", "PostgreSQL"] as DatabaseType[],
  apiPattern: ["None", "REST", "Server Actions"] as ApiPatternType[],
  language: ["TypeScript", "JavaScript"] as LanguageType[],
  styling: ["Tailwind CSS", "shadcn/ui"] as StylingType[],
  animation: ["Framer Motion", "None"] as AnimationType[],
};

const ALL_STACKS = {
  framework: [
    "None",
    "Next.js",
    "React",
    "Vue",
    "Express",
    "NestJS",
    "FastAPI",
    "Django",
    "Spring Boot",
    "Laravel",
  ] as FrameworkType[],
  database: [
    "None",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "SQLite",
    "Redis",
    "Supabase",
    "Prisma",
    "Drizzle",
  ] as DatabaseType[],
  apiPattern: [
    "None",
    "REST",
    "GraphQL",
    "tRPC",
    "WebSockets",
    "Server Actions",
  ] as ApiPatternType[],
  language: [
    "TypeScript",
    "JavaScript",
    "Swift",
    "Kotlin",
    "Java",
    "Python",
    "Go",
    "C# (Unity)",
  ] as LanguageType[],
  styling: [
    "Tailwind CSS",
    "shadcn/ui",
    "CSS Modules",
    "NativeWind",
    "SwiftUI",
    "Jetpack Compose",
    "Material UI",
    "Chakra UI",
    "Bootstrap",
  ] as StylingType[],
  animation: [
    "Framer Motion",
    "Reanimated",
    "GSAP",
    "Lottie",
    "CSS Keyframes",
    "None",
  ] as AnimationType[],
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditorPage() {
  const router = useRouter();
  const [userIdea, setUserIdea] = useState("");
  const [stack, setStack] = useState<Stack>({
    styling: "shadcn/ui",
    language: "TypeScript",
    animation: "Framer Motion",
    framework: "None",
    database: "None",
    apiPattern: "None",
  });
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // True when the selected framework is backend-only (hides frontend-specific rows)
  const isBackendOnly =
    !!stack.framework && BACKEND_ONLY_FRAMEWORKS.includes(stack.framework);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("usage_count, is_pro")
            .eq("id", user.id)
            .single();

          if (profile) {
            setPromptCount(profile.usage_count);
            setIsPro(profile.is_pro);
          }
        } else {
          const count = localStorage.getItem("guest_prompt_count");
          setPromptCount(count ? parseInt(count) : 0);
        }
      } catch (error) {
        console.error("[editor] Failed to initialize auth:", error);
        const count = localStorage.getItem("guest_prompt_count");
        setPromptCount(count ? parseInt(count) : 0);
      } finally {
        setIsInitialLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          let { data: profile } = await supabase
            .from("profiles")
            .select("usage_count, is_pro, plan_type")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile) {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .upsert({
                id: session.user.id,
                usage_count: 0,
                is_pro: false,
                plan_type: "free",
              })
              .select()
              .single();

            if (!createError) profile = newProfile;
          }

          if (profile) {
            setPromptCount(profile.usage_count);
            const unlimited =
              profile.is_pro ||
              profile.plan_type === "pro" ||
              profile.plan_type === "lifetime";
            setIsPro(unlimited);

            if (unlimited) {
              await migrateLocalPrompts(session.user.id);
            }
          }
        } else {
          setIsPro(false);
          const count = localStorage.getItem("guest_prompt_count");
          setPromptCount(count ? parseInt(count) : 0);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setIsPro(false);
        const count = localStorage.getItem("guest_prompt_count");
        setPromptCount(count ? parseInt(count) : 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.reset?.();
    }
    window.location.href = "/";
  };

  const handleStackChange = <K extends keyof typeof FREE_STACKS>(
    key: K,
    val: string,
  ) => {
    const freeOptions = FREE_STACKS[key] as string[];
    if (!isPro && !freeOptions.includes(val)) {
      toast({
        title: "Pro Feature",
        description: `Unlock all ${key} options with a Pro plan.`,
      });
      router.push("/pricing");
      return;
    }
    setStack((prev) => ({ ...prev, [key]: val }));
  };

  const handleGenerate = async () => {
    if (userIdea.trim().length < 4) {
      toast({
        title: "Input too short",
        description:
          "Please provide a bit more detail about your idea (at least 4 characters).",
        variant: "destructive",
      });
      return;
    }

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
          setPromptCount(MAX_FREE);
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

      const newCount = promptCount + 1;
      setPromptCount(newCount);

      const STORAGE_KEY = "promptmint_history";

      if (!isPro) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const history = saved ? JSON.parse(saved) : [];
        const newEntry = {
          idea: userIdea,
          result: generatedResult,
          stack,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([newEntry, ...history].slice(0, 10)),
        );

        if (!user) {
          localStorage.setItem("guest_prompt_count", newCount.toString());
        }
      }

      if (typeof window !== "undefined" && window.posthog) {
        window.posthog.capture("prompt_minted", {
          styling: stack.styling,
          language: stack.language,
          animation: stack.animation,
          framework: stack.framework,
          database: stack.database,
          apiPattern: stack.apiPattern,
          is_pro: isPro,
          prompt_length: userIdea.length,
        });
      }

      toast({
        title: "Success",
        description: isPro
          ? "Prompt minted! (unlimited)"
          : user
            ? `Prompt minted! (${newCount}/${MAX_FREE} used)`
            : `Prompt minted! (${newCount}/${MAX_FREE} total)`,
      });

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          outputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (error: unknown) {
      toast({
        title: "Generation Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
            <Link
              href="/"
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
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
            </Link>
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

            {/* Usage Status */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 rounded-full min-w-[140px] justify-center">
              {isInitialLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 dark:bg-zinc-700 animate-pulse" />
                  <div className="h-3 w-20 bg-muted dark:bg-zinc-800 rounded-md animate-pulse" />
                </div>
              ) : isPro ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    PRO UNLIMITED
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        promptCount >= MAX_FREE
                          ? "bg-rose-500"
                          : "bg-emerald-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        promptCount >= MAX_FREE
                          ? "text-rose-500"
                          : "text-emerald-500",
                      )}
                    >
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

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Input Panel */}
          <div className="lg:sticky lg:top-12 space-y-8">
            {/* Step 1: Idea */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Step 1: Define Your Idea
              </span>
              <div className="relative group">
                <Textarea
                  placeholder="Describe your development task (e.g., 'a secure authentication flow with JWTs', 'CRUD app with Express and PostgreSQL', or 'responsive landing page hero')..."
                  className="min-h-[200px] bg-card/40 dark:bg-zinc-900/40 border-border dark:border-zinc-800 hover:border-border/80 dark:hover:border-zinc-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/10 text-lg resize-none p-5 rounded-2xl transition-all placeholder:text-muted-foreground/40"
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground/40">
                  {userIdea.length} CHARS
                </div>
              </div>
            </div>

            {/* Step 2: Stack */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Step 2: Refine Your Stack
              </span>

              <div className="rounded-2xl bg-card/20 dark:bg-zinc-900/30 border border-border dark:border-zinc-800/50 divide-y divide-border dark:divide-zinc-800/50 overflow-hidden">
                {/* ── Framework / Runtime ── */}
                <div className="p-5">
                  <StackToggle
                    label="Framework"
                    options={ALL_STACKS.framework}
                    selected={stack.framework ?? "None"}
                    lockedOptions={
                      isPro
                        ? []
                        : ALL_STACKS.framework.filter(
                            (o) => !FREE_STACKS.framework.includes(o),
                          )
                    }
                    onChange={(val) => handleStackChange("framework", val)}
                  />
                </div>

                {/* ── Database / ORM ── */}
                <div className="p-5">
                  <StackToggle
                    label="Database / ORM"
                    options={ALL_STACKS.database}
                    selected={stack.database ?? "None"}
                    lockedOptions={
                      isPro
                        ? []
                        : ALL_STACKS.database.filter(
                            (o) => !FREE_STACKS.database.includes(o),
                          )
                    }
                    onChange={(val) => handleStackChange("database", val)}
                  />
                </div>

                {/* ── API Pattern ── */}
                <div className="p-5">
                  <StackToggle
                    label="API Pattern"
                    options={ALL_STACKS.apiPattern}
                    selected={stack.apiPattern ?? "None"}
                    lockedOptions={
                      isPro
                        ? []
                        : ALL_STACKS.apiPattern.filter(
                            (o) => !FREE_STACKS.apiPattern.includes(o),
                          )
                    }
                    onChange={(val) => handleStackChange("apiPattern", val)}
                  />
                </div>

                {/* ── Divider with label ── */}
                <div className="px-5 py-2 bg-zinc-900/40">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Frontend / UI
                  </span>
                </div>

                {/* ── Language ── */}
                <div className="p-5">
                  <StackToggle
                    label="Language"
                    options={ALL_STACKS.language}
                    selected={stack.language}
                    lockedOptions={
                      isPro
                        ? []
                        : ALL_STACKS.language.filter(
                            (o) => !FREE_STACKS.language.includes(o),
                          )
                    }
                    onChange={(val) => handleStackChange("language", val)}
                  />
                </div>

                {/* ── Styling — hidden for backend-only frameworks ── */}
                <AnimatePresence>
                  {!isBackendOnly && (
                    <motion.div
                      key="styling-row"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5">
                        <StackToggle
                          label="Styling"
                          options={ALL_STACKS.styling}
                          selected={stack.styling}
                          lockedOptions={
                            isPro
                              ? []
                              : ALL_STACKS.styling.filter(
                                  (o) => !FREE_STACKS.styling.includes(o),
                                )
                          }
                          onChange={(val) => handleStackChange("styling", val)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Animation — hidden for backend-only frameworks ── */}
                <AnimatePresence>
                  {!isBackendOnly && (
                    <motion.div
                      key="animation-row"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5">
                        <StackToggle
                          label="Animation"
                          options={ALL_STACKS.animation}
                          selected={stack.animation}
                          lockedOptions={
                            isPro
                              ? []
                              : ALL_STACKS.animation.filter(
                                  (o) => !FREE_STACKS.animation.includes(o),
                                )
                          }
                          onChange={(val) =>
                            handleStackChange("animation", val)
                          }
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hint when backend-only mode is active */}
              <AnimatePresence>
                {isBackendOnly && (
                  <motion.p
                    key="backend-hint"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-zinc-500 px-1"
                  >
                    Styling and animation options are hidden — they don&apos;t
                    apply to a server-only{" "}
                    <span className="text-zinc-400 font-medium">
                      {stack.framework}
                    </span>{" "}
                    project.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
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
                <PromptOutput
                  result={result}
                  isLoading={isLoading}
                  isPro={isPro}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/20 dark:bg-zinc-900/20 border border-dashed border-border dark:border-zinc-800 rounded-3xl min-h-[500px]">
                  <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Reduce friction with AI generation.
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-8">
                    Type a brief idea. We use the CO-STAR framework to architect
                    a comprehensive mega-prompt that significantly improves the
                    structure of code generated on the first try.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-lg text-left">
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                      <h4 className="font-bold text-sm text-emerald-500 mb-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Higher Success Rate
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Minimize back-and-forth iteration loops by giving the AI
                        comprehensive instructions upfront.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                      <h4 className="font-bold text-sm text-cyan-500 mb-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Strict Stack Alignment
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Forces the AI to strictly respect your chosen frontend,
                        backend, and styling stack.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <PromptHistory
                onRestore={(entry) => {
                  setResult(entry.result);
                  setUserIdea(entry.idea);
                  if (entry.stack)
                    setStack(
                      entry.stack as unknown as import("@/lib/types").Stack,
                    );

                  setTimeout(() => {
                    outputRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
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
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
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
    </main>
  );
}
