import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PromptMint | The Industrial-Grade AI Prompt Engineer",
  description: "Stop arguing with AI. Structure your ideas into production-ready prompts for Next.js, Python, and more using the CO-STAR framework.",
  keywords: ["prompt engineering", "AI prompt generator", "CO-STAR framework", "developer tools", "Claude prompts", "ChatGPT prompts"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon.ico", type: "image/x-icon" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "PromptMint — AI Prompt Generator for Developers",
    description:
      "Turn your messy UI idea into a structured CO-STAR prompt for Cursor, Claude, or Copilot.",
    url: "https://promptmint.dev",
    siteName: "PromptMint",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptMint — AI Prompt Generator for Developers",
    description:
      "Turn your messy UI idea into a structured CO-STAR prompt for Cursor, Claude, or Copilot.",
  },
  verification: {
    google: "psXBJWyp67CAH1mV1zKdKDT8C1w6kf-XZ3lOJnFQ-Kk",
    other: {
      "facebook-domain-verification": "tksvb2wsf5xrquoww8flb7qy4q83rk",
    },
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PHProvider } from "@/components/providers/PostHogProvider";
import { BugReportButton } from "@/components/BugReportButton";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >

          <BugReportButton />
          <Toaster />

          <PHProvider>
            <AuthProvider>{children}</AuthProvider>
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
