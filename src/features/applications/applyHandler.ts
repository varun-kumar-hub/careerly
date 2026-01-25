"use server";

import { JobListing } from "@/features/jobs/jobService";
import { createApplicationRecord } from "./applicationCreator";
import { validateApplicationData } from "./applicationValidator";
import { createClient } from "@/utils/supabase/server";

export async function handleApplyClick(job: JobListing) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Must be logged in to apply" };
    }

    // 1. Validate
    const validation = validateApplicationData(job, user.id);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    // 2. Track Application
    const result = await createApplicationRecord(job);

    // 3. Return URL for redirect (client-side will handle window.open)
    if (result.success) {
        return { success: true, redirectUrl: job.url };
    } else {
        return { success: false, error: result.error };
    }
}
