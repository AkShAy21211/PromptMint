import { Stack, GenerationOptions, TargetModel } from "./types";
import { detectConflicts } from "./detectConflicts";

/**
 * Determines the project context based on stack selections.
 * Used to tailor the CO-STAR prompt structure accordingly.
 */
function resolveProjectContext(stack: Stack): "frontend" | "backend" | "fullstack" | "nextjs-fullstack" {
  const BACKEND_FRAMEWORKS = [
    "Express", "NestJS", "FastAPI", "Django", "Flask",
    "Spring Boot", "Laravel", "Ruby on Rails", "Phoenix (Elixir)", "AdonisJS",
  ];
  const FRONTEND_FRAMEWORKS = [
    "React", "Vue", "Vue 3 (Composition)", "Svelte", "Gatsby", "Solid.js", "Qwik",
    "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Expo",
    "Electron", "Tauri",
  ];
  const FULLSTACK_FRAMEWORKS = [
    "Next.js", "Remix", "Nuxt", "SvelteKit", "Astro", "RedwoodJS", "Blitz.js",
  ];

  const involvesFullstack = stack.framework && FULLSTACK_FRAMEWORKS.includes(stack.framework);
  const isNext = stack.framework === "Next.js";

  const hasBackend =
    involvesFullstack ||
    (stack.framework && BACKEND_FRAMEWORKS.includes(stack.framework)) ||
    (stack.database && stack.database !== "None") ||
    (stack.apiPattern && stack.apiPattern !== "None");

  const hasFrontend =
    involvesFullstack ||
    (stack.framework && FRONTEND_FRAMEWORKS.includes(stack.framework)) ||
    (stack.styling && stack.styling !== "None");

  if (isNext) return "nextjs-fullstack";
  if (hasBackend && hasFrontend) return "fullstack";
  if (hasBackend) return "backend";
  return "frontend";
}

/**
 * Builds the tech stack enforcement block conditionally.
 * Backend-only contexts skip styling and animation — injecting them
 * would confuse the AI and produce nonsensical output.
 */
function buildStackEnforcement(stack: Stack, context: "frontend" | "backend" | "fullstack" | "nextjs-fullstack"): string {
  const lines: string[] = [];

  // Framework — always included if set
  if (stack.framework && stack.framework !== "None") {
    lines.push(`   - **Framework / Runtime**: ${stack.framework}`);
  }

  // Database / ORM — always included if set
  if (stack.database && stack.database !== "None") {
    lines.push(`   - **Database / ORM**: ${stack.database}`);
  }

  // API Pattern — always included if set
  if (stack.apiPattern && stack.apiPattern !== "None") {
    lines.push(`   - **API Pattern**: ${stack.apiPattern}`);
  }

  // Deployment — always included if set
  if (stack.deployment && stack.deployment !== "None") {
    lines.push(`   - **Deployment / Hosting**: ${stack.deployment}`);
  }

  // Authentication — always included if set
  if (stack.auth && stack.auth !== "None") {
    lines.push(`   - **Authentication**: ${stack.auth}`);
  }

  // State Management — always included if set
  if (stack.stateManagement && stack.stateManagement !== "None") {
    lines.push(`   - **State Management**: ${stack.stateManagement}`);
  }

  // Language — always included
  lines.push(`   - **Language**: ${stack.language}`);

  // Styling and Animation — omitted for pure backend contexts
  if (context !== "backend") {
    lines.push(`   - **Styling**: ${stack.styling}`);
    if (stack.animation && stack.animation !== "None") {
      lines.push(`   - **Animation**: ${stack.animation}`);
    }
  }

  return lines.join("\n");
}

/**
 * Returns context-aware instructions for the RESPONSE section of CO-STAR.
 * A full-stack prompt needs both server and client implementation details.
 * A backend prompt focuses on API design, schema, and server logic.
 * A frontend prompt focuses on component structure, styling, and interaction.
 */
