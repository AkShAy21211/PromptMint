"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, ChevronUp, Trash2, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface HistoryEntry {
    idea: string;
    result: string;
    stack?: Record<string, string>;
    timestamp: number;
}

interface PromptHistoryProps {
    onRestore: (entry: HistoryEntry) => void;
    user?: User | null;
    isPro?: boolean;
    refreshTrigger?: number;
}

const STORAGE_KEY = "promptmint_history";

export function PromptHistory({ onRestore, user, isPro, refreshTrigger }: PromptHistoryProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setIsOffline(false);

            try {
                // Only fetch from Supabase if user is logged in AND is a Pro/Lifetime member
                if (user && isPro) {
                    const { data, error } = await supabase
                        .from('prompts')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(10); // Increased limit for Pro users

                    if (error) throw error;

                    if (data) {
                        type SupabasePromptRow = { title: string; content: string; stack: Record<string, string>; created_at: string };
                        setHistory((data as SupabasePromptRow[]).map((p) => ({
                            idea: p.title,
                            result: p.content,
                            stack: p.stack,
                            timestamp: new Date(p.created_at).getTime()
                        })));
                    }
                } else {
                    throw new Error("Local Only"); // Force local path for non-pro
                }
            } catch (e) {
                // For guests, free users, or if Supabase fails
                if (user && isPro && (e instanceof Error && e.message !== "Local Only")) {
                    setIsOffline(true);
                }

                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    try {
                        setHistory(JSON.parse(saved));
                    } catch (parseErr) {
                        console.error("Failed to parse history", parseErr);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, isPro, refreshTrigger, supabase]);

    const clearHistory = async () => {
        try {
            if (user && !isOffline) {
                await supabase.from('prompts').delete().eq('user_id', user.id);
            }
        } catch (e) {
            console.error("Failed to clear DB history:", e);
        }

        localStorage.removeItem(STORAGE_KEY);
        setHistory([]);
        setExpandedIndex(null);
        setShowConfirm(false);
    };

    return (
        <div className="w-full space-y-4 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Recent Mintings
                    </h3>
                    <AnimatePresence>
                        {isPro && !isOffline && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium tracking-wide"
                            >
                                Cloud Sync
                            </motion.span>
                        )}
                        {isOffline && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium tracking-wide flex items-center gap-1"
                            >
                                <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                                Offline Mode
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {loading && <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />}
                </div>
                <AnimatePresence mode="wait">
                    {history.length > 0 && (
                        !showConfirm ? (
                            <motion.div
                                key="clear-btn"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirm(true)}
                                    className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors h-7 px-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                    Clear
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="confirm-btns"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2"
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirm(false)}
                                    className="text-muted-foreground hover:text-foreground h-7 px-2 font-bold text-[10px] uppercase tracking-wider"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearHistory}
                                    className="bg-red-500 text-white hover:bg-red-600 h-7 px-3 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                                >
                                    Confirm Delete
                                </Button>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="py-8 px-4 border border-dashed border-border/50 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">No prompt history yet.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">Your recent mintings will appear here.</p>
                    </div>
                ) : (
                    history.map((entry, index) => {
                        const isExpanded = expandedIndex === index;
                        return (
                            <div
                                key={entry.timestamp}
                                className="group overflow-hidden rounded-xl bg-card/30 dark:bg-zinc-900/30 border border-border transition-all hover:border-border/80"
                            >
                                <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm text-foreground/90 truncate font-medium">
                                            {entry.idea}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase mt-1">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                                            <div className="p-4 pt-0 border-t border-border/50 space-y-4">
                                                <div className="bg-muted/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                                        {entry.result}
                                                    </pre>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => onRestore(entry)}
                                                    className="w-full bg-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border border-border h-9"
                                                >
                                                    <ArrowUpRight className="w-4 h-4 mr-2" />
                                                    Restore to Output
                                                </Button>
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
