import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature,
            planId
        } = await req.json();

        // 1. Verify Signature
        // ── Order Signature: razorpay_order_id + "|" + razorpay_payment_id
        // ── Subscription Signature: razorpay_payment_id + "|" + razorpay_subscription_id
        const body = razorpay_subscription_id
            ? `${razorpay_payment_id}|${razorpay_subscription_id}`
            : `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            console.error("Signature Mismatch:", {
                expected: expectedSignature,
                received: razorpay_signature,
                type: razorpay_subscription_id ? "subscription" : "order"
            });
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        // 2. Get User
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 3. Update Profile
        const isPro = planId === "pro_monthly" || planId === "lifetime";
        const { error } = await supabase
            .from('profiles')
            .update({
                plan_type: planId.includes("pro") ? "pro" : "lifetime",
                is_pro: isPro,
                razorpay_subscription_id: razorpay_subscription_id || null, // Store sub ID for future reference
            })
            .eq('id', user.id);

        if (error) throw error;

        return NextResponse.json({ status: "success", plan_type: planId });
    } catch (error: unknown) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 500 });
    }
}
