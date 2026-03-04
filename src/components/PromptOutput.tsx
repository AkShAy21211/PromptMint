"use client";

import { useState } from "react";
import { Copy, Check, Share2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

    const platforms = [
        { id: 'claude', name: 'Claude', icon: 'C', color: 'from-orange-500/20 to-orange-600/20', text: 'text-orange-500' },
        { id: 'chatgpt', name: 'GPT', icon: 'G', color: 'from-emerald-500/20 to-emerald-600/20', text: 'text-emerald-500' },
        { id: 'perplexity', name: 'Perp', icon: 'P', color: 'from-cyan-500/20 to-cyan-600/20', text: 'text-cyan-500' },
        { id: 'grok', name: 'Grok', icon: 'X', color: 'from-zinc-500/20 to-zinc-600/20', text: 'text-foreground' }
    ];

    // Parsing logic to split by CO-STAR headers
    const sections = result.split(/\n\n(?=\*\*)/g).map(section => {
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

        // Map of platform URL structures
        const platformUrls: Record<string, string> = {
            claude: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
            chatgpt: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
            perplexity: `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
            grok: `https://grok.com/?q=${encodeURIComponent(prompt)}`
        };

        // Open the selected platform in a new tab
        if (platformUrls[platform]) {
            setTimeout(() => window.open(platformUrls[platform], "_blank"), 500);
        }
    };

    const handleShare = async () => {
        if (!result) return;
        const prompt = getFormattedMarkdown();

        const canShare = typeof navigator !== 'undefined' && !!navigator.share;

        if (typeof window !== 'undefined' && 'posthog' in window) {
            (window as unknown as { posthog: { capture: (e: string, p: Record<string, unknown>) => void } }).posthog.capture('prompt_shared', { method: canShare ? 'native' : 'clipboard' });
        }

        if (canShare) {
            try {
                await navigator.share({
                    title: 'PromptMint | Structured Prompt',
                    text: `Check out this structured prompt I minted:\n\n${prompt.substring(0, 100)}...`,
                    url: window.location.origin
                });
            } catch {
                // User cancelled or silent fail
            }
        } else {
            // Desktop fallback: Copy prompt + link
            const shareText = `Check out this structured prompt I generated on PromptMint:\n\n${prompt}\n\nTry it at: ${window.location.origin}`;
            await navigator.clipboard.writeText(shareText);
            setShared(true);
            toast({
                title: "Shareable Link & Content Copied",
                description: "Paste it anywhere to share your prompt!",
            });
            setTimeout(() => setShared(false), 2000);
        }
    };

    // ... handleDownloadDoc remains the same ...
    const handleDownloadDoc = () => {
        if (!isPro) {
            toast({
                title: "Pro Feature",
                description: "Doc Export is only available for Pro and Lifetime members.",
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
                <div class="footer">Generated by PromptMint — Artificial Intelligence Prompt Engineering Suite</div>
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

        if (typeof window !== 'undefined' && 'posthog' in window) {
            (window as unknown as { posthog: { capture: (e: string) => void } }).posthog.capture('doc_exported');
        }
    };

    const tokenCount = Math.round(result.length / 4);

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

                <div className="flex items-center gap-1.5 bg-muted/30 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md">
                    {/* Multi-AI Selectors */}
                    <div className="flex items-center gap-1 bg-background/40 dark:bg-black/20 p-1 rounded-xl mr-1">
                        {platforms.map((p) => (
                            <Button
                                key={p.id}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTest(p.id)}
                                className={cn(
                                    "w-9 h-9 p-0 rounded-lg transition-all relative overflow-hidden group",
                                    testPlatform === p.id
                                        ? "bg-gradient-to-br from-cyan-600/20 to-violet-600/20 border border-cyan-500/30"
                                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                )}
                                title={`Test in ${p.name}`}
                            >
                                <span className={cn(
                                    "text-xs font-black transition-transform group-hover:scale-110",
                                    p.text
                                )}>
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

                    <div className="w-[1px] h-4 bg-border dark:bg-zinc-800 mx-0.5" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadDoc}
                        className={cn(
                            "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 h-9 px-3 text-[10px] font-bold flex items-center gap-2 rounded-lg",
                            !isPro && "opacity-50"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        DOC
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 h-9 px-3 text-[10px] font-bold flex items-center gap-2 rounded-lg"
                    >
                        {shared ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        ) : (
                            <Share2 className="w-3.5 h-3.5" />
                        )}
                        {shared ? "COPIED" : "SHARE"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 px-3 text-[10px] font-bold flex items-center gap-2 rounded-lg"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "COPIED" : "COPY"}
                    </Button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative space-y-4"
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
