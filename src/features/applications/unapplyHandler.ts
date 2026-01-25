"use server";

import { createClient } from "@/utils/supabase/server";

export async function handleUnapplyClick(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Must be logged in" };
    }

    try {
        // Find and delete the application record for this user and job
        // Note: jobs table has job_id (string) but applications table links to jobs.id (uuid)
        // Wait, how are we linking?
        // applicationCreator links via job_id (uuid).
        // The JobListing.id is a string from external API. 
        // We need to match based on how we stored it.
        // Let's look at createApplicationRecord logic implicitly:
        // It likely upserts the job then creates application.
        // So we need to delete from 'applications' where user_id = user.id AND job_id IN (SELECT id FROM jobs WHERE external_id = jobId)

        // Simpler: Just delete from applications where we can join jobs.

        // First find the job internal UUID
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('id')
            .eq('external_id', jobId)
            .single();

        if (jobError || !jobData) {
            return { success: false, error: "Job not found in tracking" };
        }

        const { error: deleteError } = await supabase
            .from('applications')
            .delete()
            .eq('user_id', user.id)
            .eq('job_id', jobData.id);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        return { success: true };

    } catch (e) {
        console.error("Unapply Error", e);
        return { success: false, error: "Failed to remove application" };
    }
}
