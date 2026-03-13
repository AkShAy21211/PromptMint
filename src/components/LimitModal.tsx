import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    isGuest: boolean;
    promptCount?: number;
}

export function LimitModal({ isOpen, onClose, onLogin, isGuest, promptCount = 0 }: LimitModalProps) {
    const router = useRouter();

    const isGuestBridge = isGuest && promptCount >= 3;
    const isFreeTrialEnd = !isGuest && promptCount >= 5;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-violet-500/10 pointer-events-none" />

                        <div className="p-8 md:p-12 relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-full border",
                                    isGuestBridge ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <Lock className="w-5 h-5" />
                                    <span className="font-bold tracking-wide text-sm">
                                        {isGuestBridge 
                                            ? "Guest Limit Reached (3 Prompts)" 
                                            : isFreeTrialEnd 
                                                ? "Pro Trial Completed (5 Prompts)"
                                                : "Monthly Limit Reached"}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-zinc-500 hover:text-white transition-colors bg-black/20 p-2 rounded-full border border-white/5"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
                                {isGuestBridge ? (
                                    <>
                                        Get 2 more <span className="text-cyan-400">Pro</span> prompts.<br />
                                        <span className="text-zinc-500 text-3xl">Just sign up to continue.</span>
                                    </>
                                ) : (
                                    <>
                                        Welcome to the limit.<br />
                                        <span className="text-zinc-500">Unlock your AI generation potential.</span>
                                    </>
                                )}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-lg">
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                                    <div className="text-zinc-400 font-bold mb-1 uppercase text-sm tracking-wider">
                                        {isGuestBridge ? "Guest Usage" : "Free Tier"}
                                    </div>
                                    <div className="text-2xl font-black text-white flex items-center gap-3">
                                        {isGuestBridge ? "3 / 3 Used" : "5 prompts / month"}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
                                    <div className="text-violet-300 font-bold mb-1 uppercase text-sm tracking-wider relative z-10">Pro Trial</div>
                                    <div className="text-2xl font-black text-white flex items-center gap-3 relative z-10">
                                        {isGuestBridge ? "+2 Pro Prompts" : "Unlimited Prompts"}
                                    </div>
                                </div>
                            </div>

                            {isGuestBridge ? (
                                <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-6 rounded-r-2xl mb-12 text-zinc-300">
                                    <p className="font-bold text-cyan-400 mb-2">Claim your engineering gift:</p>
                                    Sign up now to unlock 2 additional architecture generations with <strong>Claude 3.5 Sonnet</strong> and save your tech-stack history.
                                </div>
                            ) : (
                                <div className="bg-zinc-900/50 border-l-4 border-violet-500 p-6 rounded-r-2xl mb-12 italic text-zinc-300">
                                    &quot;Architected the core structure of 12 features in 2hrs yesterday. This tool massively accelerates my initial workflows.&quot;
                                    <div className="text-sm font-bold text-zinc-500 font-sans not-italic mt-3">— Pro User Testimonial</div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                {isGuestBridge ? (
                                    <Button
                                        onClick={onLogin}
                                        className="w-full sm:w-auto h-14 px-10 bg-cyan-500 text-white hover:bg-cyan-400 font-black text-xl rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Sign Up Free <ChevronRight className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => router.push("/pricing")}
                                        className="w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-zinc-200 font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5 text-violet-600" />
                                        Upgrade to Pro <span className="text-zinc-500 font-normal ml-1">₹149</span >
                                    </Button>
                                )}
                                
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full sm:w-auto h-14 px-6 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                                >
                                    Maybe later
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
