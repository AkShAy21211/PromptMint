import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { Stack, GoalMode, TargetModel } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { FREE_STACKS, ALL_STACKS } from "@/lib/constants";
import { createHash } from "crypto";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
        maxOutputTokens: 2000,
    }
});

const MAX_INPUT_CHARS = 2000;

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Extract IP for guest tracking
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
        const ip_hash = createHash("sha256").update(ip).digest("hex");

        const {
            userIdea,
            stack,
            goalMode,
            targetModel,
            engineeringDefaults,
        }: {
            userIdea: string;
            stack: Stack;
            goalMode?: GoalMode;
            targetModel?: TargetModel;
            engineeringDefaults?: string[];
        } = await req.json();

        // ── Input Validation ────────────────────────────────────────────────────

        if (!userIdea || userIdea.trim().length < 5) {
            return NextResponse.json(
                {
                    error: "INVALID_PROMPT",
                    message:
                        "Please provide a more descriptive idea (at least 5 characters).",
                },
                { status: 400 }
            );
        }

        if (userIdea.length > MAX_INPUT_CHARS) {
            return NextResponse.json(
                {
                    error: "PROMPT_TOO_LONG",
                    message: `Idea is too long. Please keep it under ${MAX_INPUT_CHARS} characters.`,
                },
                { status: 400 }
            );
        }

        if (!stack) {
            return NextResponse.json(
                { error: "Missing stack in request body" },
                { status: 400 }
            );
        }

        // Map ALL_STACKS (objects) to name strings for validation
        const VALID_FRAMEWORKS = ALL_STACKS.framework.map(o => o.name);
        const VALID_DATABASES = ALL_STACKS.database.map(o => o.name);
        const VALID_API_PATTERNS = ALL_STACKS.apiPattern.map(o => o.name);
        const VALID_LANGUAGES = ALL_STACKS.language.map(o => o.name);
        const VALID_STYLING = ALL_STACKS.styling.map(o => o.name);
        const VALID_ANIMATION = ALL_STACKS.animation.map(o => o.name);
        const VALID_DEPLOYMENT = ALL_STACKS.deployment.map(o => o.name);
        const VALID_AUTH = ALL_STACKS.auth.map(o => o.name);
        const VALID_STATE = ALL_STACKS.stateManagement.map(o => o.name);

        if (stack.framework && !VALID_FRAMEWORKS.includes(stack.framework)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid framework selection." },
                { status: 400 }
            );
        }
        if (stack.database && !VALID_DATABASES.includes(stack.database)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid database selection." },
                { status: 400 }
            );
        }
        if (stack.apiPattern && !VALID_API_PATTERNS.includes(stack.apiPattern)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid API pattern selection." },
                { status: 400 }
            );
        }
        if (stack.language && !VALID_LANGUAGES.includes(stack.language)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid language selection." },
                { status: 400 }
            );
        }
        if (stack.styling && !VALID_STYLING.includes(stack.styling)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid styling selection." },
                { status: 400 }
            );
        }
        if (stack.animation && !VALID_ANIMATION.includes(stack.animation)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid animation selection." },
                { status: 400 }
            );
        }
        if (stack.deployment && !VALID_DEPLOYMENT.includes(stack.deployment)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid deployment selection." },
                { status: 400 }
            );
        }
        if (stack.auth && !VALID_AUTH.includes(stack.auth)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid auth selection." },
                { status: 400 }
            );
        }
        if (stack.stateManagement && !VALID_STATE.includes(stack.stateManagement)) {
            return NextResponse.json(
                { error: "INVALID_STACK", message: "Invalid state management selection." },
                { status: 400 }
            );
        }

        // ── Usage Limit & Pro Validation ────────────────────────────────────────

        let isUnlimited = false;
        let dbDown = false;
        const LIMIT = 5;

        try {
            let profile = null;
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("usage_count, is_pro, last_reset, plan_type")
                    .eq("id", user.id)
                    .single();
                profile = data;
            }

            isUnlimited = !!(profile?.is_pro || profile?.plan_type === "pro");

            // Shared validation for Pro features (Free users & Guests)
            if (!isUnlimited) {
                const isInvalidFramework = stack.framework && !FREE_STACKS.framework.includes(stack.framework);
                const isInvalidDatabase = stack.database && !FREE_STACKS.database.includes(stack.database);
                const isInvalidApi = stack.apiPattern && !FREE_STACKS.apiPattern.includes(stack.apiPattern);
                const isInvalidLanguage = stack.language && !FREE_STACKS.language.includes(stack.language);
                const isInvalidStyling = stack.styling && !FREE_STACKS.styling.includes(stack.styling);
                const isInvalidAnimation = stack.animation && !FREE_STACKS.animation.includes(stack.animation);
                const isInvalidDeployment = stack.deployment && !FREE_STACKS.deployment.includes(stack.deployment);
                const isInvalidAuth = stack.auth && !FREE_STACKS.auth.includes(stack.auth);
                const isInvalidState = stack.stateManagement && !FREE_STACKS.stateManagement.includes(stack.stateManagement);

                if (isInvalidFramework || isInvalidDatabase || isInvalidApi || isInvalidLanguage || isInvalidStyling || isInvalidAnimation || isInvalidDeployment || isInvalidAuth || isInvalidState) {
                    return NextResponse.json(
                        { error: "PRO_REQUIRED", message: "One or more selected technologies require a Pro plan." },
                        { status: 403 }
                    );
                }
            }

            // Track usage
            if (user) {
                const currentCount = profile?.usage_count || 0;
                if (!isUnlimited && currentCount >= LIMIT) {
                    return NextResponse.json(
                        { error: "LIMIT_REACHED", message: "Monthly free limit reached. Upgrade for more!" },
                        { status: 403 }
                    );
                }
                await supabase.from("profiles").update({ usage_count: currentCount + 1 }).eq("id", user.id);
            } else {
                // Guest tracking using ip_hash
                const { data: guestUsage } = await supabase.from("guest_usage").select("usage_count").eq("ip_hash", ip_hash).single();
                const guestCount = guestUsage?.usage_count || 0;
                if (guestCount >= LIMIT) {
                    return NextResponse.json(
                        { error: "LIMIT_REACHED", message: "Guest limit reached. Sign in for more!" },
                        { status: 403 }
                    );
                }
                await supabase.from("guest_usage").upsert({ ip_hash: ip_hash, usage_count: guestCount + 1, last_used: new Date().toISOString() });
            }
        } catch (err) {
            console.error("DB Resilience Mode:", err);
            dbDown = true;
        }

        // ── Generate ────────────────────────────────────────────────────────────

        const systemPrompt = buildSystemPrompt(userIdea, stack, {
            goalMode,
            targetModel,
            engineeringDefaults,
        });

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        // ── Persistence ─────────────────────────────────────────────────────────
        let historySaved = false;
        if (user && isUnlimited && !dbDown) {
            try {
                const { error: saveError } = await supabase.from("prompts").insert({
                    user_id: user.id,
                    title: userIdea,
                    content: text,
                    stack: stack,
                });
                if (!saveError) historySaved = true;
            } catch (e) {
                console.error("Pro History Save Failed:", e);
            }
        }

        return NextResponse.json({
            result: text,
            isDegraded: dbDown,
            historySaved: (user && isUnlimited) ? historySaved : undefined
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        console.error("Critical Error:", error);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
