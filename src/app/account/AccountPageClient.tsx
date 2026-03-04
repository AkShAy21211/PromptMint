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
  Trophy,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/ThemeToggle";

interface UserProfile {
  usage_count: number;
  plan_type: string;
  is_pro: boolean;
  [key: string]: unknown;
}

export default function AccountPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData as UserProfile);
      setLoading(false);

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
    profile?.plan_type === "pro" || profile?.plan_type === "lifetime";

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Editor
            </Button>
            <ThemeToggle />
          </div>

          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              window.posthog?.reset?.();
              window.location.href = "/";
            }}
            className="text-muted-foreground hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl"
          >
            Sign Out
            <LogOut className="w-4 h-4 ml-2" />
          </Button>
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
            {profile?.plan_type === "lifetime" ? (
              <Trophy className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="font-bold uppercase tracking-widest text-xs">
              {(profile?.plan_type ?? "FREE").toUpperCase()} MEMBERSHIP
            </span>
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
                  {isPro ? "Total Mintings" : "Lifetime Prompts"}
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
                    Unlimited Forever Activated
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50 dark:border-white/5 flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {isPro
                  ? "Unlimited Lifetime Access"
                  : "Free Plan: 5 Total Prompts"}
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

        {/* Support Section */}
        <section className="bg-muted/30 dark:bg-zinc-900/20 border border-border dark:border-white/5 rounded-3xl p-8 text-center space-y-4">
          <p className="text-muted-foreground text-sm font-medium">
            Need help with your subscription or have questions?
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <a
              href="#"
              className="text-violet-500 text-sm font-bold hover:underline"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
