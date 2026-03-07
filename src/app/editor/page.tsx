"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stack,
  GoalMode,
  TargetModel,
  FrameworkType,
  DatabaseType,
  ApiPatternType,
  LanguageType,
  StylingType,
  AnimationType,
  DeploymentType,
  AuthType,
  StateManagementType,
} from "@/lib/types";
import { StackToggle } from "@/components/StackToggle";
import { PromptHealth } from "@/components/PromptHealth";
import { PromptOutput } from "@/components/PromptOutput";
import { PromptRecipes } from "@/components/PromptRecipes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, LogOut, User as UserIcon, Save, BookOpen, Layout, Server, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginModal } from "@/components/auth/LoginModal";
import { PromptHistory } from "@/components/PromptHistory";
import { LimitModal } from "@/components/LimitModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { migrateLocalPrompts } from "@/lib/supabase/migration";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FREE_STACKS,
  ALL_STACKS,
} from "@/lib/constants";
import { detectConflicts } from "@/lib/detectConflicts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FREE = 5;

const GOAL_MODES: GoalMode[] = [
  "Scaffold",                    // Basic structure/boilerplate
  "Production-ready",            // Fully tested, scalable
  "Refactor existing code",      // Optimize legacy code
  "Debug broken code",           // Fix bugs + edge cases
  "Performance optimization",    // Speed/memory improvements
  "Accessibility (a11y)",        // WCAG compliant
  "SEO optimized",               // Meta tags, SSR, structured data
  "Micro-optimizations",         // Small perf tweaks
  "Add authentication",          // Auth0/Supabase integration
];

const TARGET_MODELS: TargetModel[] = [
  "Claude",           // Anthropic Claude family
  "GPT",              // OpenAI GPT-4o, o1-mini
  "Perplexity",       // Perplexity AI
  "Grok",             // xAI Grok
  "Gemini",           // Google Gemini 2.0
  "Llama",            // Meta Llama 3.1/4
  "DeepSeek",         // DeepSeek Coder V2
  "CodeLlama",        // Code-specific Llama
  "Cursor",           // Cursor AI IDE
  "Copilot",          // GitHub Copilot
];

