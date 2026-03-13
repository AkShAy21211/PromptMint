"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { pricingTiers } from "@/lib/pricing-data";
import { PricingCard } from "@/components/pricing/PricingCard";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", user.id)
          .single();

        if (profile) setCurrentPlan(profile.plan_type);
      }
    };
    getData();
  }, [supabase]);

  const handleUpgrade = async (tier: {
    id: string;
    name: string;
    priceNumeric: number;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      router.push("/?login=true");
      return;
    }

    // ── Pre-Checkout Validation ───────────────────────────────────────────
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast({
        title: "Configuration Error",
        description: "Razorpay Key ID is missing. Please check your settings.",
        variant: "destructive",
      });
      setLoading(null);
      return;
    }

    setLoading(tier.id);

    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.capture("upgrade_started", {
        plan_id: tier.id,
        amount: tier.priceNumeric,
      });
    }

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: tier.id,
          amount: tier.priceNumeric,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const isSubscription = data.type === "subscription";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        // For Subscriptions, amount/currency MUST be omitted or the UI will crash
        ...(isSubscription ? {} : {
          amount: data.amount,
          currency: data.currency,
        }),
        name: "PromptMint Professional",
        description: `${tier.name} Plan ${isSubscription ? "Subscription" : "Upgrade"}`,
        image: "/icons/icon-192x192.png",
        // Dynamically set order_id or subscription_id
        [isSubscription ? "subscription_id" : "order_id"]: data.id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_subscription_id?: string;
          razorpay_signature: string;
        }) {
          try {
            toast({
              title: "Payment Captured",
              description: "Verifying your subscription... please wait.",
            });

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planId: tier.id,
              }),
            });

            if (verifyRes.ok) {
              if (typeof window !== "undefined" && window.posthog) {
                window.posthog.capture("upgrade_verified", {
                  plan_id: tier.id,
                });
              }
              toast({
                title: "Plan Upgraded!",
                description: `Welcome to the ${tier.name} tier!`,
              });
              router.push("/account?sync=true");
            } else {
              const errorData = await verifyRes.json();
              if (typeof window !== "undefined" && window.posthog) {
                window.posthog.capture("upgrade_failed", {
                  reason: "verification_failed",
                  plan_id: tier.id,
                });
              }
              throw new Error(errorData.error || "Verification failed");
            }
          } catch (err: unknown) {
            toast({
              title: "Verification Error",
              description:
                err instanceof Error ? err.message : "Verification failed",
              variant: "destructive",
            });
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#8b5cf6",
        },
        // Force UPI to be the first/preferred option for subscriptions
        config: {
          display: {
            preferences: {
              show_default_blocks: true,
            },
            sequence: ["block.upi"],
          },
        },
      };

      if (!window.Razorpay) throw new Error("Razorpay not loaded");
      const rzp = new window.Razorpay(options);
      rzp.on(
        "payment.failed",
        function (response: { error: { description: string } }) {
          if (typeof window !== "undefined" && "posthog" in window) {
            window.posthog?.capture("upgrade_failed", {
              reason: "payment_failed",
              plan_id: tier.id,
              error: response.error.description,
            });
          }
        },
      );
      rzp.open();
    } catch (err: unknown) {
      toast({
        title: "Payment Error",
        description: err instanceof Error ? err.message : "Payment failed",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-violet-500/30 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <nav className="flex items-center justify-between mb-20 relative z-10">
          {/* Left Side: Logo only */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Right Side: Button and Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
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

        <header className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              Industrial Grade · Production Ready
            </span>

            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-4 opacity-70">
              Pricing in INR · Secure Razorpay Gateway
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] text-foreground mb-8">
              Amplify Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Creative Velocity
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              Start with your **Magic 5** Pro trial—no credit card required. 
              Choose the tier that matches your engineering ambition when you&apos;re ready to scale.
            </p>
          </motion.div>
        </header>

        <div className="text-center mb-12">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Note: For GPay/PhonePe subscriptions, if QR fails, please use &quot;Pay by UPI ID&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-24">
          {pricingTiers.map(
            (tier: {
              id: string;
              name: string;
              price: string;
              description: string;
              features: string[];
              isPopular: boolean;
              priceNumeric: number;
            }) => (
              <PricingCard
                key={tier.id}
                tier={tier.name as "Free" | "Pro"}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                isPopular={tier.isPopular}
                currentPlan={currentPlan}
                isLoading={loading === tier.id}
                onUpgrade={() => handleUpgrade(tier)}
              />
            ),
          )}
        </div>

        <p className="text-sm text-muted-foreground max-w-3xl mx-auto text-center mb-8">
          Note: Free tier limits reset every 30 days. Guests receive 3 Pro prompts 
          initially, and signing up unlocks 2 additional Pro trial prompts (+5 total). 
          After the trial, you maintain a 5 prompts/month limit on standard features.
        </p>

        {/* ROI Justification Section */}
        <section className="mt-8 mb-24 max-w-4xl mx-auto rounded-3xl bg-zinc-900 overflow-hidden border border-zinc-800 relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 pointer-events-none" />
          <div className="p-12 md:p-16 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">
              PromptMint saves hours of{" "}
              <span className="text-violet-400">debugging time.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              A developer&apos;s time is valuable. If PromptMint saves you from
              just ONE frustrating, 20-minute debugging loop with AI every
              month, your subscription has already generated a positive ROI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>{" "}
                  Without Us
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Type &quot;build a navbar&quot;, get generic CSS, ask to fix
                  it to Tailwind, fix missing imports, handle complex responsiveness
                  design.{" "}
                  <strong className="text-zinc-300 block mt-2">
                    (Time: ~25 mins)
                  </strong>
                </p>
              </div>
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>{" "}
                  With PromptMint
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Type idea, **Smart Inference** detects your stack, and you
                  get a structured technical blueprint ready for any AI.{" "}
                  <strong className="text-zinc-300 block mt-2">
                    (Time: ~2 mins)
                  </strong>
                </p>
              </div>
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div> The
                  Result
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Accelerate feature development. Provide better initial context
                  to stay in the creative flow state. Build more, wrestle with
                  AI less.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Features / Trust Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-y border-border dark:border-white/5">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="font-bold text-foreground">Secure Payments</h4>
            <p className="text-sm text-muted-foreground">
              PCI-DSS compliant transactions powered by Razorpay.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <h4 className="font-bold text-foreground">Instant Unlock</h4>
            <p className="text-sm text-muted-foreground">
              Pro features activated immediately after verification.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
              <Globe className="w-6 h-6 text-violet-500" />
            </div>
            <h4 className="font-bold text-foreground">Global History (Pro)</h4>
            <p className="text-sm text-muted-foreground">
              Cloud-synced prompt history available to Pro subscribers; falls
              back to local storage when offline.
            </p>
          </div>
        </section>

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
