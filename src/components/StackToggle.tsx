"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StackToggleProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (option: string) => void;
  lockedOptions?: string[];
}

export function StackToggle({
  label,
  options,
  selected,
  onChange,
  lockedOptions = [],
}: StackToggleProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
        {label}
      </span>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          const isLocked = lockedOptions.includes(option);

          return (
            <motion.button
              key={option}
              whileTap={{ scale: isLocked ? 1 : 0.95 }}
              onClick={() => onChange(option)}
              title={isLocked ? `${option} — Pro plan required` : undefined}
              aria-pressed={isSelected}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 flex items-center gap-1.5",
                isLocked
                  ? "bg-transparent text-zinc-600 border-zinc-800/80 hover:border-violet-500/30 hover:text-zinc-500 cursor-pointer"
                  : isSelected
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-900/30"
                  : "bg-zinc-800/80 text-zinc-400 border-zinc-700/80 hover:border-zinc-600 hover:text-zinc-300",
              )}
            >
              {isLocked ? (
                <span className="text-zinc-700">
                  <Lock className="w-3 h-3" />
                </span>
              ) : null}

              <span className={cn(isLocked && "text-zinc-600")}>{option}</span>

              {isLocked && (
                <span className="text-[9px] font-bold text-violet-500/70 uppercase tracking-widest">
                  Pro
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}