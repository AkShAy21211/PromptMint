-- Migration to add razorpay_webhook_events for idempotency and auditing
CREATE TABLE IF NOT EXISTS public.razorpay_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL, -- Razorpay's internal event ID
    type TEXT NOT NULL, -- e.g., payment.captured, subscription.charged
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing', -- processing, processed, failed, duplicate
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Service role only typically, but we'll enable and add no policies to keep it private)
ALTER TABLE public.razorpay_webhook_events ENABLE ROW LEVEL SECURITY;

-- Index for fast idempotency checks
CREATE INDEX IF NOT EXISTS idx_razorpay_event_id ON public.razorpay_webhook_events(event_id);
