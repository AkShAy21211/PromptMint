import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "No signature" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        const supabase = createClient();

        // ── Handle Order/Payment Events ────────────────────────────────────────
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const userId = payment.notes?.userId;
            const planId = payment.notes?.planId;

            if (userId && planId) {
                const isPro = planId === "pro_monthly" || planId === "lifetime";

                await supabase
                    .from('profiles')
                    .update({
                        plan_type: planId.includes("pro") ? "pro" : "lifetime",
                        is_pro: isPro,
                        razorpay_customer_id: payment.customer_id || null,
                    })
                    .eq('id', userId);
            }
        }

        // ── Handle Subscription Events ──────────────────────────────────────────

        // 1. Subscription Renewed/Charged
        if (event.event === "subscription.charged") {
            const subscription = event.payload.subscription.entity;
            const userId = subscription.notes?.userId;

            if (userId) {
                await supabase
                    .from('profiles')
                    .update({
                        is_pro: true,
                        plan_type: "pro",
                        razorpay_subscription_id: subscription.id,
                        cancel_at_period_end: false, // Reset flag on successful charge
                    })
                    .eq('id', userId);
            }
        }

        // 2. Subscription Cancelled/Halted
        if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
            const subscription = event.payload.subscription.entity;
            const userId = subscription.notes?.userId;

            if (userId) {
                await supabase
                    .from('profiles')
                    .update({
                        is_pro: false,
                        plan_type: "free",
                        cancel_at_period_end: false, // Reset flag when fully cancelled
                    })
                    .eq('id', userId);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: unknown) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
    }
}
