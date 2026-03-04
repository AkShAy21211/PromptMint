# PromptMint 🍃

**Turn 1 messy idea ➔ structured AI prompt**

PromptMint is an AI prompt engineering suite designed specifically for developers. It eliminates the friction of AI code generation by acting as an intelligent intermediary between your messy, initial ideas and the actual AI model (like Claude, GPT-4, or Gemini). 

Instead of arguing with an AI in a 30-minute iteration loop over Tailwind imports, responsive design, or framework preferences, PromptMint architects your raw idea into a highly structured **CO-STAR** mega-prompt. When you paste this generated prompt into an AI, you get production-ready, strictly-aligned code on the first try.

---

## 🎯 The "Why" & The "Who"

### Who is this for?
PromptMint is built for **Full-Stack Developers, Frontend Engineers, and Indie Hackers** who frequently use AI to generate boilerplate, UI components, or complex logic. 

### Why does this exist?
Because AI models are generic. If you ask an AI to "build a dark navbar," you will get generic CSS or an outdated React implementation. To get *good* code out of an AI, you have to write incredibly detailed, 20-line prompts specifying your exact stack, styling preferences, and architectural constraints. 

PromptMint automates that step. It takes a 5-second thought and instantly expands it into a comprehensive engineering prompt. 

**The ROI:** It turns a 25-minute frustrating AI argument into a 2-minute clean copy-paste workflow.

---

## 🏗️ Technical Infrastructure (The Stack)

PromptMint is built for speed, resilience, and scale. 

- **Frontend & Routing:** [Next.js 14](https://nextjs.org/) (App Router, React server components)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) + Shadcn/ui + Framer Motion (for animations and glassmorphism)
- **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Google Auth)
- **AI Core Engine:** [Google Gemini API](https://deepmind.google/technologies/gemini/) (Powers the abstraction and prompt generation)
- **Payments & Billing:** [Razorpay](https://razorpay.com/) (Secure India-focused payment gateway for Pro subscriptions)
- **Analytics:** [PostHog](https://posthog.com/) (Session recording, event tracking, user journeys)
- **Hosting:** [Vercel](https://vercel.com/) (Edge caching, serverless architecture)

---

## ✨ Features End-to-End

### 1. The Core Engine: CO-STAR Generation
Users define their current technology stack (e.g., Next.js, Tailwind, Framer Motion) and input a brief idea. The Gemini-powered backend restructures this input into a markdown-formatted payload that explicitly defines the **C**ontext, **O**bjective, **S**tyle, **T**one, **A**udience, and **R**esponse constraints, tailored for downstream AI consumption.

### 2. Intelligent Tiered Usage System
- **Guest Usage:** Unauthenticated guests get 5 free prompts tracked via `localStorage` and IP-rate limiting.
- **Authenticated Free Tier:** Logged-in users get a synced limit of 5 free monthly prompts tracked securely in the Supabase PostgreSQL database.
- **Pro Tier:** Users can upgrade via Razorpay for unlimited lifetime/monthly generations.

### 3. State Sync & Migration
Guest users who hit their limit and choose to sign up have their local generation history automatically migrated and merged into their new Supabase cloud profile.

### 4. Resilient PWA (Progressive Web App)
The application leverages service workers to offer baseline offline support. If a query fails due to network loss, the UI eloquently gracefully degrades, showing offline capabilities rather than crashing. 

### 5. Seamless Copy/Paste Workflow
The output is displayed in a beautiful, syntax-highlighted code block with a one-click copy button, allowing developers to immediately take the generated prompt and paste it directly into Claude or ChatGPT.

### 6. Analytics & Telemetry
Deep PostHog integration tracks conversion funnels, such as when users hit the "Limit Reached" modal, when they click upgrade, and what technology stacks are most commonly toggled.

### 7. Razorpay Integration + Webhooks
A highly secure billing implementation completely isolates client execution from subscription status. Razorpay webhooks asynchronously guarantee that the `profiles` table in Supabase is updated only upon successful payment capture.

---

## 🚀 Getting Started Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file based on `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   GEMINI_API_KEY=...
   NEXT_PUBLIC_RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   NEXT_PUBLIC_POSTHOG_KEY=...
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---
*Built for developers who value their time.*
