"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CreditCard,
  ArrowLeft,
  LogOut,
  Sparkles,
  Shield,
  BookOpen,
  MessageCircle,
  BarChart3,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

interface UserProfile {
  usage_count: number;
  plan_type: string;
  is_pro: boolean;
  [key: string]: unknown;
}

export default function AccountPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipeCount, setRecipeCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        router.push("/");
        return;
      }

      setUser(session.user);

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!profileError) {
          setProfile(profileData as UserProfile);
        }

        // Fetch Library Stats
        const [recipesRes, historyRes] = await Promise.all([
          supabase.from("prompt_recipes").select("id", { count: "exact" }).eq("user_id", session.user.id),
          supabase.from("prompts").select("id", { count: "exact" }).eq("user_id", session.user.id),
        ]);

        setRecipeCount(recipesRes.count ?? 0);
        setHistoryCount(historyRes.count ?? 0);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }

      if (searchParams?.get("sync")) {
        toast({
          title: "Dashboard Synchronized",
          description: "Your plan status and usage have been updated.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, searchParams, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const MAX_FREE = 5;
  const usagePercentage = Math.min(
    ((profile?.usage_count ?? 0) / MAX_FREE) * 100,
    100,
  );
  const isPro =
    profile?.plan_type === "pro";

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <nav className="flex items-center justify-between mb-12 relative z-10">
          <Logo />
          <div className="flex items-center gap-4">

            <ThemeToggle />
            <Link href="/">
              <Button
                variant="ghost"
                className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Editor
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut();
                window.posthog?.reset?.();
                window.location.href = "/";
              }}
              className="w-11 h-11 rounded-xl bg-muted/50 dark:bg-zinc-900/50 border border-border dark:border-zinc-800 text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </Button>

          </div>
        </nav>

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Your Account</h1>
            <p className="text-zinc-500 font-medium">{user?.email}</p>
          </div>
          <div
            className={cn(
              "px-6 py-3 rounded-2xl border flex items-center gap-3",
              isPro
                ? "bg-violet-500/10 border-violet-500/20 text-violet-500/80 dark:text-violet-400"
                : "bg-muted/50 dark:bg-zinc-900/50 border-border dark:border-zinc-800 text-muted-foreground",
            )}
          >
            <Sparkles className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-widest text-xs">
                {(profile?.plan_type ?? "FREE").toUpperCase()} MEMBERSHIP
              </span>
              <span className="text-[10px] text-muted-foreground/70 font-medium">
                Beta · Early-supporter pricing in INR via Razorpay
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Usage Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 p-8 rounded-[2.5rem] space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 text-cyan-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Usage Metrics</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                  Prompts This Month
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-foreground">
                    {profile?.usage_count ?? 0}
                  </span>
                  {!isPro && (
                    <span className="text-muted-foreground/60 text-sm font-bold">
                      /{MAX_FREE}
                    </span>
                  )}
                </div>
              </div>

              {!isPro ? (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        usagePercentage > 80 ? "bg-rose-500" : "bg-cyan-500",
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest text-right">
                    {usagePercentage.toFixed(0)}% Utilized
                  </p>
                </div>
              ) : (
                <div className="py-4 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">
                    ✦ Unlimited Usage This Month
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50 dark:border-white/5 flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {isPro
                  ? "Pro Plan: Unlimited prompts/month"
                  : "Free Plan: 5 prompts/month"}
              </span>
            </div>
          </motion.div>

          {/* Billing Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 text-violet-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Membership Plan</h3>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">
                  Active Plan
                </p>
                <p className="text-2xl font-black text-foreground capitalize">
                  {profile?.plan_type ?? "Free"}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {isPro
                    ? "Thank you for supporting PromptMint. You have full access to all professional features."
                    : "You are currently on the baseline tier. Upgrade to unlock the full potential of PromptMint."}
                </p>
              </div>
            </div>

            {!isPro && (
              <Button
                onClick={() => router.push("/pricing")}
                className="w-full h-14 mt-8 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-2xl transition-all"
              >
                View Plans
              </Button>
            )}
          </motion.div>
        </div>

        {/* Library Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-500 group-hover:scale-110 transition-transform">
                <Save className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Saved Recipes</p>
                <h3 className="text-2xl font-black">{recipeCount}</h3>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                Manage
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 text-cyan-500 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">History Items</p>
                <h3 className="text-2xl font-black">{historyCount}</h3>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                Browse
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Beta Supporter Section */}
        <section className="bg-gradient-to-br from-violet-600/10 via-background to-cyan-600/10 border border-violet-500/20 rounded-[2.5rem] p-10 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 p-4">
            <Shield className="w-20 h-20 text-violet-500/10 -rotate-12" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Early Adopter Advantage
            </div>
            <h2 className="text-2xl md:text-3xl font-black max-w-md leading-tight">
              You&apos;re helping us build the future of prompting.
            </h2>
            <p className="text-muted-foreground max-w-lg leading-relaxed">
              As a beta user, you have early access to our experimental model flavors. Learn how to maximize your <span className="text-foreground font-bold">{profile?.plan_type === 'pro' ? 'Pro' : 'Free'}</span> account with our industrial-grade guide.
            </p>
            <Link href="/guide">
              <Button className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 h-12">
                <BookOpen className="w-4 h-4 mr-2" />
                Read the Playbook
              </Button>
            </Link>
          </div>
        </section>

        {/* Help & Support Section */}
        <section className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 mb-12 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black">Need Help?</h3>
              <p className="text-muted-foreground font-medium">Have a question or found a bug? We&apos;re here to help.</p>
            </div>
          </div>
          <Button
            asChild
            className="rounded-2xl bg-foreground text-background hover:opacity-90 font-bold px-8 h-12 shrink-0"
          >
            <a href="mailto:nimbact@gmail.com">
              Contact {isPro ? 'Priority' : 'Standard'} Support
            </a>
          </Button>
        </section>

        {/* Support Section */}
        <footer className="mt-4 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground max-w-7xl mx-auto px-6">
          <p>© 2026 PromptMint. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="mailto:nimbact@gmail.com" className="hover:text-foreground transition-colors">Support</a>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
