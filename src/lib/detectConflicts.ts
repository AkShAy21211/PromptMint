import { Stack } from "./types";

/**
 * Maps technology names to common keywords associated with them.
 * Used to detect conflicts between the selected stack and the user's idea text.
 */
const CONFLICT_MAP: Record<string, string[]> = {
    "React": ["vue", "svelte", "angular", "nuxt", "solidjs", "qwik"],
    "Next.js": ["vue", "svelte", "angular", "nuxt", "solidjs", "qwik", "remix", "astro"],
    "Vue": ["react", "jsx", "tsx", "svelte", "angular", "nextjs", "next.js"],
    "Svelte": ["react", "jsx", "tsx", "vue", "angular", "nextjs"],
    "PostgreSQL": ["mongodb", "nosql", "firebase", "firestore", "dynamodb"],
    "MongoDB": ["postgres", "postgresql", "sql", "mysql", "mariadb", "sqlite"],
    "FastAPI": ["express", "nestjs", "django", "laravel", "rails", "spring boot", "server components", "server-components", "jsx", "tsx"],
    "Express": ["fastapi", "nestjs", "django", "laravel", "rails", "spring boot", "python", "server components", "server-components", "jsx", "tsx"],
    "Tailwind CSS": ["bootstrap", "bulma", "foundation", "material ui", "mui", "chakra ui", "ant design"],
    "Bootstrap": ["tailwind", "windicss", "chakra ui", "mui"],
    "Framer Motion": ["gsap", "animejs", "lottie", "velocity.js"],
    "GSAP": ["framer motion", "animejs", "lottie"],
    "AdonisJS": ["server components", "server-components", "jsx", "tsx", "nextjs", "spring boot"],
};

export interface Conflict {
    type: "framework" | "database" | "api" | "styling";
    selected: string;
    foundInText: string;
}

/**
 * Scans the user's idea for keywords that conflict with the selected stack.
 */
export function detectConflicts(userIdea: string, stack: Stack): Conflict[] {
    const conflicts: Conflict[] = [];
    const text = userIdea.toLowerCase();

    // 1. Check Framework
    if (stack.framework && CONFLICT_MAP[stack.framework]) {
        const forbidden = CONFLICT_MAP[stack.framework];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "framework",
                    selected: stack.framework,
                    foundInText: word,
                });
                break; // One conflict per type is enough for UX
            }
        }
    }

    // 2. Check Database
    if (stack.database && CONFLICT_MAP[stack.database]) {
        const forbidden = CONFLICT_MAP[stack.database];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "database",
                    selected: stack.database,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 3. Check API Pattern
    if (stack.apiPattern && CONFLICT_MAP[stack.apiPattern]) {
        const forbidden = CONFLICT_MAP[stack.apiPattern];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "api",
                    selected: stack.apiPattern,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 4. Check Styling
    if (stack.styling && CONFLICT_MAP[stack.styling]) {
        const forbidden = CONFLICT_MAP[stack.styling];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "styling",
                    selected: stack.styling,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 5. Check Animation
    if (stack.animation && CONFLICT_MAP[stack.animation]) {
        const forbidden = CONFLICT_MAP[stack.animation];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "styling", // Grouping with styling for simplicity in types if needed, or keep as is
                    selected: stack.animation,
                    foundInText: word,
                });
                break;
            }
        }
    }

    return conflicts;
}
