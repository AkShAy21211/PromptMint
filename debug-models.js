const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

function getApiKey() {
    const envPath = path.join(__dirname, ".env.local");
    if (!fs.existsSync(envPath)) return "";
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/GEMINI_API_KEY=(.*)/);
    return match ? match[1].trim() : "";
}

async function run() {
    const apiKey = getApiKey();
    console.log("Using API Key starting with:", apiKey.substring(0, 4));
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Attempt to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`));
        } else {
            console.log("No models returned:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

run();
