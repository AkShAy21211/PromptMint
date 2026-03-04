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
  title: "PromptMint — AI Prompt Generator for Developers",
  description: "Turn your messy UI idea into a structured CO-STAR prompt for Cursor, Claude, or Copilot.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "PromptMint — AI Prompt Generator for Developers",
    description: "Turn your messy UI idea into a structured CO-STAR prompt for Cursor, Claude, or Copilot.",
    url: "https://promptmint.dev",
    siteName: "PromptMint",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptMint — AI Prompt Generator for Developers",
    description: "Turn your messy UI idea into a structured CO-STAR prompt for Cursor, Claude, or Copilot.",
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PHProvider } from "@/components/providers/PostHogProvider";

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
          <PHProvider>
            {children}
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