function buildResponseGuidance(stack: Stack, context: "frontend" | "backend" | "fullstack" | "nextjs-fullstack"): string {
  if (context === "backend") {
    return `Technical implementation details covering:
- API route structure and HTTP method conventions
- Database schema design and migration steps
- Middleware, validation, and error handling patterns
- Environment configuration and setup instructions`;
  }

  if (context === "nextjs-fullstack") {
    return `Technical implementation details following modern Next.js (App Router) patterns:
- **Server-Side Data Fetching**: Extensive use of **Async Server Components** for direct database/API access.
- **Server Actions**: Implementation of **app/actions.ts** for all form submissions and data mutations.
- **Route Handlers**: Use of **app/api/.../route.ts** specifically for third-party webhooks or external REST access.
- **Strategy**: Explicit guidance on when to prefer **Server Actions** over **Route Handlers** (mutations vs. external access).
- **Frontend / Client**: Component hydration strategy (Server vs Client Components), UI state, and error boundaries.`;
  }

  if (context === "fullstack") {
    return `Technical implementation details covering both layers:
- **Backend / Server**: API routes, database schema, auth/middleware, error handling
- **Frontend / Client**: Component structure, data fetching, UI state management
- Monorepo or project structure recommendation
- Environment setup and running instructions for both services`;
  }

  // frontend (default)
  return `Technical implementation details covering:
- Component structure and file organisation
- Styling approach and responsive behaviour
- Interaction and animation patterns
- Accessibility considerations`;
}

function buildTargetModelHint(targetModel: TargetModel): string {
  if (targetModel === "Claude") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Claude, an expert software engineer. Focus on clear sectioning, concise but complete bullet points, and explicit constraints so you can generate well-structured, type-safe code."`;
  }
  if (targetModel === "GPT") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are ChatGPT (GPT-4), an expert software engineer. Focus on precise instructions, explicit file structures, and clear expectations about frameworks, libraries, and error handling."`;
  }
  if (targetModel === "Perplexity") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Perplexity, an expert software engineer. Focus on crisp, actionable steps. Avoid unnecessary narrative so that you focus entirely on implementation details."`;
  }
  if (targetModel === "Grok") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Grok, an expert software engineer. Keep your instructions direct and opinionated about the tech stack and coding style so the generated code is highly consistent."`;
  }
  if (targetModel === "Gemini") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Gemini, an expert software engineer. Focus on a broad understanding of the codebase, creative problem-solving, and providing idiomatic code examples for my tech stack."`;
  }
  if (targetModel === "Llama") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Llama 3, an expert software engineer. Focus on efficiency, logical flow, and clean, readable code. Ensure your instructions are comprehensive and follow industry standard patterns."`;
  }
  if (targetModel === "DeepSeek") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are DeepSeek Coder, an expert software engineer. Focus on high-level reasoning, complex logic implementation, and providing extremely accurate, type-safe code snippets."`;
  }
  if (targetModel === "CodeLlama") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are CodeLlama, an expert software engineer specialized in code generation. Focus on syntax accuracy, specialized library usage, and optimized algorithm implementation."`;
  }
  if (targetModel === "Cursor") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Cursor AI, an intelligent coding partner. Focus on context-aware code completions, multi-file architectural changes, and providing instructions compatible with Cursor's composer/agent features."`;
  }
  if (targetModel === "Copilot") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are GitHub Copilot, an expert AI pair programmer. Focus on succinct code completions, following established local patterns, and providing comments that help guide your next suggestion."`;
  }
  return "";
}

/**
 * Builds a system prompt for the AI to transform a user idea into a CO-STAR structured prompt.
 *
 * @param userIdea - The initial prompt or idea provided by the user.
 * @param stack - The selected technology stack constraints.
 * @returns A formatted system prompt string.
 */
