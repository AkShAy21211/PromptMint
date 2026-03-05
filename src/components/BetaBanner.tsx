"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBetaBannerConfig } from "@/lib/banner-config";

interface BetaBannerProps {
  enabled?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function BetaBanner({
  enabled: propEnabled,
  dismissible: propDismissible,
  onDismiss,
}: BetaBannerProps) {
  const config = getBetaBannerConfig();
  const enabled = propEnabled ?? config.enabled;
  const dismissible = propDismissible ?? config.dismissible;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(config.storageDismissKey);
    setIsVisible(enabled && !dismissed);
  }, [enabled, config.storageDismissKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(config.storageDismissKey, "true");
    onDismiss?.();
  };

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50 w-full"
        >
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left Content */}
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      PromptMint BETA – Until March 12th
                    </p>
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      Beta
                    </span>
                  </div>
                  <p className="text-xs leading-tight 0 font-medium">
                    Testing & feedback wanted! Screenshot bugs →{" "}
                    <span className="font-black text-emerald-700">
                      First 10 get 3 MONTHS PRO FREE
                    </span> When we launch.
                    . Report via{" "}
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSe41jE1fXDEYEuppQrnN73IBs0TEsB-F9LlIk_bX9b6sk8DMA/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:text-cyan-400 font-semibold underline"
                    >
                      bug report form
                    </a>
                    .
                  </p>

                  <div className="mt-2 px-3 py-2 bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground leading-snug">
                      ⚠️ <span className="font-semibold">Important:</span> All
                      data from beta testing will be reset at official launch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <Button
                  asChild
                  size="sm"
                  className="flex-1 sm:flex-none h-9 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-2xl"
                >
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSe41jE1fXDEYEuppQrnN73IBs0TEsB-F9LlIk_bX9b6sk8DMA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    REPORT BUGS
                  </a>
                </Button>
                {dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Dismiss banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
