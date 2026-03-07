import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('razorpay_subscription_id, plan_type')
            .eq('id', user.id)
            .single();

        if (!profile?.razorpay_subscription_id || profile.plan_type !== 'pro') {
            return NextResponse.json({ error: "No active Pro subscription found" }, { status: 400 });
        }

        // Cancel at the end of the current billing cycle (true = at cycle end)
        await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, true);

        // PERSISTENCE: Mark as pending cancellation immediately
        await supabase
            .from('profiles')
            .update({ cancel_at_period_end: true })
            .eq('id', user.id);

        return NextResponse.json({ status: "success", message: "Subscription will be cancelled at the end of the billing cycle." });
    } catch (error: unknown) {
        console.error("Subscription Cancellation Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Cancellation failed" }, { status: 500 });
    }
}
