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

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not defined");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const eventId = event.id; // Unique ID for this webhook event from Razorpay

        const supabase = createClient();

        // 1. Idempotency Check: See if we've already processed this event
        const { data: existingEvent } = await supabase
            .from('razorpay_webhook_events')
            .select('status')
            .eq('event_id', eventId)
            .single();

        if (existingEvent && existingEvent.status === 'processed') {
            return NextResponse.json({ status: "ok", message: "Duplicate event skipped" });
        }

        // 2. Initial Logging: Record the event as processing
        if (!existingEvent) {
            await supabase.from('razorpay_webhook_events').insert({
                event_id: eventId,
                type: event.event,
                payload: event,
                status: 'processing'
            });
        }

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

        // 2. Subscription Updated (e.g., cancelled at period end)
        if (event.event === "subscription.updated") {
            const subscription = event.payload.subscription.entity;
            const userId = subscription.notes?.userId;

            if (userId) {
                await supabase
                    .from('profiles')
                    .update({
                        cancel_at_period_end: !!subscription.cancel_at_period_end,
                    })
                    .eq('id', userId);
            }
        }

        // 3. Subscription Cancelled/Halted
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

        // 3. Final Logging: Mark as processed
        await supabase
            .from('razorpay_webhook_events')
            .update({ status: 'processed' })
            .eq('event_id', eventId);

        return NextResponse.json({ status: "ok" });
    } catch (error: unknown) {
        console.error("Razorpay Webhook Error:", error);

        const supabase = createClient();
        // Try to log the failure in the database using the eventId we attempted to extract
        try {
            const bodyText = await req.clone().text().catch(() => ""); // Fallback if clone fails
            const event = bodyText ? JSON.parse(bodyText) : null;
            const errEventId = event?.id;

            if (errEventId) {
                await supabase
                    .from('razorpay_webhook_events')
                    .upsert({
                        event_id: errEventId,
                        status: 'failed',
                        error_message: error instanceof Error ? error.message : "Internal error"
                    }, { onConflict: 'event_id' });
            }
        } catch (logError) {
            console.error("Failed to log webhook error into DB:", logError);
        }

        return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
    }
}
