"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, LayoutList, Terminal, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AgenticPhase } from "@/lib/parseAgenticPlan";

interface AgenticDashboardProps {
    phases: AgenticPhase[];
    completedPhases: number[];
    onTogglePhase: (id: number) => void;
}

export function AgenticDashboard({ phases, completedPhases, onTogglePhase }: AgenticDashboardProps) {
    const [copiedPhaseId, setCopiedPhaseId] = useState<number | null>(null);

    const handleCopy = async (id: number, content: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedPhaseId(id);
        
        // Auto-complete on copy if not already done
        if (!completedPhases.includes(id)) {
            onTogglePhase(id);
        }
        
        setTimeout(() => setCopiedPhaseId(null), 2000);
    };

    const progress = phases.length > 0 ? (completedPhases.length / phases.length) * 100 : 0;

    const getPhaseIcon = (id: number) => {
        if (id === 1) return <Terminal className="w-5 h-5" />;
        if (id === 2) return <LayoutList className="w-5 h-5" />;
        if (id === 3) return <Smartphone className="w-5 h-5" />;
        return <CheckCircle2 className="w-5 h-5" />;
    };

    return (
        <div className="w-full space-y-6">
            {/* Header / Progress bar */}
            <div className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-md border border-border p-6 rounded-[2rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight mb-1">Agentic Flight Plan</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            Project Orchestration Mode
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-cyan-500">{Math.round(progress)}%</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Completion</div>
                    </div>
                </div>
                
                {/* Progress Bar Track */}
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    />
                </div>

                {/* Ambient logic glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
            </div>

            {/* Phase Cards */}
            <div className="grid grid-cols-1 gap-4">
                {phases.map((phase) => {
                    const isCompleted = completedPhases.includes(phase.id);
                    const isNextToComplete = !isCompleted && (phase.id === 1 || completedPhases.includes(phase.id - 1));

                    return (
                        <motion.div
                            key={phase.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: phase.id * 0.1 }}
                            className={cn(
                                "group relative bg-card/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-border p-5 rounded-2xl transition-all duration-300",
                                isCompleted && "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/2",
                                isNextToComplete && "border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/5"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Status Icon */}
                                <button 
                                    onClick={() => onTogglePhase(phase.id)}
                                    className={cn(
                                        "mt-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        isCompleted 
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                            : "bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : phase.id}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className={cn(
                                                "font-bold transition-colors",
                                                isCompleted ? "text-emerald-500 line-through opacity-70" : "text-foreground"
                                            )}>
                                                {phase.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                    {getPhaseIcon(phase.id)}
                                                    Phase {phase.id}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCopy(phase.id, phase.content)}
                                            className={cn(
                                                "h-9 px-4 rounded-xl transition-all",
                                                copiedPhaseId === phase.id
                                                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                    : "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border border-cyan-500/20"
                                            )}
                                        >
                                            {copiedPhaseId === phase.id ? (
                                                <Check className="w-3.5 h-3.5 mr-2" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 mr-2" />
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {copiedPhaseId === phase.id ? "Copied" : "Copy Prompt"}
                                            </span>
                                        </Button>
                                    </div>

                                    {/* Content Preview */}
                                    <div className={cn(
                                        "bg-muted/30 p-4 rounded-xl border border-border/50 transition-all",
                                        isCompleted && "opacity-50"
                                    )}>
                                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-40 overflow-y-auto scrollbar-none">
                                            {phase.content.substring(0, 300)}
                                            {phase.content.length > 300 && "..."}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative line between phases */}
                            {phase.id < phases.length && (
                                <div className="absolute left-10 top-full h-4 w-px bg-border" />
                            )}
                        </motion.div>
                    );
                })}
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-[10px] text-amber-500/80 leading-relaxed font-medium">
                    <strong className="text-amber-500 uppercase">Usage Tip:</strong> Copy each phase and paste it into your preferred AI (Claude, GPT, etc.) one by one. Check them off as you complete the implementation!
                </p>
            </div>
        </div>
    );
}
