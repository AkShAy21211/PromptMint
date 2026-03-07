export type StylingType =
  | "Tailwind CSS"
  | "shadcn/ui"
  | "Chakra UI"
  | "Material UI"
  | "Ant Design"
  | "Mantine"
  | "Radix UI"
  | "Headless UI"
  | "CSS Modules"
  | "Styled Components"
  | "Emotion"
  | "Stitches"
  | "Vanilla Extract"
  | "NativeWind"
  | "SwiftUI"
  | "Jetpack Compose"
  | "Flutter Material"
  | "Bootstrap"
  | "Bulma"
  | "Pico CSS"
  | "CSS-in-JS"
  | "None";

// ─── Language ───────────────────────────────────────────────────────────────
export type LanguageType =
  | "TypeScript"
  | "JavaScript"
  | "Python"
  | "Go"
  | "Java"
  | "Kotlin"
  | "Swift"
  | "Dart"
  | "C#"
  | "Rust"
  | "PHP"
  | "Ruby"
  | "Elixir"
  | "Scala"
  | "Zig"
  | "Crystal"
  | "Nim";

// ─── Animation ──────────────────────────────────────────────────────────────
export type AnimationType =
  | "Framer Motion"
  | "React Spring"
  | "GSAP"
  | "Three.js"
  | "Lottie"
  | "Remotion"
  | "Reanimated"
  | "Motion One"
  | "Anime.js"
  | "Popmotion"
  | "CSS Keyframes"
  | "CSS Transitions"
  | "View Transitions API"
  | "Web Animations API"
  | "Spline"
  | "Rive"
  | "LottieFiles"
  | "None";

// ─── Framework / Runtime (NEW) ───────────────────────────────────────────────
export type FrameworkType =
  | "None"
  | "Next.js"
  | "React"
  | "Vue"
  | "Vue 3 (Composition)"
  | "Svelte"
  | "SvelteKit"
  | "Nuxt"
  | "Gatsby"
  | "Remix"
  | "Astro"
  | "Solid.js"
  | "Qwik"
  | "Express"
  | "NestJS"
  | "FastAPI"
  | "Django"
  | "Flask"
  | "Spring Boot"
  | "Laravel"
  | "Ruby on Rails"
  | "Phoenix (Elixir)"
  | "AdonisJS"
  | "React Native"
  | "Flutter"
  | "SwiftUI"
  | "Jetpack Compose"
  | "Expo"
  | "Electron"
  | "Tauri"
  | "RedwoodJS"
  | "Blitz.js";

// ─── Database / ORM (NEW) ───────────────────────────────────────────────────
export type DatabaseType =
  | "None"
  | "PostgreSQL"
  | "MySQL"
  | "MariaDB"
  | "MongoDB"
  | "SQLite"
  | "Redis"
  | "Supabase"
  | "PlanetScale"
  | "Neon"
  | "SurrealDB"
  | "Pinecone"
  | "Weaviate"
  | "Qdrant"
  | "Cassandra"
  | "DynamoDB"
  | "Firebase Firestore"
  | "Prisma"
  | "Drizzle"
  | "Convex";

// ─── API Pattern (NEW) ──────────────────────────────────────────────────────
export type ApiPatternType =
  | "None"
  | "REST"
  | "GraphQL"
  | "tRPC"
  | "gRPC"
  | "WebSockets"
  | "Server Actions"
  | "Server Components"
  | "Falcor"
  | "OData"
  | "SOAP"
  | "Pub/Sub"
  | "Kafka Streams";

// ─── Deployment (NEW) ────────────────────────────────────────────────────────
export type DeploymentType =
  | "None"
  | "Vercel"
  | "Netlify"
  | "AWS"
  | "Docker"
  | "Supabase"
  | "Railway"
  | "Fly.io"
  | "Render"
  | "Heroku"
  | "Google Cloud Run"
  | "DigitalOcean App Platform"
  | "Azure Static Web Apps"
  | "Cloudflare Pages"
  | "Deno Deploy"
  | "Northflank";

// ─── Authentication (NEW) ────────────────────────────────────────────────────
export type AuthType =
  | "None"
  | "Clerk"
  | "Auth.js (NextAuth)"
  | "Supabase Auth"
  | "Firebase Auth"
  | "Custom JWT"
  | "Auth0"
  | "AWS Cognito"
  | "Lucia"
  | "Keycloak"
  | "Okta"
  | "Passport.js"
  | "SuperTokens"
  | "Zitadel"
  | "Authentik";

// ─── State Management (NEW) ──────────────────────────────────────────────────
export type StateManagementType =
  | "None"
  | "Zustand"
  | "TanStack Query"
  | "Context API"
  | "Redux Toolkit"
  | "Jotai"
  | "MobX"
  | "Valtio"
  | "Recoil"
  | "React Query (v5)"
  | "SWR"
  | "XState"
  | "Rematch";

// ─── Goal Mode / Target Model (NEW, optional) ───────────────────────────────
export type GoalMode =
  | "Scaffold"
  | "Production-ready"
  | "Refactor existing code"
  | "Debug broken code"
  | "Performance optimization"
  | "Accessibility (a11y)"
  | "SEO optimized"
  | "Micro-optimizations"
  | "Framework migration"
  | "Add authentication";

export type TargetModel =
  | "Claude"
  | "GPT"
  | "Perplexity"
  | "Grok"
  | "Gemini"
  | "Llama"
  | "DeepSeek"
  | "CodeLlama"
  | "Cursor"
  | "Copilot";


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
  deployment?: DeploymentType;
  auth?: AuthType;
  stateManagement?: StateManagementType;
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