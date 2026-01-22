export interface SectionAnalysis {
    detected_sections: {
        education: boolean;
        experience: boolean;
        projects: boolean;
        skills: boolean;
        summary: boolean;
    };
    structural_issues: string[];
}

const SECTION_KEYWORDS = {
    education: ["education", "academic", "university", "college", "school", "qualification"],
    experience: ["experience", "employment", "work history", "work experience", "professional experience"],
    projects: ["projects", "personal projects", "academic projects", "key projects"],
    skills: ["skills", "technical skills", "technologies", "competencies", "tools"],
    summary: ["summary", "objective", "profile", "about me"],
};

export function analyzeStructure(text: string): SectionAnalysis {
    const lowerText = text.toLowerCase();

    const detected = {
        education: SECTION_KEYWORDS.education.some(k => lowerText.includes(k)),
        experience: SECTION_KEYWORDS.experience.some(k => lowerText.includes(k)),
        projects: SECTION_KEYWORDS.projects.some(k => lowerText.includes(k)),
        skills: SECTION_KEYWORDS.skills.some(k => lowerText.includes(k)),
        summary: SECTION_KEYWORDS.summary.some(k => lowerText.includes(k)),
    };

    const issues: string[] = [];

    if (!detected.education) issues.push("Missing Education section");
    if (!detected.experience && !detected.projects) issues.push("Missing Experience or Projects section (at least one required)");
    if (!detected.skills) issues.push("Missing Skills section");

    // Length check (rough character count)
    if (text.length < 200) issues.push("Resume content seems too short");
    if (text.length > 15000) issues.push("Resume content seems too long");

    return {
        detected_sections: detected,
        structural_issues: issues,
    };
}
