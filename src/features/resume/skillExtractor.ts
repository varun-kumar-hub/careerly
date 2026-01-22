import { SKILL_DICTIONARY } from "@/constants/skillDictionary";

export function extractSkills(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundSkills: Set<string> = new Set();

    SKILL_DICTIONARY.forEach(skill => {
        // Escape special characters for regex (like C++, C#)
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Boundary check to avoid partial matches (e.g. matching "Java" in "JavaScript")
        // \b matches word boundary. Special handling for C++ and C# which might not have standard word boundary at the end.
        // Simplifying: search for ' skill ' or ',skill,' or start/end of line.
        // Or just use includes for simplicity but verify boundaries regex if possible.

        // Improved Regex: Look for word boundary or punctuation
        const regex = new RegExp(`(^|\\W)${escapedSkill}(\\W|$)`, 'i');

        if (regex.test(lowerText)) {
            foundSkills.add(skill);
        }
    });

    return Array.from(foundSkills);
}
