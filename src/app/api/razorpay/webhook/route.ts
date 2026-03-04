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

        // Handle successful payment
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            // We need to fetch the order to get the notes (userId, planId)
            // Alternatively, we can use the notes directly from the payment if they were passed
            const userId = payment.notes.userId;
            const planId = payment.notes.planId;

            if (userId && planId) {
                const supabase = createClient();

                const isPro = planId === "pro_monthly" || planId === "lifetime";

                await supabase
                    .from('profiles')
                    .update({
                        plan_type: planId.includes("pro") ? "pro" : "lifetime",
                        is_pro: isPro,
                        razorpay_customer_id: payment.customer_id || null,
                    })
                    .eq('id', userId);

                console.log(`Updated user ${userId} to plan ${planId}`);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: unknown) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
    }
}
