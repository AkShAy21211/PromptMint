export interface AgenticPhase {
    id: number;
    title: string;
    content: string;
}

/**
 * Parses a raw string containing [[PHASE X: Name]] ... [[PHASE_END]] blocks
 * into a structured array of phases.
 */
export function parseAgenticPlan(input: string): AgenticPhase[] {
    const phases: AgenticPhase[] = [];
    const phaseRegex = /\[\[PHASE\s+(\d+):\s*(.*?)\]\]([\s\S]*?)\[\[PHASE_END\]\]/g;
    
    let match;
    while ((match = phaseRegex.exec(input)) !== null) {
        phases.push({
            id: parseInt(match[1]),
            title: match[2].trim(),
            content: match[3].trim()
        });
    }
    
    return phases;
}

/**
 * Strips markers from the text if you want to display the "Clean" version
 */
export function stripPhaseMarkers(input: string): string {
    return input
        .replace(/\[\[PHASE\s+\d+:\s*.*?\]\]/g, '')
        .replace(/\[\[PHASE_END\]\]/g, '')
        .trim();
}
