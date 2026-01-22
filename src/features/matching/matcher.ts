import { SKILL_DICTIONARY } from "@/constants/skillDictionary";

export interface MatchResult {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    explanation: string;
}

// Extract skills from any text using the dictionary
function extractSkillsFromText(text: string): string[] {
    const lowerText = text.toLowerCase();
    const found: Set<string> = new Set();

    SKILL_DICTIONARY.forEach(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i');
        if (regex.test(lowerText)) {
            found.add(skill);
        }
    });

    return Array.from(found);
}

export function calculateMatchScore(
    jobDescription: string,
    profileSkills: string[] = [],
    resumeSkills: string[] = []
): MatchResult {
    // 1. Identify what the job needs (Required Skills)
    const requiredSkills = extractSkillsFromText(jobDescription);

    // 2. Aggregate User Skills
    const userSkills = Array.from(new Set([...profileSkills, ...resumeSkills]));

    // 3. Logic: If no specific skills detected in Job, we can't score accurately based on skills.
    // Fallback: Check if user skills appear in job description?
    // Current approach: "How many of the JOB'S skills do YOU have?"

    if (requiredSkills.length === 0) {
        // Edge case: Job has no dictionary skills.
        return {
            score: 0,
            matchedSkills: [],
            missingSkills: [],
            explanation: "No specific technical skills detected in this job description to match against."
        };
    }

    const matched: string[] = [];
    const missing: string[] = [];

    // Case insensitive check
    const lowerUserSkills = userSkills.map(s => s.toLowerCase());

    requiredSkills.forEach(req => {
        if (lowerUserSkills.includes(req.toLowerCase())) {
            matched.push(req);
        } else {
            missing.push(req);
        }
    });

    const score = Math.round((matched.length / requiredSkills.length) * 100);

    return {
        score,
        matchedSkills: matched,
        missingSkills: missing,
        explanation: `You match ${matched.length} out of ${requiredSkills.length} detected skills.`
    };
}
