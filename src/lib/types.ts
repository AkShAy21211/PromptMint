export type StylingType =
  | "Tailwind CSS"
  | "shadcn/ui"
  | "CSS Modules"
  | "NativeWind"
  | "SwiftUI"
  | "Jetpack Compose"
  | "Material UI"
  | "Chakra UI"
  | "Bootstrap"
  | "None";

// ─── Language ───────────────────────────────────────────────────────────────
export type LanguageType =
  | "TypeScript"
  | "JavaScript"
  | "Swift"
  | "Kotlin"
  | "Java"
  | "C# (Unity)"
  | "Go"
  | "Python";

// ─── Animation ──────────────────────────────────────────────────────────────
export type AnimationType =
  | "Framer Motion"
  | "Reanimated"
  | "GSAP"
  | "Lottie"
  | "CSS Keyframes"
  | "None";

// ─── Framework / Runtime (NEW) ───────────────────────────────────────────────
export type FrameworkType =
  | "None"
  | "Next.js"
  | "React"
  | "Vue"
  | "Express"
  | "NestJS"
  | "FastAPI"
  | "Django"
  | "Spring Boot"
  | "Laravel";

// ─── Database / ORM (NEW) ───────────────────────────────────────────────────
export type DatabaseType =
  | "None"
  | "PostgreSQL"
  | "MySQL"
  | "MongoDB"
  | "SQLite"
  | "Redis"
  | "Supabase"
  | "Prisma"
  | "Drizzle";

// ─── API Pattern (NEW) ──────────────────────────────────────────────────────
export type ApiPatternType =
  | "None"
  | "REST"
  | "GraphQL"
  | "tRPC"
  | "WebSockets"
  | "Server Actions";

// ─── Stack ──────────────────────────────────────────────────────────────────
export interface Stack {
  styling: StylingType;
  language: LanguageType;
  animation: AnimationType;
  // New optional fields — keep optional so existing saved prompts don't break
  framework?: FrameworkType;
  database?: DatabaseType;
  apiPattern?: ApiPatternType;
}