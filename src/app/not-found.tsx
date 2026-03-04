"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30 overflow-x-hidden flex items-center justify-center">
            <div className="max-w-md mx-auto px-6 py-12 text-center">
                <div className="mb-8">
                    <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">404 – Page Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    Oops! We couldn&rsquo;t find what you were looking for. It may have been moved or deleted.
                </p>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Button>
             
            </div>
        </main>
    );
}
