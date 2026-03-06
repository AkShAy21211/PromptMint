"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, ChevronUp, Trash2, ArrowUpRight, Loader2, AlertTriangle, Tag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface HistoryEntry {
    id?: string;
    idea: string;
    result: string;
    stack?: Record<string, string>;
    timestamp: number;
    tags?: string[];
}

interface PromptHistoryProps {
    onRestore: (entry: HistoryEntry) => void;
    user?: User | null;
    isPro?: boolean;
    refreshTrigger?: number;
}

const STORAGE_KEY = "promptmint_history";

export function PromptHistory({ onRestore, user, isPro, refreshTrigger = 0 }: PromptHistoryProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTags, setNewTags] = useState<Record<number, string>>({});
    const supabase = createClient();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setIsOffline(false);

            try {
                if (user && isPro) {
                    const { data, error } = await supabase
                        .from("prompts")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false })
                        .limit(10);

                    if (error) throw error;

                    if (data) {
                        type SupabasePromptRow = {
                            id: string;
                            title: string;
                            content: string;
                            stack: Record<string, string>;
                            created_at: string;
                            tags: string[];
                        };
                        setHistory(
                            (data as SupabasePromptRow[]).map((p) => ({
                                id: p.id,
                                idea: p.title,
                                result: p.content,
                                stack: p.stack,
                                timestamp: new Date(p.created_at).getTime(),
                                tags: p.tags || [],
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
                await supabase.from("prompts").delete().eq("user_id", user.id);
            }
        } catch (e) {
            console.error("Failed to clear DB history:", e);
        }

        localStorage.removeItem(STORAGE_KEY);
        setHistory([]);
        setExpandedIndex(null);
        setShowClearConfirm(false);
    };

    const deleteEntry = async (index: number) => {
        const entry = history[index];

        if (user && isPro && !isOffline && entry.id) {
            try {
                await supabase.from("prompts").delete().eq("id", entry.id);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }

        const updated = history.filter((_, i) => i !== index);
        setHistory(updated);

        if (!user || isOffline || !isPro) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        // Reset UI state
        setDeleteConfirmIndex(null);
        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex !== null && expandedIndex > index) {
            setExpandedIndex(expandedIndex - 1);
        }
    };

    const handleAddTag = async (index: number, tag: string) => {
        const entry = history[index];
        if (!tag.trim() || entry.tags?.includes(tag.trim())) return;

        const updatedTags = [...(entry.tags || []), tag.trim()];
        const updatedHistory = [...history];
        updatedHistory[index] = { ...entry, tags: updatedTags };
        setHistory(updatedHistory);

        if (user && isPro && !isOffline && entry.id) {
            try {
                await supabase.from("prompts").update({ tags: updatedTags }).eq("id", entry.id);
            } catch (err) {
                console.error("Add tag failed:", err);
            }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        }
    };

    const handleRemoveTag = async (index: number, tagToRemove: string) => {
        const entry = history[index];
        const updatedTags = (entry.tags || []).filter(t => t !== tagToRemove);
        const updatedHistory = [...history];
        updatedHistory[index] = { ...entry, tags: updatedTags };
        setHistory(updatedHistory);

        if (user && isPro && !isOffline && entry.id) {
            try {
                await supabase.from("prompts").update({ tags: updatedTags }).eq("id", entry.id);
            } catch (err) {
                console.error("Remove tag failed:", err);
            }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        }
    };

    const filteredHistory = searchQuery.trim()
        ? history.filter((entry) => {
            const q = searchQuery.toLowerCase();
            return (
                entry.idea.toLowerCase().includes(q) ||
                entry.result.toLowerCase().includes(q) ||
                (entry.tags && entry.tags.some(t => t.toLowerCase().includes(q)))
            );
        })
        : history;

    return (
        <div className="w-full space-y-4 pt-8 border-t border-border/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search ideas or output..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 px-3 rounded-lg bg-card/40 dark:bg-zinc-900/40 border border-border dark:border-zinc-800 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/60 w-full md:w-56"
                    />

                    {/* Clear All */}
                    <AnimatePresence mode="wait">
                        {history.length > 0 &&
                            (!showClearConfirm ? (
                                <motion.div
                                    key="clear-btn"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowClearConfirm(true)}
                                        className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors h-7 px-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Clear All
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
                                        onClick={() => setShowClearConfirm(false)}
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
                            ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="py-8 px-4 border border-dashed border-border/50 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">No prompt history yet.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                            Your recent mintings will appear here.
                        </p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="py-6 px-4 border border-dashed border-border/50 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">No entries match your search.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                            Try adjusting your keywords or clearing the search box.
                        </p>
                    </div>
                ) : (
                    filteredHistory.map((entry, index) => {
                        const isExpanded = expandedIndex === index;
                        const isPendingDelete = deleteConfirmIndex === index;

                        return (
                            <div
                                key={entry.timestamp}
                                className="relative group overflow-hidden rounded-xl bg-card/30 dark:bg-zinc-900/30 border border-border transition-all hover:border-border/80"
                            >
                                {/* Collapse/Expand toggle */}
                                <button
                                    onClick={() => {
                                        setDeleteConfirmIndex(null); // dismiss delete confirm on collapse
                                        setExpandedIndex(isExpanded ? null : index);
                                    }}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm text-foreground/90 truncate font-medium">
                                                {entry.idea}
                                            </p>
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                                    {entry.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 truncate max-w-[60px]">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {entry.tags.length > 2 && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                                            +{entry.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    )}
                                </button>

                                {/* Expanded content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 border-t border-border/50 space-y-3 pt-3">
                                                {/* Tags Editor */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {entry.tags?.map((tag) => (
                                                        <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            {tag}
                                                            <button
                                                                onClick={() => handleRemoveTag(index, tag)}
                                                                className="hover:text-amber-400 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <div className="flex items-center gap-1 border border-dashed border-border rounded-md px-2 py-0.5 max-w-[120px]">
                                                        <input
                                                            type="text"
                                                            placeholder="Add tag..."
                                                            value={newTags[index] || ""}
                                                            onChange={(e) => setNewTags(prev => ({ ...prev, [index]: e.target.value }))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleAddTag(index, newTags[index] || "");
                                                                    setNewTags(prev => ({ ...prev, [index]: "" }));
                                                                }
                                                            }}
                                                            className="bg-transparent border-none text-[10px] outline-none w-full text-foreground placeholder:text-muted-foreground"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                handleAddTag(index, newTags[index] || "");
                                                                setNewTags(prev => ({ ...prev, [index]: "" }));
                                                            }}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Result preview */}
                                                <div className="bg-muted/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                                        {entry.result}
                                                    </pre>
                                                </div>

                                                {/* Action row */}
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    {/* Restore */}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onRestore(entry)}
                                                        className="flex-1 bg-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border border-border h-9"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4 mr-2 shrink-0" />
                                                        Restore to Output
                                                    </Button>

                                                    {/* Delete / Confirm */}
                                                    <AnimatePresence mode="wait">
                                                        {!isPendingDelete ? (
                                                            <motion.div
                                                                key="delete-btn"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setDeleteConfirmIndex(index)}
                                                                    className="w-full sm:w-auto text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border h-9 px-3 transition-colors"
                                                                    aria-label="Delete this entry"
                                                                >
                                                                    <Trash2 className="w-4 h-4 shrink-0" />
                                                                </Button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="delete-confirm"
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="flex items-center gap-1.5 w-full sm:w-auto"
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setDeleteConfirmIndex(null)}
                                                                    className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground h-9 px-3 border border-border text-[10px] uppercase tracking-wider font-bold"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => deleteEntry(index)}
                                                                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white h-9 px-3 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 rounded-lg"
                                                                >
                                                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                                                    Delete
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
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