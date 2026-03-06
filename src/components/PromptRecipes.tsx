"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ChevronDown, ChevronUp, Trash2, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PromptRecipe } from "@/lib/types";

interface PromptRecipesProps {
    onLoadRecipe: (recipe: PromptRecipe) => void;
    user?: User | null;
    isPro?: boolean;
}

const STORAGE_KEY = "promptmint_recipes";

export function PromptRecipes({ onLoadRecipe, user, isPro }: PromptRecipesProps) {
    const [recipes, setRecipes] = useState<PromptRecipe[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const supabase = createClient();

    // Load recipes
    const fetchRecipes = async () => {
        setLoading(true);
        setIsOffline(false);
        try {
            if (user && isPro) {
                const { data, error } = await supabase
                    .from("prompt_recipes")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (data) {
                    setRecipes(
                        data.map((r) => ({
                            id: r.id,
                            name: r.name,
                            idea_hint: r.idea_hint,
                            stack: r.stack,
                            goal_mode: r.goal_mode,
                            target_model: r.target_model,
                            engineering_defaults: r.engineering_defaults || [],
                        }))
                    );
                }
            } else {
                throw new Error("Local Only");
            }
        } catch (e) {
            if (user && isPro && e instanceof Error && e.message !== "Local Only") {
                setIsOffline(true);
            }
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setRecipes(JSON.parse(saved));
                } catch (parseErr) {
                    console.error("Failed to parse recipes", parseErr);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isPro, supabase]);

    const deleteRecipe = async (index: number) => {
        const recipe = recipes[index];

        if (user && isPro && !isOffline && recipe.id) {
            try {
                await supabase.from("prompt_recipes").delete().eq("id", recipe.id);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }

        const updated = recipes.filter((_, i) => i !== index);
        setRecipes(updated);

        if (!user || isOffline || !isPro) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex !== null && expandedIndex > index) {
            setExpandedIndex(expandedIndex - 1);
        }
    };

    return (
        <div className="w-full space-y-4 pt-8 border-t border-border/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <BookMarked className="w-4 h-4" />
                        Saved Recipes
                    </h3>
                    {loading && <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {recipes.length === 0 ? (
                    <div className="py-6 px-4 border border-dashed border-border/50 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">No recipes saved yet.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                            Save your current configurations to quickly reuse them later.
                        </p>
                    </div>
                ) : (
                    recipes.map((recipe, index) => {
                        const isExpanded = expandedIndex === index;

                        return (
                            <div
                                key={recipe.id || index}
                                className="relative group overflow-hidden rounded-xl bg-card/30 dark:bg-zinc-900/30 border border-border transition-all hover:border-border/80"
                            >
                                <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm text-foreground/90 font-bold truncate">
                                            {recipe.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                            {recipe.stack.framework !== "None" ? recipe.stack.framework : "Vanilla"} · {recipe.stack.language}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 border-t border-border/50 space-y-3 pt-3">
                                                <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                                                    <span className="font-semibold text-foreground/70">Idea Hint: </span>
                                                    {recipe.idea_hint || "None"}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onLoadRecipe(recipe)}
                                                        className="flex-1 bg-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border border-border h-9"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4 mr-2 shrink-0" />
                                                        Load Recipe
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteRecipe(index)}
                                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border h-9 px-3 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 shrink-0" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
