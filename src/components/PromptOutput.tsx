"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, FileText, FileDown, LayoutDashboard, ListTree } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AgenticDashboard } from "./AgenticDashboard";
import { parseAgenticPlan, stripPhaseMarkers } from "@/lib/parseAgenticPlan";

interface PromptOutputProps {
    result: string;
    isLoading: boolean;
    isPro?: boolean;
}

/**
 * Displays the generated prompt in a glassmorphism card.
 * Includes skeleton loading, copy-to-clipboard, and token estimation.
 */
export function PromptOutput({ result, isLoading, isPro }: PromptOutputProps) {
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [testPlatform, setTestPlatform] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"dashboard" | "sections">("dashboard");
    const [completedPhases, setCompletedPhases] = useState<number[]>([]);
    const { toast } = useToast();

    // Reset progress when result changes
    useEffect(() => {
        setCompletedPhases([]);
    }, [result]);

    const phases = parseAgenticPlan(result);
    const isAgentic = phases.length > 0;

    const togglePhase = (id: number) => {
        setCompletedPhases(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // Use stripped content for sections if it's agentic, otherwise full result
    const displayContent = isAgentic ? stripPhaseMarkers(result) : result;

    const platforms = [
        { id: 'claude', name: 'Claude', icon: 'C', color: 'from-orange-500/20 to-orange-600/20', text: 'text-orange-500' },
        { id: 'chatgpt', name: 'GPT', icon: 'G', color: 'from-emerald-500/20 to-emerald-600/20', text: 'text-emerald-500' },
        { id: 'perplexity', name: 'Perp', icon: 'P', color: 'from-cyan-500/20 to-cyan-600/20', text: 'text-cyan-500' },
        { id: 'grok', name: 'Grok', icon: 'X', color: 'from-zinc-500/20 to-zinc-600/20', text: 'text-foreground' }
    ];

    // Parsing logic to split by CO-STAR headers
    const sections = displayContent.split(/\n\n(?=\*\*)/g).map(section => {
        const match = section.match(/^\*\*(.*?)\*\*[:\s]*([\s\S]*)/);
        if (match) {
            return { title: match[1], content: match[2].trim() };
        }
        return { title: null, content: section.trim() };
    }).filter(s => s.content);

    const getFormattedMarkdown = () => {
        return sections.map(s => {
            if (s.title) {
                return `### ${s.title.toUpperCase()}\n${s.content}`;
            }
            return s.content;
        }).join('\n\n');
    };

    const handleCopy = async () => {
        if (!result) return;
        const clipboardText = getFormattedMarkdown();
        await navigator.clipboard.writeText(clipboardText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTest = async (platform: string) => {
        if (!result) return;
        const prompt = getFormattedMarkdown();

        setTestPlatform(platform);

        // Copy to clipboard first (Always a good fail-safe)
        try {
            await navigator.clipboard.writeText(prompt);
            setTimeout(() => {
                setTestPlatform(null);
            }, 3000);
        } catch {
            // clipboard failed silently
        }

        const platformBaseUrls: Record<string, string> = {
            claude: 'https://claude.ai/new',
            chatgpt: 'https://chatgpt.com',
            perplexity: 'https://www.perplexity.ai',
            grok: 'https://grok.com'
        };

        const MAX_URL_SAFE_LENGTH = 1800;
        const encoded = encodeURIComponent(prompt);
        const baseUrl = platformBaseUrls[platform];

        if (encoded.length > MAX_URL_SAFE_LENGTH) {
            toast({
                title: "Prompt too long for direct link",
                description: "Copied to clipboard — paste it manually on the AI's website.",
                variant: "destructive",
            });
            setTimeout(() => window.open(baseUrl, "_blank"), 500);
            return;
        }

        const platformUrls: Record<string, string> = {
            claude: `${baseUrl}?q=${encoded}`,
            chatgpt: `${baseUrl}/?q=${encoded}`,
            perplexity: `https://www.perplexity.ai/search?q=${encoded}`,
            grok: `${baseUrl}/?q=${encoded}`
        };

        if (platformUrls[platform]) {
            setTimeout(() => window.open(platformUrls[platform], "_blank"), 500);
        }
    };

    const handleShare = async () => {
        if (!result) return;
        const prompt = getFormattedMarkdown();

        const canShare = typeof navigator !== 'undefined' && !!navigator.share;

        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture('prompt_shared', { method: canShare ? 'native' : 'clipboard' });
        }

        if (canShare) {
            try {
                await navigator.share({
                    title: 'PromptMint | Structured Prompt',
                    text: `Check out this structured prompt I architected:\n\n${prompt.substring(0, 100)}...`,
                    url: window.location.origin
                });
            } catch {
                // User cancelled or silent fail
            }
        } else {
            // Desktop fallback: Copy prompt + link
            const shareText = `Check out this structured prompt I architected on PromptMint:\n\n${prompt}\n\nTry it at: ${window.location.origin}`;
            await navigator.clipboard.writeText(shareText);
            setShared(true);
            toast({
                title: "Shareable Link & Content Copied",
                description: "Paste it anywhere to share your prompt!",
            });
            setTimeout(() => setShared(false), 2000);
        }
    };

    const handleDownloadDoc = () => {
        if (!isPro) {
            toast({
                title: "Pro Feature",
                description: "Doc Export is only available for Pro members.",
                variant: "destructive",
            });
            return;
        }

        if (!result) return;

        const htmlSections = sections.map(s => `
            <div style="margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                ${s.title ? `<h3 style="color: #0891b2; font-size: 13pt; margin-bottom: 12px; text-transform: uppercase; font-family: Helvetica, Arial, sans-serif; letter-spacing: 1px;">${s.title}</h3>` : ''}
                <div style="font-size: 11pt; line-height: 1.7; color: #334155; white-space: pre-wrap; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    ${s.content.split('\n').map(line => line.trim().startsWith('-') ? `<div style="margin-left: 20px; text-indent: -20px;">• ${line.trim().substring(1).trim()}</div>` : `<div>${line}</div>`).join('')}
                </div>
            </div>
        `).join('');

        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>PromptMint Export</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; background-color: #ffffff; color: #1e293b; }
                    h1 { color: #020617; font-size: 24pt; border-bottom: 3px solid #0891b2; padding-bottom: 10px; margin-bottom: 32px; }
                    .footer { margin-top: 40px; font-size: 9pt; color: #94a3b8; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                </style>
            </head>
            <body>
                <h1>PromptMint | Structured Prompt</h1>
                ${htmlSections}
                <div class="footer">Generated by PromptMint — Advanced Architecture & Orchestration Suite</div>
            </body>
            </html>`;

        const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'promptmint-optimized-prompt.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture('doc_exported');
        }
    };

    const handleDownloadMarkdown = () => {
        if (!result) return;
        const markdown = getFormattedMarkdown();
        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "promptmint-optimized-prompt.md";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Use 3.2 as a more accurate heuristic for technical/code-heavy content
    const tokenCount = Math.round(result.length / 3.2);

    if (isLoading) {
        return (
            <div className="w-full space-y-4">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="w-full h-80 bg-card/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/5 animate-pulse" />
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Validated Blueprint
                </h3>

                {isAgentic && (
                    <div className="flex bg-background/50 p-1 rounded-xl border border-border">
                        <button
                            onClick={() => {
                                if (!isPro) {
                                    toast({
                                        title: "Pro Feature",
                                        description: "The Agentic Dashboard is an exclusive Pro feature for complex project orchestration.",
                                    });
                                    return;
                                }
                                setViewMode("dashboard");
                            }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                viewMode === "dashboard" ? "bg-cyan-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                                !isPro && "opacity-50"
                            )}
                        >
                            <LayoutDashboard className="w-3 h-3" />
                            Dashboard
                            {!isPro && <span className="text-[8px] bg-violet-500/20 text-violet-400 px-1 rounded-sm">PRO</span>}
                        </button>
                        <button
                            onClick={() => setViewMode("sections")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                viewMode === "sections" ? "bg-cyan-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ListTree className="w-3 h-3" />
                            Technical Sections
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 bg-muted/30 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md w-full sm:w-auto">

                    {/* Multi-AI Selectors */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-background/40 dark:bg-black/20 p-1 rounded-xl overflow-x-auto scrollbar-none flex-1 min-w-0">
                        {platforms.map((p) => (
                            <Button
                                key={p.id}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTest(p.id)}
                                className={cn(
                                    "w-8 h-8 p-0 rounded-lg transition-all relative overflow-hidden group flex-shrink-0",
                                    testPlatform === p.id
                                        ? "bg-gradient-to-br from-cyan-600/20 to-violet-600/20 border border-cyan-500/30"
                                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                )}
                                title={`Test in ${p.name}`}
                            >
                                <span className={cn("text-xs font-black transition-transform group-hover:scale-110", p.text)}>
                                    {p.icon}
                                </span>
                                {testPlatform === p.id && (
                                    <motion.div
                                        layoutId="activePlatform"
                                        className="absolute inset-0 bg-cyan-500/10 pointer-events-none"
                                    />
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Divider + Actions — always on same row, pushed right */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <div className="w-[1px] h-4 bg-border dark:bg-zinc-800 mr-0.5" />

                        {/* DOC */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadDoc}
                            className={cn(
                                "h-8 w-8 sm:w-auto sm:px-3 p-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-1.5",
                                !isPro && "opacity-50"
                            )}
                        >
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline text-[10px] font-bold">DOC</span>
                        </Button>

                        {/* MD */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadMarkdown}
                            className="h-8 w-8 sm:w-auto sm:px-3 p-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-1.5"
                        >
                            <FileDown className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline text-[10px] font-bold">MD</span>
                        </Button>

                        {/* SHARE */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="h-8 w-8 sm:w-auto sm:px-3 p-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-1.5"
                        >
                            {shared
                                ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                : <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                            }
                            <span className="hidden sm:inline text-[10px] font-bold">
                                {shared ? "COPIED" : "SHARE"}
                            </span>
                        </Button>

                        {/* COPY */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8 w-8 sm:w-auto sm:px-3 p-0 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-1.5"
                        >
                            {copied
                                ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                : <Copy className="w-3.5 h-3.5 flex-shrink-0" />
                            }
                            <span className="hidden sm:inline text-[10px] font-bold">
                                {copied ? "COPIED" : "COPY"}
                            </span>
                        </Button>
                    </div>

                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative space-y-4"
            >
                <AnimatePresence mode="wait">
                    {isAgentic && viewMode === "dashboard" ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <AgenticDashboard 
                                phases={phases} 
                                completedPhases={completedPhases} 
                                onTogglePhase={togglePhase} 
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sections"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-card/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/50 hover:border-cyan-500/30 p-5 rounded-2xl transition-all duration-300"
                                >
                                    {section.title && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-4 bg-cyan-600 dark:bg-cyan-500 rounded-full" />
                                            <h4 className="text-[10px] font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-widest">{section.title}</h4>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "text-foreground/90 dark:text-zinc-300 leading-relaxed text-sm selection:bg-cyan-500/30 whitespace-pre-wrap",
                                        section.title ? "ml-4" : ""
                                    )}>
                                        {section.content.split('\n').map((line, i) => (
                                            <div key={i} className={cn(
                                                "mb-1.5",
                                                line.trim().startsWith('-') ? "flex items-start gap-2 pl-1" : ""
                                            )}>
                                                {line.trim().startsWith('-') && (
                                                    <span className="text-cyan-600 dark:text-cyan-500 font-bold mt-1.5">•</span>
                                                )}
                                                <span>{line.trim().startsWith('-') ? line.trim().substring(1).trim() : line}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ambient glow */}
                <div className="absolute -inset-10 bg-cyan-500/5 blur-[100px] pointer-events-none -z-10" />
            </motion.div>

            <div className="flex justify-between items-center px-2">
                <span className="text-[10px] text-muted-foreground/40 font-mono">
                    EST. {tokenCount} TOKENS
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-tighter">
                    CO-STAR COMPLIANT STRUCTURE
                </span>
            </div>
        </div>
    );
}
