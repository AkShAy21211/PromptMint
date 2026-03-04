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

        const options = {
            amount: plan.priceNumeric * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
            notes: {
                userId: user.id,
                planId: planId,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error: unknown) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Order creation failed" }, { status: 500 });
    }
}
