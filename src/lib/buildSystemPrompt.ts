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
  if (targetModel === "Windsurf") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Windsurf AI, a powerful agentic software engineer. Focus on multi-file architectural changes, deep project context, and provide instructions that leverage your ability to read and write across the entire codebase."`;
  }
  if (targetModel === "Trae") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Trae AI, an intelligent coding agent. Focus on autonomous implementation, following project-wide conventions, and providing concise, surgical code edits that solve complex requirements."`;
  }
  if (targetModel === "v0.dev") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are v0, Vercel's expert UI architect. Focus on single-file, production-ready React components using Tailwind CSS and Lucide React. Ensure the code is self-contained and visually stunning."`;
  }
  if (targetModel === "Bolt.new") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Bolt.new, a full-stack web architect. Focus on generating complete, run-ready projects that can be executed instantly in a WebContainer environment. Prioritize Vite-based setups."`;
  }
  if (targetModel === "Lovable") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Lovable (GPT Engineer), a full-stack product designer. Focus on high-fidelity UI design, functional state machines, and building product prototypes that feel like final applications."`;
  }
  if (targetModel === "Replit Agent") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are the Replit Agent, a cloud-native software engineer. Focus on end-to-end development from frontend to backend deployment within the Replit ecosystem."`;
  }
  if (targetModel === "Antigravity") {
    return `### Target AI Persona (STRICT):
You must begin your generated prompt with exactly:
"You are Antigravity, a powerful agentic AI coding assistant. Focus on high-velocity production engineering, deep architectural reasoning, and multi-step execution plans that maintain unbroken cognitive flow for the user."`;
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
  } else if (goalMode === "Agentic Flight Plan") {
    goalLine = `The user has selected the goal mode **"Agentic Flight Plan"**.
CRITICAL: You MUST break the implementation into a **Step-by-Step Multi-Phase Plan** dynamically tailored to the project goal:
- Each phase MUST start with \`[[PHASE X: Project-Specific Name]]\` and end with \`[[PHASE_END]]\`.
- Do NOT use a hardcoded list of phases. Instead, analyze the user's idea and define the phases logically (e.g., [[PHASE 1: MongoDB Schema]], [[PHASE 2: Auth Endpoints]], etc.).
- You can use as many phases as needed to maintain clarity, but keep them focused.
The UI will turn these markers into an interactive checklist. Ensure the content inside each phase is self-contained.`;
  }

  const modelHint = targetModel
    ? buildTargetModelHint(targetModel)
    : "";

  const codeContextBlock = options?.codeContext
    ? `### EXISTING CODE CONTEXT (CRITICAL):
The user has provided the following manifest or code snippet as context. You MUST respect the library versions, naming conventions, and project structure implied by this snippet:
\`\`\`
${options.codeContext}
\`\`\`
If there are version conflicts (e.g. they use Next 13 but the stack says Next.js), the **EXISTING CODE CONTEXT** takes precedence over general defaults.
`
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
    defaultsBlock = `### Architecture Guardrails (MUST ENFORCE):
You MUST add a section in your generated prompt named "**Architecture Guardrails**" that strictly enforces these rules:
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

${codeContextBlock}

### Project Context:
This is a **${contextLabel}** task. Structure your output accordingly.
${context === "backend" ? "Do NOT mention or enforce any styling frameworks, animation libraries, or UI component patterns — they are irrelevant to this context." : ""}
${context === "fullstack" || context === "nextjs-fullstack" ? "Address both the server and client layers with equal depth." : ""}

${defaultsBlock}

### Implementation Guidelines:
1. **Adaptive Length**:
   - For simple tasks (e.g., "a blue button"), provide a **concise, punchy, and direct** instruction set.
   - For complex tasks, use the full CO-STAR structure with all relevant sections.
2. **Literal Stack Enforcement Section**: You MUST add a section to your generated prompt titled "### STACK ENFORCEMENT" that **copies the exact list below verbatim**. Do NOT rephrase, substitute, or "upgrade" any technology name.
3. **Tech Stack Enforcement** — The following selection is **ABSOLUTE and FINAL**. You must strictly use ONLY these technologies. Do NOT substitute, rename, or swap any value (e.g., if it says "Railway" do NOT change it to "Render" or "Vercel"):
${stackEnforcement}

4. **ZERO HALLUCINATION RULE (CRITICAL)**:
   - You must **NEVER** add, suggest, recommend, or reference ANY library, framework, package, or technology that is NOT explicitly listed in the stack enforcement above.
   - If a category (e.g., Styling, Animation, State Management) is absent from the list, it means the user intentionally excluded it. Do NOT invent a replacement.
   - **Specific prohibitions**: Do NOT add validation libraries (Zod, Joi, Yup), HTTP clients (Axios, Got), testing frameworks, ORMs, or any other package UNLESS it appears in the stack list above.
   - The ONLY technologies that should appear in your generated prompt are those in the STACK ENFORCEMENT section. Every other tool should be described generically (e.g., "input validation" instead of "Zod validation").

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
2. **Step-by-Step Reasoning**: Before the CO-STAR sections, add a hidden section (or a section named "### LOGICAL ARCHITECTURE") where you briefly explain the engineering reasons for choosing certain patterns (e.g., why a certain hook or middleware is used).
3. **Section Headers**: Each section MUST start with its title in bold, e.g., "**Context**".
4. **Readability**: Within each section, use **bullet points** (using "- ") for lists of requirements, steps, or constraints. Avoid dense paragraphs.
5. **Emphasis**: Use **bolding** for critical technical terms, file names, or variable names.

### User's Idea (Functional Requirements Only):
"${userIdea}"

### Your Task:
Output ONLY the final structured prompt or the ERROR message. No preamble or meta-talk.
`.trim();
}