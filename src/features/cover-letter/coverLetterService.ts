"use server";

import { generateCoverLetterWithGemini } from "@/lib/gemini";

export interface CoverLetterResult {
    letter: string;
    success: boolean;
    error?: string;
    isAI: boolean;
}

import { createClient } from "@/utils/supabase/server";

/**
 * Server action to generate a cover letter using Gemini AI
 */
export async function generateCoverLetter(
    jobDescription: string,
    resumeContext: string,
    userName?: string
): Promise<CoverLetterResult> {
    // Validate inputs
    if (!jobDescription || jobDescription.trim().length < 50) {
        return {
            letter: "",
            success: false,
            error: "Please provide a more detailed job description (at least 50 characters)",
            isAI: false,
        };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            letter: "",
            success: false,
            error: "User profile not found. Please log in.",
            isAI: false,
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return {
            letter: "",
            success: false,
            error: "Profile not found.",
            isAI: false,
        };
    }

    // Check if API key is available in user profile
    if (!profile.gemini_api_key) {
        return {
            letter: "",
            success: false,
            error: "Gemini API key not found. Please add it in your profile settings to use AI features.",
            isAI: false,
        };
    }

    try {
        const result = await generateCoverLetterWithGemini(
            profile.gemini_api_key,
            jobDescription,
            resumeContext,
            profile.full_name
        );

        if (result.success) {
            return {
                letter: result.text,
                success: true,
                isAI: true,
            };
        } else {
            // Fallback to mock if AI fails
            console.warn("[Cover Letter] AI generation failed:", result.error);
            return {
                letter: generateFallbackLetter(jobDescription, resumeContext),
                success: true,
                error: "AI unavailable, using template",
                isAI: false,
            };
        }
    } catch (error) {
        console.error("[Cover Letter] Error:", error);
        return {
            letter: generateFallbackLetter(jobDescription, resumeContext),
            success: true,
            error: "Error occurred, using template",
            isAI: false,
        };
    }
}

/**
 * Fallback template when AI is unavailable
 */
function generateFallbackLetter(jobDescription: string, resumeContext: string): string {
    const today = new Date().toLocaleDateString();
    const companyMatch = jobDescription.match(/at\s+([A-Z][a-z0-9\s]+)/) || ["", "the company"];
    const company = companyMatch[1] || "the Hiring Team";

    return `Date: ${today}

Dear Hiring Manager,

I am writing to express my strong interest in the open position at ${company}. With my background and skills, I am confident in my ability to contribute effectively to your team.

Based on my experience with ${resumeContext.slice(0, 100)}..., I believe I would be a strong fit for this role.

Key qualifications that align with your requirements:
• Relevant technical skills and experience
• Strong problem-solving abilities
• Excellent communication and teamwork

I look forward to the opportunity to discuss how my background aligns with your needs.

Sincerely,
[Your Name]

---
⚠️ This is a template letter. To enable AI-powered personalized cover letters, ensure your Gemini API key is configured.`;
}
