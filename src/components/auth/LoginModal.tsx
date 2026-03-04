"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Mail, Lock, Loader2, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// ✅ Extracted — reusable and testable outside the component
const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // ✅ Derived — no extra state needed
    const emailError = emailTouched && email && !isValidEmail(email)
        ? "Please enter a valid email address"
        : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Guard: block submission if email is still invalid
        if (!isValidEmail(email)) {
            setEmailTouched(true);
            return;
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setError("Supabase keys are missing in .env.local!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                // attempt to register the user with Supabase
                const { data: signUpData, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) throw error;

                // if the signup call returned a user object we can go ahead and
                // create a matching profile row in our own table.  In some flows
                // (magic link, email confirmation) `signUpData.user` may be null
                // until the user actually verifies; that's fine, the profile will
                // be created later on first successful sign‑in via the auth
                // listener in `app/page.tsx`.
                if (signUpData?.user) {
                    try {
                        await supabase.from('profiles').insert({
                            id: signUpData.user.id,
                            usage_count: 0,
                            is_pro: false,
                        });
                    } catch (profileError) {
                        // if inserting fails (for example the row already exists),
                        // we can ignore it; it's a best‑effort step.
                        console.warn('Failed to create profile after signup', profileError);
                    }
                }
            }

            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            let message = err instanceof Error ? err.message : "An unexpected error occurred";
            // improve guidance when someone tries to sign up with an existing
            // account – the default Supabase message is a little terse.
            if (!isLogin && message.toLowerCase().includes('already registered')) {
                message =
                    "An account with that email already exists. Try signing in instead.";
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Reset transient state when switching modes
    const handleToggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmailTouched(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden"
            >
                <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500 via-violet-500 to-emerald-500 rounded-[2rem] opacity-30 blur-sm" />

                <div className="relative bg-card/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/10">
                            <Sparkles className="w-8 h-8 text-cyan-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            {isLogin ? "Welcome Back" : "Start Building"}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-2">
                            {isLogin
                                ? "Sign in to sync your prompts across all devices"
                                : "Create an account to unlock unlimited prompt history"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    className={`w-full bg-zinc-100/50 dark:bg-white/5 border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                                        emailError
                                            ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/50"
                                            : "border-zinc-200 dark:border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                                    }`}
                                    required
                                />
                            </div>
                            {/* ✅ Inline validation message — only shown after blur */}
                            {emailError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-rose-400 pl-1 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {emailError}
                                </motion.p>
                            )}
                        </div>

                        {/* Password Field with Toggle */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                required
                            />
                            {/* ✅ Toggle button — accessible with aria-label */}
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 p-3 rounded-xl"
                            >
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold py-6 rounded-xl shadow-xl shadow-cyan-900/20 border border-white/10 active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isLogin ? "Sign In" : "Sign Up"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={handleToggleMode}
                                className="ml-2 text-cyan-500 font-bold hover:text-cyan-400 transition-colors"
                            >
                                {isLogin ? "Join now" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />
                </div>
            </motion.div>
        </div>
    );
}