"use server";

import { createClient } from "@/utils/supabase/server";
import { JobListing } from "@/features/jobs/jobService";
import { revalidatePath } from "next/cache";

export async function createApplicationRecord(job: JobListing) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Check if already applied to avoid duplicates (Idempotency)
    // We can check by job_url or a composite key. Since we don't have job_id in our DB (it's external),
    // we use job_url + user_id or similar.
    // Let's check by job_url + title + company to be safe.

    const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_url", job.url)
        .eq("job_title", job.title) // Extra safety
        .single();

    if (existing) {
        // Already tracked, just return success
        return { success: true, message: "Already applied" };
    }

    const { error } = await supabase
        .from("applications")
        .insert({
            user_id: user.id,
            job_title: job.title,
            company_name: job.company,
            job_url: job.url,
            location: job.location,
            salary_range: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : null,
            status: 'applied',
            applied_date: new Date().toISOString(),
            notes: `Applied via Careerly (Source: ${job.source})`
        });

    if (error) {
        console.error("Failed to track application:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/applications");
    return { success: true };
}
