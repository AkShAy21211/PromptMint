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

// ─── Goal Mode / Target Model (NEW, optional) ───────────────────────────────
export type GoalMode =
  | "Scaffold"
  | "Production-ready"
  | "Refactor existing code";

export type TargetModel =
  | "Claude"
  | "GPT"
  | "Perplexity"
  | "Grok";

// ─── Opinionated Defaults (optional) ────────────────────────────────────────
export interface OpinionatedDefaults {
  featureFolders?: boolean;
  useZod?: boolean;
  preferRSC?: boolean;
  includeTests?: boolean;
}

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

export interface GenerationOptions {
  goalMode?: GoalMode;
  targetModel?: TargetModel;
  engineeringDefaults?: string[];
}

export interface HistoryEntry {
  id?: string;
  idea: string;
  result: string;
  stack?: Record<string, string>;
  timestamp: number;
  tags?: string[];
}

export interface PromptRecipe {
  id?: string;
  name: string;
  idea_hint: string;
  stack: Stack;
  goal_mode?: GoalMode;
  target_model?: TargetModel;
  engineering_defaults?: string[];
}