const ENGINEERING_DEFAULTS = [
  // Architecture
  "Feature-based routing/folders",
  "App Router (Next.js 14+)",
  "Zod schema validation everywhere",

  // TypeScript
  "Strict TypeScript (No anys)",
  "Explicit return types",
  "Infer types where possible",

  // Components & UI
  "React Server Components (RSC) first",
  "Shadcn/ui + Tailwind CSS",
  "Framer Motion animations",
  "Mobile-first responsive design",

  // Testing
  "Vitest + React Testing Library",
  "100% test coverage for logic",
  "Error boundary tests",

  // Performance
  "Suspense + streaming",
  "useTransition for UX",
  "Image optimization (next/image)",

  // Security
  "Row Level Security (Supabase)",
  "Input sanitization",
  "CSP headers",

  // DX
  "ESLint + Prettier",
  "Husky pre-commit hooks",
  "TypeDoc comments",

  // Deployment
  "Vercel Edge runtime",
  "Environment variable validation",
];

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
    deployment: "None",
    auth: "None",
    stateManagement: "None",
  });
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [goalMode, setGoalMode] = useState<GoalMode>("Production-ready");
  const [targetModel, setTargetModel] = useState<TargetModel>("GPT");
  const [engineeringDefaults, setEngineeringDefaults] = useState<string[]>([]);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [activeStackTab, setActiveStackTab] = useState<"architecture" | "infrastructure" | "visuals">("architecture");
  const [recipeRefreshTrigger, setRecipeRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading: authLoading, supabase } = useAuth();


  // ─── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user && profile) {
      setPromptCount(profile.usage_count);
      setIsPro(profile.is_pro);
      if (profile.is_pro) {
        migrateLocalPrompts(user.id);
      }
    } else if (!authLoading) {
      const count = localStorage.getItem("guest_prompt_count");
      setPromptCount(count ? parseInt(count) : 0);
      setIsPro(false);
    }
  }, [user, profile, authLoading]);

  // Handle local state sync on generation
  useEffect(() => {
    if (profile) {
      setPromptCount(profile.usage_count);
    }
  }, [profile]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.reset?.();
    }
    window.location.href = "/";
  };

  const handleStackChange = <K extends keyof typeof ALL_STACKS>(
    key: K,
    val: string,
  ) => {
    const freeOptions = FREE_STACKS[key as keyof typeof FREE_STACKS] as string[] | undefined;

    // Check if the option is locked for free users (if key exists in FREE_STACKS)
    if (!isPro && freeOptions && !freeOptions.includes(val)) {
      toast({
        title: "Pro Feature",
        description:
          `Unlock all ${key} options and unlimited prompts with a Pro plan (₹149 / month).`,
      });
      router.push("/pricing");
      return;
    }
    setStack((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveRecipe = async () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Saving prompt recipes is available on Pro plans.",
      });
      router.push("/pricing");
      return;
    }

    const name = window.prompt("Enter a name for this recipe:");
    if (!name) return;

    setIsSavingRecipe(true);
    try {
      const newRecipe = {
        name,
        idea_hint: userIdea,
        stack,
        goal_mode: goalMode,
        target_model: targetModel,
        engineering_defaults: engineeringDefaults,
      };

      if (user) {
        const { error } = await supabase.from("prompt_recipes").insert({
          ...newRecipe,
          user_id: user.id
        });
        if (error) throw error;
      } else {
        const saved = localStorage.getItem("promptmint_recipes");
        const recipes = saved ? JSON.parse(saved) : [];
        localStorage.setItem(
          "promptmint_recipes",
          JSON.stringify([{ ...newRecipe, id: Date.now().toString() }, ...recipes])
        );
      }

      toast({
        title: "Recipe Saved",
        description: `'${name}' has been added to your recipes.`,
      });

      setRecipeRefreshTrigger(prev => prev + 1);

    } catch (error) {
      toast({
        title: "Failed to save recipe",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSavingRecipe(false);
    }
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
        body: JSON.stringify({ userIdea, stack, goalMode, targetModel, engineeringDefaults }),
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

      if (generatedResult.startsWith("ERROR:")) {
        toast({
          title: "Invalid Idea",
          description: generatedResult.replace("ERROR: ", ""),
          variant: "destructive",
        });
        return;
      }

      setResult(generatedResult);

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
            ? `Prompt minted!(${newCount} / ${MAX_FREE} used)`
            : `Prompt minted!(${newCount} / ${MAX_FREE} total)`,
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
            <Logo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />


            <Link href="/guide">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Prompting Guide
              </Button>
            </Link>
            {/* Usage Status */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 rounded-full min-w-[140px] justify-center text-zinc-500">
              {authLoading && !profile ? (
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

                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 hover:bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full">
                      <Sparkles className="w-4 h-4" />
                      Upgrade
                    </Button>
                  </Link>
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
                      {Math.max(0, MAX_FREE - promptCount)}/{MAX_FREE} PROMPTS LEFT
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

            {authLoading && !user ? (
              <div className="flex gap-2">
                <div className="w-11 h-11 bg-muted/50 rounded-xl animate-pulse" />
                <div className="w-11 h-11 bg-muted/50 rounded-xl animate-pulse" />
              </div>
            ) : !user ? (
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
              <PromptHealth userIdea={userIdea} stack={stack} />
            </div>

            {/* Step 2: Stack */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  Step 2: Refine Your Stack
                </span>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                  {[
                    { id: "architecture", label: "Arch", icon: Server },
                    { id: "infrastructure", label: "Infra", icon: Layout },
                    { id: "visuals", label: "Visual", icon: Palette },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStackTab(tab.id as "architecture" | "infrastructure" | "visuals")}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeStackTab === tab.id
                          ? "text-white"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      {activeStackTab === tab.id && (
                        <motion.div
                          layoutId="activeStackTab"
                          className="absolute inset-0 bg-violet-600 rounded-lg shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <tab.icon className="w-3 h-3 relative z-10" />
                      <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStackTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="divide-y divide-border dark:divide-zinc-800/50"
                  >
                    {activeStackTab === "architecture" && (
                      <>
                        {/* ── Framework / Runtime ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Framework"
                            options={ALL_STACKS.framework}
                            selected={stack.framework ?? "None"}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.framework
                                  .filter((o) => !FREE_STACKS.framework.includes(o.name as FrameworkType))
                                  .map((o) => o.name)
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
                                : ALL_STACKS.database
                                  .filter((o) => !FREE_STACKS.database.includes(o.name as DatabaseType))
                                  .map((o) => o.name)
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
                                : ALL_STACKS.apiPattern
                                  .filter((o) => !FREE_STACKS.apiPattern.includes(o.name as ApiPatternType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("apiPattern", val)}
                          />
                        </div>
                      </>
                    )}

                    {activeStackTab === "infrastructure" && (
                      <>
                        {/* ── Deployment ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Deployment"
                            options={ALL_STACKS.deployment}
                            selected={stack.deployment ?? "None"}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.deployment
                                  .filter((o) => !FREE_STACKS.deployment.includes(o.name as DeploymentType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("deployment", val)}
                          />
                        </div>

                        {/* ── Authentication ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Authentication"
                            options={ALL_STACKS.auth}
                            selected={stack.auth ?? "None"}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.auth
                                  .filter((o) => !FREE_STACKS.auth.includes(o.name as AuthType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("auth", val)}
                          />
                        </div>

                        {/* ── State Management ── */}
                        <div className="p-5">
                          <StackToggle
                            label="State Management"
                            options={ALL_STACKS.stateManagement}
                            selected={stack.stateManagement ?? "None"}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.stateManagement
                                  .filter((o) => !FREE_STACKS.stateManagement.includes(o.name as StateManagementType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("stateManagement", val)}
                          />
                        </div>
                      </>
                    )}

                    {activeStackTab === "visuals" && (
                      <>
                        {/* ── Language ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Language"
                            options={ALL_STACKS.language}
                            selected={stack.language}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.language
                                  .filter((o) => !FREE_STACKS.language.includes(o.name as LanguageType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("language", val)}
                          />
                        </div>

                        {/* ── Styling ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Styling"
                            options={ALL_STACKS.styling}
                            selected={stack.styling}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.styling
                                  .filter((o) => !FREE_STACKS.styling.includes(o.name as StylingType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("styling", val)}
                          />
                        </div>

                        {/* ── Animation ── */}
                        <div className="p-5">
                          <StackToggle
                            label="Animation"
                            options={ALL_STACKS.animation}
                            selected={stack.animation}
                            lockedOptions={
                              isPro
                                ? []
                                : ALL_STACKS.animation
                                  .filter((o) => !FREE_STACKS.animation.includes(o.name as AnimationType))
                                  .map((o) => o.name)
                            }
                            onChange={(val) => handleStackChange("animation", val)}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Step 3: Goal & Target Model */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Step 3: Goal & Target AI
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-card/20 dark:bg-zinc-900/30 border border-border dark:border-zinc-800/50 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                    Goal Mode
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_MODES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setGoalMode(mode)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors",
                          goalMode === mode
                            ? "bg-cyan-600/10 border-cyan-500/60 text-cyan-400"
                            : "bg-background border-border text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-300",
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card/20 dark:bg-zinc-900/30 border border-border dark:border-zinc-800/50 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                    Target Model
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_MODELS.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setTargetModel(model)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors",
                          targetModel === model
                            ? "bg-violet-600/10 border-violet-500/60 text-violet-400"
                            : "bg-background border-border text-muted-foreground hover:border-violet-500/40 hover:text-violet-300",
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card/20 dark:bg-zinc-900/30 border border-border dark:border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
                    Engineering Defaults
                  </p>
                  {!isPro && (
                    <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest bg-violet-400/10 px-1.5 py-0.5 rounded">Pro Only</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ENGINEERING_DEFAULTS.map((def) => {
                    const isSelected = engineeringDefaults.includes(def);
                    return (
                      <button
                        key={def}
                        type="button"
                        onClick={() => {
                          if (!isPro) {
                            toast({
                              title: "Pro Feature",
                              description: "Opinionated Engineering Defaults are available on Pro plans.",
                            });
                            router.push("/pricing");
                            return;
                          }
                          setEngineeringDefaults(prev =>
                            prev.includes(def) ? prev.filter(d => d !== def) : [...prev, def]
                          );
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors flex items-center gap-1.5",
                          isSelected
                            ? "bg-emerald-600/10 border-emerald-500/60 text-emerald-500"
                            : "bg-background border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400",
                          !isPro && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-emerald-500" : "bg-muted-foreground/30"
                        )} />
                        {def}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                disabled={isLoading}
                onClick={handleGenerate}
                className={cn(
                  "w-full h-16 text-white font-bold text-xl rounded-2xl shadow-2xl transition-all active:scale-[0.98] border border-white/10 disabled:opacity-50",
                  detectConflicts(userIdea, stack).length > 0
                    ? "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-amber-900/20"
                    : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-cyan-900/20"
                )}
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

              <Button
                variant="ghost"
                onClick={handleSaveRecipe}
                disabled={isSavingRecipe}
                className="w-full h-12 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20 border-dashed rounded-xl transition-all"
              >
                {isSavingRecipe ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSavingRecipe ? "Saving..." : "Save as Recipe"}
              </Button>
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

              <PromptRecipes
                user={user}
                isPro={isPro}
                refreshTrigger={recipeRefreshTrigger}
                onLoadRecipe={(recipe) => {
                  if (recipe.idea_hint) setUserIdea(recipe.idea_hint);
                  if (recipe.stack) setStack(recipe.stack);
                  if (recipe.goal_mode) setGoalMode(recipe.goal_mode as GoalMode);
                  if (recipe.target_model) setTargetModel(recipe.target_model as TargetModel);
                  if (recipe.engineering_defaults) setEngineeringDefaults(recipe.engineering_defaults);
                  toast({
                    title: "Recipe Loaded",
                    description: `Loaded configuration: ${recipe.name} `,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-4 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
        <p>© 2026 PromptMint. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="mailto:nimbact@gmail.com" className="hover:text-foreground transition-colors">Support</a>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
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
