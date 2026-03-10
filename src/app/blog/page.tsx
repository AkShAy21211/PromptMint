import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "PromptMint Blog | Insights on AI & Web Development",
    description: "Learn how to build faster with AI. Guides on Next.js, React, Prompt Engineering, and more.",
    keywords: ["AI Coding", "Prompt Engineering", "Next.js Blog", "React Development", "Web Development Guides", "SaaS Growth"],
};

export default function BlogIndex() {
    const posts = [
        {
            title: "Mastering Next.js 16: The Definitive Guide to Server Actions and Explicit Caching",
            description: "Shift from 'API-first' to 'Server-first' with the latest Next.js 16 features. Learn how to master explicit caching and built-in CSRF protection.",
            date: "March 10, 2026",
            slug: "nextjs-16-server-actions-caching",
            tags: ["Next.js-16", "React-19", "Server-Actions"]
        },
        {
            title: "Svelte 5 and the 'SupaSvelte' Stack—Why the Compiler-First Approach Wins in 2026",
            description: "The frontend landscape is converging on signals-based reactivity, and Svelte 5 is leading the charge with its 'Runes' system. Explore the faster startup times and minimal bundle sizes.",
            date: "March 10, 2026",
            slug: "svelte-5-supasvelte-stack-runes",
            tags: ["Svelte-5", "SupaSvelte", "Runes"]
        },
        {
            title: "Building for the Agentic Era—A Developer’s Guide to MCP and AI-Native Workflows",
            description: "Development is no longer just about writing code; it’s about orchestrating autonomous agents that can query your database, browse the web, and execute terminal commands.",
            date: "March 10, 2026",
            slug: "mcp-agentic-era-guide",
            tags: ["Agentic-AI", "MCP", "Workflow"]
        },
        {
            title: "Don’t Refactor, Re-Architect—How to Modernize Legacy Systems with Structural Prompting",
            description: "Stop refactoring spaghetti code. Learn the 2-step process for intent extraction and clean-slate building using the CO-STAR framework.",
            date: "March 10, 2026",
            slug: "modernize-legacy-systems-structural-prompting",
            tags: ["Architecture", "Refactoring", "Legacy"]
        }
    ];

    return (
        <div className="space-y-12">
            <header className="mb-16">
                <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                    The PromptMint Blog
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Deep dives into modern web development, AI engineering, and how to ship higher quality software in less time.
                </p>
            </header>

            <div className="grid gap-8">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group block p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/20 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold tracking-widest uppercase text-cyan-500/60 bg-cyan-500/5 px-2 py-0.5 rounded-full border border-cyan-500/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-2xl font-bold text-foreground group-hover:text-cyan-500 transition-colors mb-3">
                                    {post.title}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    {post.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/40 font-mono">
                                    <span>{post.date}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 group-hover:text-cyan-500 transition-colors">
                                        Read Article <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-zinc-900/50 border border-white/5 border-dashed text-center">
                <p className="text-muted-foreground italic">
                    More insights and guides coming soon. Follow our journey.
                </p>
            </div>
        </div>
    );
}
