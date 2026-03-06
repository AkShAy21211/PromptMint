import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prompting Playbook | Master the CO-STAR Framework | PromptMint",
    description: "The ultimate guide to master AI prompting. Learn the CO-STAR framework, Claude 3.5 Sonnet vs GPT-4o nuances, and industrial-grade engineering defaults.",
    keywords: ["prompt engineering guide", "CO-STAR framework", "Claude 3.5 Sonnet prompting", "GPT-4o prompting", "AI code generation tips"],
};

export default function GuideLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
