"use server";

import { createClient } from "@/utils/supabase/server";
import { extractText } from "./textExtraction";
import { analyzeStructure } from "./sectionDetector";
import { extractSkills } from "./skillExtractor";
import { revalidatePath } from "next/cache";

export interface UploadResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Server Action to handle resume upload.
 * 1. Uploads file to Supabase Storage.
 * 2. Extracts text from the file.
 * 3. Analyzes text for skills and sections.
 * 4. Saves results to `resume_analysis` table.
 */
export async function uploadResumeAction(formData: FormData): Promise<UploadResult> {
    const file = formData.get("resume") as File;

    if (!file) {
        return { success: false, error: "No file provided" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Upload to Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert File to Buffer for extraction
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type
        });

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        return { success: false, error: "Failed to upload file to storage." };
    }

    try {
        // 2. Extract Text
        const text = await extractText(buffer, file.type);

        // 3. Analyze
        const structure = analyzeStructure(text);
        const skills = extractSkills(text);

        // 4. Save Analysis to DB
        const { error: dbError } = await supabase
            .from("resume_analysis")
            .insert({
                user_id: user.id,
                file_path: fileName,
                file_name: file.name,
                file_type: file.type,
                extracted_text: text,
                detected_sections: structure.detected_sections,
                extracted_skills: skills,
                structural_issues: structure.structural_issues,
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return { success: false, error: "Failed to save analysis results." };
        }

        // 5. UPDATE PROFILE with new skills
        // Fetch current skills first to merge
        const { data: profileData } = await supabase
            .from("profiles")
            .select("skills")
            .eq("id", user.id)
            .single();

        const currentSkills = profileData?.skills || [];
        const mergedSkills = Array.from(new Set([...currentSkills, ...skills]));

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                skills: mergedSkills,
                // Update academic year/experience if detected?
                // For now, let's just stick to skills as requested.
            })
            .eq("id", user.id);

        if (profileError) {
            console.error("Profile Update Error:", profileError);
            // We don't fail the whole action if profile update fails, but we log it.
        }

        revalidatePath("/resume");
        revalidatePath("/profile");
        revalidatePath("/dashboard");
        return { success: true, message: "Resume uploaded and analyzed successfully. Profile skills updated." };

    } catch (e: any) {
        console.error("Processing Error:", e);
        return { success: false, error: `Processing failed: ${e.message}` };
    }
}
