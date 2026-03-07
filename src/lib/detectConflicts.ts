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
    // Deployment
    "Vercel": ["docker", "container", "aws", "amplify", "fly.io", "railway"],
    "Netlify": ["docker", "container", "aws", "amplify", "fly.io", "railway"],
    "AWS": ["vercel", "netlify", "fly.io", "railway", "render", "heroku"],
    "Docker": ["vercel", "netlify", "render"],
    "Render": ["vercel", "netlify", "aws", "docker", "heroku", "railway"],
    "Heroku": ["render", "vercel", "netlify", "aws", "railway"],
    "Cloudflare Pages": ["vercel", "netlify", "aws", "render"],
    // Auth
    "Clerk": ["nextauth", "authjs", "firebase auth", "firebase-auth", "custom jwt", "supabase auth", "auth0", "lucia", "keycloak"],
    "Auth.js (NextAuth)": ["clerk", "firebase auth", "firebase-auth", "supabase auth", "auth0", "lucia"],
    "Supabase Auth": ["clerk", "nextauth", "authjs", "firebase auth", "firebase-auth", "auth0", "lucia"],
    "Firebase Auth": ["clerk", "nextauth", "authjs", "supabase auth", "auth0", "lucia"],
    "Auth0": ["clerk", "nextauth", "authjs", "supabase auth", "firebase auth", "lucia", "keycloak", "okta"],
    "AWS Cognito": ["clerk", "auth0", "supabase auth", "firebase auth", "lucia"],
    "Lucia": ["clerk", "auth0", "nextauth", "authjs", "firebase auth", "supabase auth", "keycloak"],
    // State
    "Zustand": ["redux", "jotai", "recoil", "mobx", "valtio"],
    "Redux Toolkit": ["zustand", "jotai", "recoil", "mobx", "valtio"],
    "TanStack Query": ["swr", "rtk query", "apollo", "urql", "react query"],
    "MobX": ["zustand", "redux", "jotai", "recoil", "valtio", "xstate"],
    "Valtio": ["zustand", "redux", "mobx", "jotai", "recoil"],
    "SWR": ["tanstack query", "react query", "apollo", "urql"],
    "XState": ["redux", "mobx", "zustand"],
};

export interface Conflict {
    type: "framework" | "database" | "api" | "styling" | "deployment" | "auth" | "state";
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
                    type: "styling",
                    selected: stack.animation,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 6. Check Deployment
    if (stack.deployment && CONFLICT_MAP[stack.deployment]) {
        const forbidden = CONFLICT_MAP[stack.deployment];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "deployment",
                    selected: stack.deployment,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 7. Check Auth
    if (stack.auth && CONFLICT_MAP[stack.auth]) {
        const forbidden = CONFLICT_MAP[stack.auth];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "auth",
                    selected: stack.auth,
                    foundInText: word,
                });
                break;
            }
        }
    }

    // 8. Check State Management
    if (stack.stateManagement && CONFLICT_MAP[stack.stateManagement]) {
        const forbidden = CONFLICT_MAP[stack.stateManagement];
        for (const word of forbidden) {
            if (text.includes(word)) {
                conflicts.push({
                    type: "state",
                    selected: stack.stateManagement,
                    foundInText: word,
                });
                break;
            }
        }
    }

    return conflicts;
}
