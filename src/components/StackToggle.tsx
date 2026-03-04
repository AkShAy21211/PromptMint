"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StackToggleProps {
    label: string;
    options: string[];
    selected: string;
    onChange: (option: any) => void;
}

/**
 * A labeled group of pill-style toggle buttons for stack selection.
 * Features Framer Motion animations and a premium violet/zinc aesthetic.
 */
export function StackToggle({ label, options, selected, onChange }: StackToggleProps) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                {label}
            </span>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isSelected = selected === option;
                    return (
                        <motion.button
                            key={option}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onChange(option)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                isSelected
                                    ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/20"
                                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750 hover:text-zinc-300"
                            )}
                        >
                            {option}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
