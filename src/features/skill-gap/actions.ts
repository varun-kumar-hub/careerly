"use server";

import { analyzeSkillGapWithGemini } from "@/lib/gemini";

export interface SkillGapResult {
    analysis: string;
    matchedSkills: string[];
    skillGaps: string[];
    matchPercentage: number;
    recommendations: string[];
    success: boolean;
    error?: string;
}

/**
 * Server action to analyze skill gaps for a job
 */
import { createClient } from "@/utils/supabase/server";

export async function analyzeSkillGap(
    jobDescription: string,
    userSkills: string[]
): Promise<SkillGapResult> {
    if (!jobDescription || jobDescription.trim().length < 50) {
        return {
            analysis: "",
            matchedSkills: [],
            skillGaps: [],
            matchPercentage: 0,
            recommendations: [],
            success: false,
            error: "Please provide a more detailed job description",
        };
    }

    if (!userSkills || userSkills.length === 0) {
        return {
            analysis: "",
            matchedSkills: [],
            skillGaps: [],
            matchPercentage: 0,
            recommendations: [],
            success: false,
            error: "No skills found. Please update your profile with your skills.",
        };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                analysis: "",
                matchedSkills: [],
                skillGaps: [],
                matchPercentage: 0,
                recommendations: [],
                success: false,
                error: "Unauthorized",
            };
        }
        // Fetch user profile for API key
        const { data: profile } = await supabase
            .from("profiles")
            .select("gemini_api_key")
            .eq("id", user.id)
            .single();

        if (!profile || !profile.gemini_api_key) {
            throw new Error("Gemini API key not found in profile");
        }

        const result = await analyzeSkillGapWithGemini(profile.gemini_api_key, jobDescription, userSkills);

        if (result.success) {
            // Try to parse as JSON if the response is structured
            try {
                const parsed = JSON.parse(result.text);
                return {
                    analysis: result.text,
                    matchedSkills: parsed.matchedSkills || [],
                    skillGaps: parsed.skillGaps || [],
                    matchPercentage: parsed.matchPercentage || 0,
                    recommendations: parsed.recommendations || [],
                    success: true,
                };
            } catch {
                // If not JSON, return the raw text
                return {
                    analysis: result.text,
                    matchedSkills: [],
                    skillGaps: [],
                    matchPercentage: 0,
                    recommendations: [],
                    success: true,
                };
            }
        } else {
            return {
                analysis: "",
                matchedSkills: [],
                skillGaps: [],
                matchPercentage: 0,
                recommendations: [],
                success: false,
                error: result.error || "Failed to analyze skill gap",
            };
        }
    } catch (error) {
        console.error("[Skill Gap] Error:", error);
        return {
            analysis: "",
            matchedSkills: [],
            skillGaps: [],
            matchPercentage: 0,
            recommendations: [],
            success: false,
            error: "An error occurred while analyzing skills",
        };
    }
}
