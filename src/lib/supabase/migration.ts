import { createClient } from "./client";

interface LocalHistoryEntry {
    idea: string;
    result: string;
    timestamp: number;
}

export async function migrateLocalPrompts(userId: string) {
    const STORAGE_KEY = "promptmint_history";
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
        const localHistory: LocalHistoryEntry[] = JSON.parse(saved);
        const supabase = createClient();

        // Prepare prompts for insertion
        const promptsToMigrate = localHistory.map((entry) => ({
            user_id: userId,
            title: entry.idea,
            content: entry.result,
            stack: {}, // Metadata if needed
            created_at: new Date(entry.timestamp).toISOString()
        }));

        const { error } = await supabase
            .from('prompts')
            .insert(promptsToMigrate);

        if (!error) {
            // Success - clear local storage to prevent duplicate migrations
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem("guest_prompt_count");
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
}