export function buildSystemPrompt(
  userIdea: string,
  stack: Stack,
  options?: GenerationOptions,
): string {
  const context = resolveProjectContext(stack);
  const stackEnforcement = buildStackEnforcement(stack, context);
  const responseGuidance = buildResponseGuidance(stack, context);
  const goalMode = options?.goalMode;
  const targetModel = options?.targetModel;

  const contextLabel =
    context === "backend"
      ? "server-side / backend"
      : context === "fullstack" || context === "nextjs-fullstack"
        ? "full-stack"
        : "frontend / UI";

  let goalLine = "Choose a sensible balance between scaffolding and implementation detail based on the complexity of the idea.";
  if (goalMode === "Scaffold") {
    goalLine = `The user has selected the goal mode **"Scaffold"**. 
CRITICAL: You must instruct the AI to heavily favor empty boilerplate, scaffolding, and file structures. Instruct it to leave the actual business logic out, substituting it with "TODO" comments. Do not ask for production-hardening.`;
  } else if (goalMode === "Production-ready") {
    goalLine = `The user has selected the goal mode **"Production-ready"**. 
CRITICAL: You must instruct the AI to generate comprehensive, production-ready code. This includes full error handling, strict typing, edge cases, and testing strategies. No shortcuts.`;
  } else if (goalMode === "Refactor existing code") {
    goalLine = `The user has selected the goal mode **"Refactor existing code"**.
CRITICAL: You must instruct the AI to focus on improving code quality, readability, separation of concerns, and performance of existing code, rather than generating a new feature from scratch.`;
  } else if (goalMode === "Debug broken code") {
    goalLine = `The user has selected the goal mode **"Debug broken code"**.
CRITICAL: You must instruct the AI to identify bugs, logical errors, and edge cases in the provided code. The generated prompt should focus on root-cause analysis, fixing the issues, and adding regression tests.`;
  } else if (goalMode === "Performance optimization") {
    goalLine = `The user has selected the goal mode **"Performance optimization"**.
CRITICAL: You must instruct the AI to analyze code for bottlenecks, memory leaks, and inefficient algorithms. The prompt should focus on latency reduction, optimized data structures, and efficient resource usage.`;
  } else if (goalMode === "Accessibility (a11y)") {
    goalLine = `The user has selected the goal mode **"Accessibility (a11y)"**.
CRITICAL: You must instruct the AI to prioritize WCAG compliance. The prompt should focus on semantic HTML, ARIA attributes, keyboard navigation, and screen reader compatibility.`;
  } else if (goalMode === "SEO optimized") {
    goalLine = `The user has selected the goal mode **"SEO optimized"**.
CRITICAL: You must instruct the AI to focus on search engine visibility. The prompt should cover semantic markup, meta tags, structured data (JSON-LD), sitemaps, and SSR/Prerendering strategies.`;
  } else if (goalMode === "Micro-optimizations") {
    goalLine = `The user has selected the goal mode **"Micro-optimizations"**.
CRITICAL: You must instruct the AI to focus on small-scale performance improvements (e.g., thinning out heavy loops, memoizer patterns, optimizing string operations) where every cycle counts.`;
  } else if (goalMode === "Add authentication") {
    goalLine = `The user has selected the goal mode **"Add authentication"**.
CRITICAL: You must instruct the AI to focus on secure identity management. The prompt should cover login/signup flows, JWT/Session handling, OAuth providers, and middleware-level route protection.`;
  }

  const modelHint = targetModel
    ? buildTargetModelHint(targetModel)
    : "";

  let defaultsBlock = "";
  if (options?.engineeringDefaults && options.engineeringDefaults.length > 0) {
    const REACT_BASED_FRAMEWORKS = ["React", "Next.js", "Remix", "Gatsby", "Expo"];
    const isReactBased = stack.framework && REACT_BASED_FRAMEWORKS.includes(stack.framework);

    // Filter out React-specific defaults if not in a React-based stack
    const filteredDefaults = options.engineeringDefaults.map(d => {
      if (!isReactBased && d.includes("React Testing Library")) {
        return d.replace(" + React Testing Library", "").replace("React Testing Library", "Unit/Integration Tests");
      }
      return d;
    });

    const defaultLines = filteredDefaults.map(d => `- ${d}`).join("\n");
    defaultsBlock = `### Opinionated Engineering Defaults (MUST ENFORCE):
You MUST add a section in your generated prompt named "**Engineering Defaults**" that strictly enforces these rules:
${defaultLines}`;
  }

  const conflicts = detectConflicts(userIdea, stack);

  return `
You are an expert prompt engineer. Your goal is to transform the user's messy idea into a highly effective development prompt.

### Quality Guardrail:
1. If the user's input is **nonsense, a simple greeting, or completely unrelated to software development** (e.g., "ok good", "hi", "what is 2+2"), respond with EXACTLY this string:
   "ERROR: Please provide a development-related idea or feature description."
2. **Noise Suppression**: Silently correct obvious typos (e.g., "fabluze" -> "fabulous", "commponent" -> "component") while maintaining the user's technical intent.

### Core Framework (CO-STAR):
Use these principles for valid ideas, applying **Adaptive Verbosity**:
- **Context / Objective**: What is being built and why.
- **Style / Tone**: Technical, clean, and concise.
- **Audience**: An expert AI developer (like Cursor or Claude).
- **Response**: ${responseGuidance}

${modelHint}

### Goal / Depth Preference:
${goalLine}

### Project Context:
This is a **${contextLabel}** task. Structure your output accordingly.
${context === "backend" ? "Do NOT mention or enforce any styling frameworks, animation libraries, or UI component patterns — they are irrelevant to this context." : ""}
${context === "fullstack" || context === "nextjs-fullstack" ? "Address both the server and client layers with equal depth." : ""}

${defaultsBlock}

### Implementation Guidelines:
1. **Adaptive Length**:
   - For simple tasks (e.g., "a blue button"), provide a **concise, punchy, and direct** instruction set.
   - For complex tasks, use the full CO-STAR structure with all relevant sections.
2. **Literal Stack Enforcement Section**: You MUST add a section to your generated prompt titled "### STACK ENFORCEMENT" that lists the selected technologies below as absolute, non-negotiable constraints.
3. **Tech Stack Enforcement** — The following selection is **ABSOLUTE**. You must strictly use ONLY these technologies and **completely ignore** any conflicting technology choices mentioned in the "User's Idea" below:
${stackEnforcement}

${conflicts.length > 0
      ? `### CRITICAL OVERRIDE: CONFLICTS DETECTED
The user's idea mentions technologies that conflict with the selected stack above.
You MUST STRICTLY IGNORE the following terms and any patterns associated with them:
${conflicts.map(c => `- "${c.foundInText}" (Conflict with selected ${c.type}: ${c.selected})`).join("\n")}

You MUST add a final section to your generated prompt titled "**CRITICAL OVERRIDE**" that explicitly states:
- "The implementation MUST ignore ${conflicts.map(c => c.foundInText).join(", ")} as they conflict with the chosen ${stack.framework} stack."
- "Strict adherence to ${stack.framework}${stack.styling ? ` and ${stack.styling}` : ""} is non-negotiable."`
      : ""
    }

### Output Formatting Requirements:
1. **Structural Clarity**: Use exactly two newlines between sections.
2. **Section Headers**: Each section MUST start with its title in bold, e.g., "**Context**".
3. **Readability**: Within each section, use **bullet points** (using "- ") for lists of requirements, steps, or constraints. Avoid dense paragraphs.
4. **Emphasis**: Use **bolding** for critical technical terms, file names, or variable names.

### User's Idea (Functional Requirements Only):
"${userIdea}"

### Your Task:
Output ONLY the final structured prompt or the ERROR message. No preamble or meta-talk.
`.trim();
}