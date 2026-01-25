/**
 * Validates if the location input is safe and valid for querying.
 * Since we support Global Search, we allow almost any non-empty string.
 * We just filter out obviously too short or malicious-looking inputs.
 */
export function validateLocation(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();

    // Minimum length check (e.g. "A" might be valid? Let's say 2 chars)
    if (trimmed.length < 2) return false;

    // Block common SQL injection or script chars just in case (though API should handle it)
    if (/[<>;]/.test(trimmed)) return false;

    return true;
}
