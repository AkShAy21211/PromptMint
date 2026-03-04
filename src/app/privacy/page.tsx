"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30 overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <nav className="flex items-center justify-between mb-16">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="group text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl px-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Button>
                    <ThemeToggle />
                </nav>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                    </div>
                    <p className="text-muted-foreground">Last updated: March 2026</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2>1. Information We Collect</h2>
                        <p>
                            In order to provide and improve the PromptMint service, we collect the following types of information:
                        </p>
                        <ul>
                            <li><strong>Account Information:</strong> We collect your email address solely for authentication.</li>
                            <li><strong>Service Data:</strong> We store the structural UI ideas you input and the resulting prompts to provide your prompt history.</li>
                            <li><strong>Analytics Data:</strong> We use internal analytics tools to collect anonymized usage statistics (e.g., feature usage, generation counts) to help us improve.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Data Sharing and Third Parties</h2>
                        <p>
                            We only share your data with trusted third-party infrastructure providers necessary to operate the Service:
                        </p>
                        <ul>
                            <li><strong>Payment Processing:</strong> Transactions are handled securely by <strong>Razorpay</strong>. We do not store or process your credit card numbers.</li>
                            <li><strong>AI Processing:</strong> Your structural ideas are sent to the <strong>Google Gemini API</strong> to generate the CO-STAR prompts.</li>
                        </ul>
                        <p className="font-bold text-emerald-500 dark:text-emerald-400">
                            We do not use third-party advertising networks, and we will never sell your personal data.
                        </p>
                    </section>

                    <section>
                        <h2>3. Security and GDPR Compliance</h2>
                        <p>
                            Safeguarding your data is our priority. PromptMint uses <strong>Supabase</strong> as our primary database and authentication provider.
                        </p>
                        <p>
                            Supabase is fully <strong>GDPR compliant</strong>, ensuring your data is stored securely with industry-standard encryption protocols.
                        </p>
                    </section>

                    <section>
                        <h2>4. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete the information we have on you. If you wish to permanently delete your account, please contact our support team.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
