import { AlertCircle, CheckCircle2, ShieldAlert, Zap } from "lucide-react";
import { Stack } from "@/lib/types";
import { cn } from "@/lib/utils";
import { detectConflicts } from "@/lib/detectConflicts";

interface PromptHealthProps {
    userIdea: string;
    stack: Stack;
}

export function PromptHealth({ userIdea, stack }: PromptHealthProps) {
    const hints: { type: "error" | "warning" | "success" | "conflict"; text: string }[] = [];

    // 0. Check Conflicts (STRICT)
    const conflicts = detectConflicts(userIdea, stack);
    conflicts.forEach(conflict => {
        hints.push({
            type: "conflict",
            text: `Conflict: Your idea mentions "${conflict.foundInText}", but you have "${conflict.selected}" selected. ${conflict.selected} will take precedence.`,
        });
    });

    // 1. Check length
    if (userIdea.trim().length === 0) {
        // Hide entirely if empty
        return null;
    } else if (userIdea.trim().length < 15) {
        hints.push({
            type: "error",
            text: "Idea is very short. The AI will have to hallucinate features and data models.",
        });
    } else if (userIdea.trim().length > 100) {
        hints.push({
            type: "success",
            text: "Great detail! This will produce a highly accurate prompt.",
        });
    }

    // 2. Check Stack
    if (stack.framework === "None" && stack.database === "None" && stack.apiPattern === "None") {
        hints.push({
            type: "warning",
            text: "No framework or database selected. The AI will improvise logic entirely in vanilla code.",
        });
    } else if (!stack.database || stack.database === "None") {
        // Only warn if they picked a backend/fullstack framework
        const backendFrameworks = ["Next.js", "Express", "NestJS", "FastAPI", "Django", "Spring Boot", "Laravel"];
        if (stack.framework && backendFrameworks.includes(stack.framework)) {
            hints.push({
                type: "warning",
                text: `You selected ${stack.framework} but no Database. Data will not be persisted.`,
            });
        }
    }

    if (hints.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 flex flex-col gap-2">
            {hints.map((hint, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-medium transition-colors",
                        hint.type === "error" &&
                        "bg-rose-500/10 border-rose-500/20 text-rose-500",
                        hint.type === "warning" &&
                        "bg-amber-500/10 border-amber-500/20 text-amber-500",
                        hint.type === "success" &&
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                        hint.type === "conflict" &&
                        "bg-violet-500/10 border-violet-500/20 text-violet-500 animate-pulse"
                    )}
                >
                    {hint.type === "error" && <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
                    {hint.type === "warning" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    {hint.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    {hint.type === "conflict" && <Zap className="w-3.5 h-3.5 shrink-0" />}
                    <span>{hint.text}</span>
                </div>
            ))}
        </div>
    );
}
