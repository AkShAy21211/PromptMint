declare global {
    interface Window {
        posthog?: {
            capture: (event: string, properties?: Record<string, unknown>) => void;
            reset?: () => void;
        };
        Razorpay?: new (opts: Record<string, unknown>) => {
            on: (event: string, cb: (r: { error: { description: string } }) => void) => void;
            open: () => void;
        };
    }
}

export {};
