import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALL_STACKS, StackOption } from "@/lib/constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

// Extract flat name lists for validation
const VALID_NAMES: Record<string, string[]> = {};
for (const [key, options] of Object.entries(ALL_STACKS)) {
    VALID_NAMES[key] = (options as StackOption[]).map(o => o.name);
}

export async function POST(req: NextRequest) {
    try {
        const { userIdea } = await req.json();

        if (!userIdea || userIdea.trim().length < 5) {
            return NextResponse.json({ error: "Idea too short" }, { status: 400 });
        }

        // Build a simplified prompt with ONLY flat name lists (no objects/categories)
        const optionLists = Object.entries(VALID_NAMES)
            .map(([key, names]) => `${key}: [${names.map(n => `"${n}"`).join(", ")}]`)
            .join("\n");

        const prompt = `
            You are a strict technical analyst. Your job is to extract ONLY the technologies that the user EXPLICITLY mentions or that are DIRECTLY required by what they describe.

            USER IDEA: "${userIdea}"

            ALLOWED VALUES (you MUST pick from these lists ONLY):
            ${optionLists}

            Output a JSON object with these exact keys: framework, language, styling, database, apiPattern, deployment, auth, stateManagement, animation.

            CRITICAL RULES — READ CAREFULLY:
            1. **DETECT USER INTENT FIRST**: 
               - If the user says things like "choose for me", "pick the best", "recommend", "suggest a stack", "you decide", or similar delegation phrases → treat this as FULL INFERENCE MODE. Fill ALL categories with the best-fit modern options.
               - Otherwise → treat this as EXTRACTION MODE. Default to "None" for every category unless the user explicitly names or directly implies a technology.
            2. In EXTRACTION MODE: Only select a specific value if the user NAMES it or a very close synonym (e.g., "node" → "Express", "mongo" → "MongoDB", "react" → "React").
            3. In EXTRACTION MODE: Do NOT guess deployment, auth libraries, styling, animation, or state management unless the user specifically asks for them.
            4. For "language", there is no "None" — always infer the most likely language from the framework/idea.
            5. Every value MUST be EXACTLY one of the strings from the corresponding list. No synonyms, no alternatives.
        `.trim();

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const rawInference = JSON.parse(responseText);

        // SERVER-SIDE VALIDATION: Reject any value not in the allowed list
        const validatedStack: Record<string, string> = {};
        for (const [key, allowedNames] of Object.entries(VALID_NAMES)) {
            const aiValue = rawInference[key];
            if (typeof aiValue === "string" && allowedNames.includes(aiValue)) {
                validatedStack[key] = aiValue;
            } else {
                // Fallback: "None" if available, otherwise first option
                validatedStack[key] = allowedNames.includes("None") ? "None" : allowedNames[0];
                console.warn(`Stack Inference: Rejected invalid "${key}" value "${aiValue}", using "${validatedStack[key]}"`);
            }
        }

        return NextResponse.json(validatedStack);
    } catch (error) {
        console.error("Stack Inference Error:", error);
        return NextResponse.json({ error: "Failed to infer stack" }, { status: 500 });
    }
}
