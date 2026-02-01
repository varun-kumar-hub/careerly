"use server";

import { generateResumeTailoringWithGemini } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export interface TailoringResult {
    suggestions: string;
    success: boolean;
    error?: string;
}

/**
 * Server action to generate resume tailoring suggestions
 */
export async function tailorResumeForJob(
    jobDescription: string
): Promise<TailoringResult> {
    // Validate input
    if (!jobDescription || jobDescription.trim().length < 50) {
        return {
            suggestions: "",
            success: false,
            error: "Please provide a more detailed job description",
        };
    }

    // Get user's resume from database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            suggestions: "",
            success: false,
            error: "Please sign in to use this feature",
        };
    }

    // Fetch resume data (don't use .single() to avoid errors when no resume exists)
    const { data: resumeData } = await supabase
        .from("resume_analysis")
        .select("extracted_text, extracted_skills")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

    // Fetch user profile for API key
    const { data: profile } = await supabase
        .from("profiles")
        .select("gemini_api_key")
        .eq("id", user.id)
        .single();

    if (!resumeData || resumeData.length === 0) {
        return {
            suggestions: "",
            success: false,
            error: "No resume found. Please upload your resume first.",
        };
    }

    const resume = resumeData[0];
    const resumeContext = resume.extracted_text ||
        `Skills: ${resume.extracted_skills?.join(", ")}`;

    try {
        if (!profile || !profile.gemini_api_key) {
            throw new Error("Gemini API key not found in profile");
        }

        const result = await generateResumeTailoringWithGemini(profile.gemini_api_key, jobDescription, resumeContext);

        if (result.success) {
            return {
                suggestions: result.text,
                success: true,
            };
        } else {
            return {
                suggestions: "",
                success: false,
                error: result.error || "Failed to generate suggestions",
            };
        }
    } catch (error) {
        console.error("[Resume Tailor] Error:", error);
        return {
            suggestions: "",
            success: false,
            error: "An error occurred while generating suggestions",
        };
    }
}
