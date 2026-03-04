import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { Stack } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-2.5-flash as it is confirmed available via ListModels
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
}, { apiVersion: "v1" });

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Extract IP for guest tracking
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

        const { userIdea, stack }: { userIdea: string; stack: Stack } = await req.json();

        // --- Input Validation ---
        if (!userIdea || userIdea.trim().length < 5) {
            return NextResponse.json(
                { error: "INVALID_PROMPT", message: "Please provide a more descriptive idea (at least 5 characters)." },
                { status: 400 }
            );
        }

        if (!stack) {
            return NextResponse.json(
                { error: "Missing stack in request body" },
                { status: 400 }
            );
        }

        let isUnlimited = false;
        let dbDown = false;

        // --- Tiered Usage Limit Logic (Resilient) ---
        const LIMIT = 5;

        try {
            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('usage_count, is_pro, last_reset, plan_type')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                const currentCount = profile?.usage_count || 0;
                isUnlimited = !!(profile?.is_pro || profile?.plan_type === 'pro' || profile?.plan_type === 'lifetime');

                const lastReset = profile?.last_reset ? new Date(profile.last_reset) : new Date(0);
                const now = new Date();
                const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

                let newUsageCount = currentCount + 1;
                let updatePayload: Record<string, unknown> = { usage_count: newUsageCount };

                if (daysSinceReset >= 30 && !isUnlimited) {
                    newUsageCount = 1;
                    updatePayload = {
                        usage_count: 1,
                        last_reset: now.toISOString()
                    };
                }

                if (profile && !isUnlimited && (daysSinceReset >= 30 ? 0 : currentCount) >= LIMIT) {
                    return NextResponse.json(
                        { error: "LIMIT_REACHED", message: "Monthly free limit reached (5 prompts). Upgrade to Pro for unlimited access!" },
                        { status: 403 }
                    );
                }

                await supabase
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', user.id);
            } else {
                const { data: guestUsage, error: guestError } = await supabase
                    .from('guest_usage')
                    .select('usage_count, last_used')
                    .eq('ip_hash', ip)
                    .single();

                if (guestError && guestError.code !== 'PGRST116') throw guestError;

                let currentCount = guestUsage?.usage_count || 0;
                const lastUsed = guestUsage?.last_used ? new Date(guestUsage.last_used) : new Date(0);
                const now = new Date();
                const daysSinceUsed = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceUsed >= 30) {
                    currentCount = 0;
                }

                if (currentCount >= LIMIT) {
                    return NextResponse.json(
                        { error: "LIMIT_REACHED", message: "Guest monthly limit reached (5 prompts). Sign in for 5 free monthly prompts!" },
                        { status: 403 }
                    );
                }

                await supabase
                    .from('guest_usage')
                    .upsert({
                        ip_hash: ip,
                        usage_count: currentCount + 1,
                        last_used: now.toISOString()
                    }, { onConflict: 'ip_hash' });
            }
        } catch (dbError: unknown) {
            console.error("Supabase Resilience Activation:", dbError);
            dbDown = true; // Proceed in degraded mode
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const systemPrompt = buildSystemPrompt(userIdea, stack);

        try {
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Save to prompts table only if user is Pro/Lifetime and DB is up
            if (user && isUnlimited && !dbDown) {
                try {
                    await supabase
                        .from('prompts')
                        .insert({
                            user_id: user.id,
                            title: userIdea,
                            content: text,
                            stack: stack
                        });
                } catch (saveError) {
                    console.error("Failed to save prompt to DB (Silent Failure):", saveError);
                }
            }

            return NextResponse.json({
                result: text,
                isDegraded: dbDown
            });
        } catch (aiError: unknown) {
            console.error("Gemini API Error:", aiError);

            const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
            if (errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("429")) {
                return NextResponse.json(
                    { error: "AI_BUSY", message: "AI engines are currently busy. Please retry in a few seconds." },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: "GEN_FAILED", message: errorMessage || "Failed to generate content. Please try again." },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error("Critical Generation Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unexpected error occurred during generation." },
            { status: 500 }
        );
    }
}
