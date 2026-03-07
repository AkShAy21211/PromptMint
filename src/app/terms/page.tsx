"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <nav className="flex items-center justify-between mb-20 relative z-10">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/editor">
                            <Button
                                variant="ghost"
                                className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Editor
                            </Button>
                        </Link>
                    </div>
                </nav>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <FileText className="w-5 h-5 text-violet-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                    </div>
                    <p className="text-muted-foreground">Last updated: March 2026</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2>1. Agreement to Terms</h2>
                        <p>
                            By accessing or using PromptMint (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you must not access our service.
                        </p>
                    </section>

                    <section>
                        <h2>2. Subscriptions & Payments</h2>
                        <p>
                            PromptMint operates on a recurring subscription model (&quot;Pro&quot;). Pricing is currently listed as ₹149/month.
                        </p>
                        <ul>
                            <li><strong>Taxes:</strong> All listed prices are exclusive of applicable GST unless stated otherwise. Applicable GST is automatically calculated and charged during checkout via Razorpay.</li>
                            <li><strong>Invoicing:</strong> A GST-compliant receipt is automatically generated and emailed to you by Razorpay upon successful payment.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Cancellation & Refunds</h2>
                        <p>
                            You may cancel your subscription at any time through your account dashboard.
                        </p>
                        <p>
                            <strong>Refund Policy:</strong> We offer a 7-day money-back guarantee. No refunds will be provided after 7 days from the initial transaction date.
                        </p>
                    </section>

                    <section>
                        <h2>4. Acceptable Usage</h2>
                        <p>
                            We grant you a personal, non-exclusive, non-transferable license to use the Service.
                        </p>
                        <ul>
                            <li><strong>Commercial Use:</strong> You are free to use the generated prompts for your commercial software projects.</li>
                            <li><strong>Restrictions:</strong> You may not resell, redistribute, or package the generated prompts themselves as a standalone commercial service or product.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Data Privacy</h2>
                        <p>
                            We take your privacy seriously. Your generated prompts and account metadata are stored securely using Supabase, which is fully GDPR compliant. For more details, review our <a href="/privacy">Privacy Policy</a>.
                        </p>
                    </section>

                    <section>
                        <h2>6. Limitation of Liability</h2>
                        <p>
                            The Service relies on third-party Artificial Intelligence APIs. PromptMint provides no warranty regarding the accuracy, reliability, or quality of the AI-generated outputs. Google Gemini&apos;s Terms of Service also apply.
                        </p>
                    </section>

                    <section>
                        <h2>7. Governing Law</h2>
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of India.
                        </p>
                    </section>
                </div>

                <footer className="mt-20 pb-8 border-t border-border/50 dark:border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
                    <p>© 2026 PromptMint. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}
