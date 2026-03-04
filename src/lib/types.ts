export type StylingType = "Tailwind CSS" | "shadcn/ui" | "CSS Modules" | "NativeWind" | "SwiftUI" | "Jetpack Compose" | "Material UI" | "Chakra UI" | "Bootstrap" | "None";
export type LanguageType = "TypeScript" | "JavaScript" | "Swift" | "Kotlin" | "Java" | "C# (Unity)" | "Go" | "Python" | "Rust";
export type AnimationType = "Framer Motion" | "Reanimated" | "GSAP" | "Lottie" | "CSS Keyframes" | "None";
export type BackendType = "Next.js API Routes" | "Express.js" | "FastAPI" | "Django" | "NestJS" | "Hono" | "Flask" | "Spring Boot" | "None";
export type DatabaseType = "PostgreSQL" | "MongoDB" | "MySQL" | "Supabase" | "Firebase" | "Prisma" | "Drizzle" | "Redis" | "None";

export type PlanType = "free" | "pro" | "lifetime";

export interface Stack {
    styling: StylingType;
    language: LanguageType;
    animation: AnimationType;
    backend: BackendType;
    database: DatabaseType;
}
