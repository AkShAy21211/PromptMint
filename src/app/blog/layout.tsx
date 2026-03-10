import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
                <div className="container max-w-4xl mx-auto flex h-16 items-center px-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-cyan-500 transition-colors"
                    >
                        <div className="p-1 rounded-full bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Editor
                    </Link>

                    <div className="ml-auto">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
                                PromptMint
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="container max-w-3xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-20">
                <div className="container max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        Built for developers who want to ship faster.
                    </p>
                    <div className="flex justify-center gap-6">
                        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
                        <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
