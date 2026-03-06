"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    tier: "Free" | "Pro";
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    onUpgrade: () => void;
    isLoading?: boolean;
    currentPlan?: string;
}

export function PricingCard({
    tier,
    price,
    description,
    features,
    isPopular,
    onUpgrade,
    isLoading,
    currentPlan,
}: PricingCardProps) {
    const isCurrent = currentPlan?.toLowerCase() === tier.toLowerCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "relative group h-full flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500",
                isPopular
                    ? "bg-card/80 dark:bg-zinc-900/80 border-violet-500/30 shadow-2xl shadow-violet-500/10"
                    : "bg-card/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
            )}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                    Best Value
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10",
                        tier === "Free" && "bg-emerald-500/10 text-emerald-500",
                        tier === "Pro" && "bg-violet-500/10 text-violet-500"
                    )}>
                        {tier === "Free" && <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />}
                        {tier === "Pro" && <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{tier}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-foreground">{price}</span>
                    {tier !== "Free" && (
                        <span className="text-zinc-500 text-sm font-medium">/month</span>
                    )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                ))}
            </div>

            <Button
                onClick={onUpgrade}
                disabled={isLoading || isCurrent || tier === "Free"}
                className={cn(
                    "w-full h-14 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]",
                    isCurrent
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default"
                        : isPopular
                            ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-xl shadow-violet-900/20"
                            : "bg-white text-black hover:bg-zinc-200"
                )}
            >
                {isCurrent ? "Current Plan" : tier === "Free" ? "Active" : `Upgrade to ${tier}`}
            </Button>

            {/* Decorative Glows */}
            <div className={cn(
                "absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none -z-10",
                tier === "Free" && "bg-emerald-500 blur-2xl",
                tier === "Pro" && "bg-violet-500 blur-2xl"
            )} />
        </motion.div>
    );
}
