"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showSubtitle?: boolean;
}

export function Logo({ className, showSubtitle = true }: LogoProps) {
    return (
        <Link href="/" className={cn("flex items-center gap-4 group hover:opacity-80 transition-opacity", className)}>
            <div className="hidden sm:block">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                    PromptMint
                </h1>
                {showSubtitle && (
                    <p className="text-muted-foreground text-[10px] font-bold tracking-[0.1em] uppercase">
                        Advanced Architecture & Orchestration
                    </p>
                )}
            </div>
        </Link>
    );
}
