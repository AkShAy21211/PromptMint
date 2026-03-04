import { Stack } from "./types";

/**
 * Frameworks that are purely server-side.
 * When one of these is selected, styling and animation enforcement
 * is omitted from the prompt — they have no relevance to a backend context.
 */
const BACKEND_ONLY_FRAMEWORKS = [
  "Express",
  "NestJS",
  "FastAPI",
  "Django",
  "Spring Boot",
  "Laravel",
];

/**
 * Determines the project context based on stack selections.
 * Used to tailor the CO-STAR prompt structure accordingly.
 */
function resolveProjectContext(stack: Stack): "frontend" | "backend" | "fullstack" {
  const hasBackendFramework =
    stack.framework && BACKEND_ONLY_FRAMEWORKS.includes(stack.framework);
  const hasFrontendFramework =
    stack.framework && !BACKEND_ONLY_FRAMEWORKS.includes(stack.framework) && stack.framework !== "None";
  const hasDatabase = stack.database && stack.database !== "None";
  const hasApiPattern = stack.apiPattern && stack.apiPattern !== "None";

  if (hasBackendFramework && !hasFrontendFramework) return "backend";
  if ((hasDatabase || hasApiPattern) && hasFrontendFramework) return "fullstack";
  return "frontend";
}

/**
 * Builds the tech stack enforcement block conditionally.
 * Backend-only contexts skip styling and animation — injecting them
 * would confuse the AI and produce nonsensical output.
 */
function buildStackEnforcement(stack: Stack, context: "frontend" | "backend" | "fullstack"): string {
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
function buildResponseGuidance(context: "frontend" | "backend" | "fullstack"): string {
  if (context === "backend") {
    return `Technical implementation details covering:
- API route structure and HTTP method conventions
- Database schema design and migration steps
- Middleware, validation, and error handling patterns
- Environment configuration and setup instructions`;
  }

  if (context === "fullstack") {
    return `Technical implementation details covering both layers:
- **Backend**: API routes, database schema, auth/middleware, error handling
- **Frontend**: Component structure, data fetching, UI state management
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

/**
 * Builds a system prompt for the AI to transform a user idea into a CO-STAR structured prompt.
 *
 * @param userIdea - The initial prompt or idea provided by the user.
 * @param stack - The selected technology stack constraints.
 * @returns A formatted system prompt string.
 */
export function buildSystemPrompt(userIdea: string, stack: Stack): string {
  const context = resolveProjectContext(stack);
  const stackEnforcement = buildStackEnforcement(stack, context);
  const responseGuidance = buildResponseGuidance(context);

  const contextLabel =
    context === "backend"
      ? "server-side / backend"
      : context === "fullstack"
      ? "full-stack"
      : "frontend / UI";

  return `
You are an expert prompt engineer. Your goal is to transform the user's messy idea into a highly effective development prompt.

### Quality Guardrail:
If the user's input is **nonsense, a simple greeting, or completely unrelated to software development** (e.g., "ok good", "hi", "what is 2+2"), respond with EXACTLY this string:
"ERROR: Please provide a development-related idea or feature description."

### Core Framework (CO-STAR):
Use these principles for valid ideas, applying **Adaptive Verbosity**:
- **Context / Objective**: What is being built and why.
- **Style / Tone**: Technical, clean, and concise.
- **Audience**: An expert AI developer (like Cursor or Claude).
- **Response**: ${responseGuidance}

### Project Context:
This is a **${contextLabel}** task. Structure your output accordingly.
${context === "backend" ? "Do NOT mention or enforce any styling frameworks, animation libraries, or UI component patterns — they are irrelevant to this context." : ""}
${context === "fullstack" ? "Address both the server and client layers with equal depth." : ""}

### Implementation Guidelines:
1. **Adaptive Length**:
   - For simple tasks (e.g., "a blue button"), provide a **concise, punchy, and direct** instruction set.
   - For complex tasks, use the full CO-STAR structure with all relevant sections.
2. **Tech Stack Enforcement** — the AI must strictly use ONLY the following:
${stackEnforcement}

### Output Formatting Requirements:
1. **Structural Clarity**: Use exactly two newlines between sections.
2. **Section Headers**: Each section MUST start with its title in bold, e.g., "**Context**".
3. **Readability**: Within each section, use **bullet points** (using "- ") for lists of requirements, steps, or constraints. Avoid dense paragraphs.
4. **Emphasis**: Use **bolding** for critical technical terms, file names, or variable names.

### User's Idea:
"${userIdea}"

### Your Task:
Output ONLY the final structured prompt or the ERROR message. No preamble or meta-talk.
`.trim();
}