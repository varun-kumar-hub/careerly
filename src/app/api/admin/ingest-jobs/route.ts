import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/constants/adminEmails";
import { fetchExternalJobs, upsertJobs } from "@/features/jobs/jobService";
import { initializeSources, getSources, updateSourceLastScraped } from "@/features/jobs/sourceService";

export async function GET(_request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check admin access
    if (!user || !isAdminEmail(user.email)) {
        return NextResponse.json(
            { error: "Unauthorized. Admin access required." },
            { status: 403 }
        );
    }

    try {
        console.log("[Admin] Starting manual job ingestion...");

        // Ensure sources exist
        await initializeSources();
        const sources = await getSources();
        let totalCount = 0;

        // Force a 3-day scrape for all sources
        const manualLookbackDays = 3;

        for (const source of sources) {
            if (!source.active) continue;

            // Broad queries
            const queries = ["Software Engineer", "Frontend Developer", "Backend Developer", "Intern"];

            for (const q of queries) {
                const jobs = await fetchExternalJobs(q, '', 'in', undefined, manualLookbackDays);
                const sourceJobs = jobs.filter(j => j.source === source.id);

                if (sourceJobs.length > 0) {
                    await upsertJobs(sourceJobs);
                    totalCount += sourceJobs.length;
                    // Update timestamp to now since we just scraped (even if manually)
                    await updateSourceLastScraped(source.id, new Date());
                }
            }
        }

        console.log(`[Admin] Job ingestion complete. ${totalCount} jobs processed.`);

        // Redirect back to dashboard with success param
        return NextResponse.redirect(new URL('/admin?refresh=success&count=' + totalCount, _request.url));

    } catch (error: unknown) {
        console.error("[Admin] Job ingestion error:", error);
        return NextResponse.json(
            { error: "Failed to refresh job database" },
            { status: 500 }
        );
    }
}
