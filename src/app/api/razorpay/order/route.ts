import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { pricingTiers } from "@/lib/pricing-data";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: "planId is required" }, { status: 400 });
        }

        const plan = pricingTiers.find(tier => tier.id === planId);
        if (!plan) {
            return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('razorpay_customer_id')
            .eq('id', user.id)
            .single();

        let customerId = profile?.razorpay_customer_id;

        // 1. Ensure Razorpay Customer exists
        if (!customerId) {
            try {
                const customer = await razorpay.customers.create({
                    name: user.email?.split('@')[0] || "User",
                    email: user.email,
                    notes: { userId: user.id }
                });
                customerId = customer.id;

                await supabase
                    .from('profiles')
                    .update({ razorpay_customer_id: customerId })
                    .eq('id', user.id);
            } catch (err) {
                console.error("Failed to create Razorpay customer:", err);
                // Continue without customerId if it fails, though not ideal
            }
        }

        // ── Subscription Flow (Pro) ─────────────────────────────────────────────
        if (planId === "pro_monthly") {
            if (!plan.razorpay_plan_id) {
                return NextResponse.json({
                    error: "Pro Plan ID not configured in .env.local (NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID)"
                }, { status: 500 });
            }

            const subscriptionOptions = {
                plan_id: plan.razorpay_plan_id,
                total_count: 120, // 10 years
                quantity: 1,
                customer_id: customerId, // Link to customer for better Autopay
                customer_notify: 1 as const,
                notes: {
                    userId: user.id,
                    planId: planId,
                },
            };

            try {
                const subscription = await razorpay.subscriptions.create(subscriptionOptions) as { id: string };
                return NextResponse.json({
                    id: subscription.id,
                    type: "subscription",
                    amount: plan.priceNumeric * 100,
                    currency: "INR"
                });
            } catch (subError: any) {
                console.error("Razorpay Subscription Error:", subError);

                // If it's a customer id error, try creating without customer_id
                if (customerId && subError.error?.description?.includes("id") && subError.error?.description?.includes("exist")) {
                    console.warn(`Customer ID ${customerId} seems invalid, retrying without it.`);
                    const fallbackOptions = { ...subscriptionOptions, customer_id: undefined };
                    const subscription = await razorpay.subscriptions.create(fallbackOptions) as { id: string };

                    // Clear the invalid customer ID from profile
                    await supabase.from('profiles').update({ razorpay_customer_id: null }).eq('id', user.id);

                    return NextResponse.json({
                        id: subscription.id,
                        type: "subscription",
                        amount: plan.priceNumeric * 100,
                        currency: "INR"
                    });
                }
                throw subError;
            }
        }

        // ── One-time Order Flow (Lifetime/Other) ──────────────────────────────────
        const options = {
            amount: plan.priceNumeric * 100,
            currency: "INR",
            receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
            notes: {
                userId: user.id,
                planId: planId,
            },
        };

        try {
            const order = await razorpay.orders.create(options);
            return NextResponse.json({
                ...order,
                type: "order"
            });
        } catch (orderError: any) {
            console.error("Razorpay Order Creation Error:", orderError);
            throw orderError;
        }
    } catch (error: any) {
        console.error("Top-level Razorpay Order Error Detail:", {
            message: error.message,
            description: error.error?.description,
            code: error.error?.code,
            metadata: error.error?.metadata
        });
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Order creation failed",
            detail: error.error?.description
        }, { status: 500 });
    }
}
