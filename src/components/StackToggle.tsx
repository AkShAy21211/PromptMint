"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { StackOption } from "@/lib/constants";

interface StackToggleProps {
  label: string;
  options: StackOption[];
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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(options.map((o) => o.category));
    return ["All", ...Array.from(cats)].sort();
  }, [options]);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      const matchesSearch = option.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || option.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [options, search, activeCategory]);

  const showControls = options.length > 8;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
          {label}
        </span>
        {showControls && (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg py-1 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 w-32 sm:w-40 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <Filter className="w-3 h-3 text-muted-foreground/30 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                activeCategory === cat
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                  : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-400"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredOptions.map((option) => {
            const isSelected = selected === option.name;
            const isLocked = lockedOptions.includes(option.name);

            return (
              <motion.button
                key={option.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: isLocked ? 1 : 0.95 }}
                onClick={() => onChange(option.name)}
                title={isLocked ? `${option.name} — Pro plan required` : undefined}
                aria-pressed={isSelected}
                className={cn(
                  "relative px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5",
                  isLocked
                    ? "bg-transparent text-zinc-600 border-zinc-900 hover:border-violet-500/20 hover:bg-violet-500/5 cursor-pointer"
                    : isSelected
                      ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-900/30 ring-2 ring-violet-500/20"
                      : "bg-zinc-900/40 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/60",
                  option.isPopular && !isSelected && !isLocked && "border-zinc-700/50"
                )}
              >
                {isLocked ? (
                  <Lock className="w-2.5 h-2.5 text-zinc-700" />
                ) : option.isPopular && !isSelected ? (
                  <div className="w-1 h-1 rounded-full bg-violet-400/50" />
                ) : null}

                <span>{option.name}</span>

                {isLocked && (
                  <span className="text-[8px] font-black text-violet-500/60 uppercase tracking-tighter">
                    Pro
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {filteredOptions.length === 0 && (
          <div className="w-full py-4 text-center">
            <p className="text-xs text-zinc-600 italic">No options found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
