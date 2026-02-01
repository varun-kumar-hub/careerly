/**
 * Normalizes a location string for consistent comparison and API querying.
 * - Trims whitespace
 * - Lowercases keys
 * - Handles common aliases (e.g. "Bengaluru" -> "Bangalore")
 */
export function normalizeLocation(input: string): string {
    if (!input) return "";

    const normalized = input.trim().toLowerCase();

    // Alias Map
    const aliases: Record<string, string> = {
        "bengaluru": "bangalore",
        "sf": "san francisco",
        "nyc": "new york",
        "ny": "new york",
        "uk": "united kingdom",
        "usa": "united states"
    };

    return aliases[normalized] || normalized;
}
