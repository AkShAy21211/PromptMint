"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, X, ExternalLink } from "lucide-react";

const BUG_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe41jE1fXDEYEuppQrnN73IBs0TEsB-F9LlIk_bX9b6sk8DMA/viewform";

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Delay mount so it doesn't compete with page load animations
  useEffect(() => {
    const t = setTimeout(() => setHasMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Close popover on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!hasMounted) return null;

  return (
    <>
      {/* Backdrop — closes popover on outside click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Popover card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="popover"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="w-72 rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
            >
              {/* Header stripe */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />

              <div className="p-4">
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Bug className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">
                        Found a bug?
                      </p>
                      <p className="text-[10px] text-amber-400/80 font-medium mt-0.5 uppercase tracking-widest">
                        Beta · Until Mar 12
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reward callout */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-3 py-2.5 mb-3">
                  <p className="text-xs text-white/80 leading-snug">
                    🏆{" "}
                    <span className="font-black text-emerald-400">
                      First 10 reporters
                    </span>{" "}
                    get{" "}
                    <span className="font-bold text-white">
                      3 months Pro free
                    </span>{" "}
                    at launch.
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  Screenshot the bug, describe what happened, and submit the
                  form. Takes 60 seconds.
                </p>

                {/* CTA button */}
                <a
                  href={BUG_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all duration-200 shadow-lg shadow-amber-900/20"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    OPEN BUG REPORT FORM
                  </span>
                  <div className="flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Report a bug"
          className={`
            group relative flex items-center gap-2 h-10 rounded-full border
            transition-all duration-300 shadow-lg
            ${
              isOpen
                ? "px-4 bg-white/10 border-white/20 text-white"
                : "px-4 bg-[#0f0f0f]/90 border-white/10 text-white/60 hover:text-white hover:border-amber-500/40 hover:bg-[#0f0f0f]"
            }
          `}
        >
          {/* Subtle pulse ring — only when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-[0.08] bg-amber-400 pointer-events-none" />
          )}

          <Bug
            className={`w-3.5 h-3.5 transition-colors duration-200 ${
              isOpen ? "text-amber-400" : "text-white/50 group-hover:text-amber-400"
            }`}
          />
          <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap">
            {isOpen ? "Close" : "Report Bug"}
          </span>

          {/* Live beta dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </motion.button>
      </div>
    </>
  );
}