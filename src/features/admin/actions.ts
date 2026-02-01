"use server";

import { createClient } from "@/utils/supabase/server";

export async function cleanupOldJobsAction() {
    console.log("[Cleanup] Starting old jobs cleanup...");
    const supabase = await createClient();

    // Calculate date 30 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    try {
        const { error, count } = await supabase
            .from('jobs')
            .delete({ count: 'exact' })
            .lt('posted_date', cutoffDate.toISOString());

        if (error) {
            console.error("[Cleanup] Error deleting old jobs:", error);
            return { success: false, error: error.message };
        }

        console.log(`[Cleanup] Deleted ${count} jobs older than ${cutoffDate.toISOString()}`);
        return { success: true, count };
    } catch (err) {
        console.error("[Cleanup] Unexpected error:", err);
        return { success: false, error: "Unexpected error during cleanup" };
    }
}
