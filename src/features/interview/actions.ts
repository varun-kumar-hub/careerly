"use server";

import { generateInterviewQuestionsWithGemini } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export interface InterviewPrepResult {
    questions: string;
    success: boolean;
    error?: string;
}

/**
 * Server action to generate interview questions
 */
export async function generateInterviewQuestions(
    jobDescription: string
): Promise<InterviewPrepResult> {
    if (!jobDescription || jobDescription.trim().length < 50) {
        return {
            questions: "",
            success: false,
            error: "Please provide a more detailed job description",
        };
    }

    // Optionally get user's background for personalized questions
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let candidateBackground = "";

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("skills, experience_level")
            .eq("id", user.id)
            .single();

        if (profile) {
            candidateBackground = `Skills: ${profile.skills?.join(", ") || "Not specified"}
Experience Level: ${profile.experience_level || "Not specified"}`;
        }
    }

    try {
        // Fetch user profile for API key
        const { data: profile } = await supabase
            .from("profiles")
            .select("gemini_api_key")
            .eq("id", user.id)
            .single();

        if (!profile || !profile.gemini_api_key) {
            throw new Error("Gemini API key not found in profile");
        }

        const result = await generateInterviewQuestionsWithGemini(
            profile.gemini_api_key,
            jobDescription,
            candidateBackground
        );

        if (result.success) {
            return {
                questions: result.text,
                success: true,
            };
        } else {
            return {
                questions: "",
                success: false,
                error: result.error || "Failed to generate questions",
            };
        }
    } catch (error) {
        console.error("[Interview Prep] Error:", error);
        return {
            questions: "",
            success: false,
            error: "An error occurred while generating questions",
        };
    }
}
