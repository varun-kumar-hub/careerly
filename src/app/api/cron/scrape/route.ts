
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSources, updateSourceLastScraped, initializeSources } from "@/features/jobs/sourceService";
import { fetchExternalJobs, upsertJobs } from "@/features/jobs/jobService";

// Helper to determine fetch window
function getFetchDate(lastScraped: string | null): Date {
    if (!lastScraped) {
        // First run: Fetch last 30 days
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    }

    // Incremental: Last scraped - 12 hours (overlap buffer)
    const date = new Date(lastScraped);
    date.setHours(date.getHours() - 12);
    return date;
}

export async function GET(req: NextRequest) {
    // 1. SECURITY: Bearer Token
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Ensure sources exist
    await initializeSources();
    const sources = await getSources();
    const results = [];

    // 2. SCRAPE LOOP
    for (const source of sources) {
        if (!source.active) continue;

        try {
            const minDate = getFetchDate(source.last_scraped_at);
            const daysLookback = Math.ceil((Date.now() - minDate.getTime()) / (1000 * 60 * 60 * 24));

            console.log(`[Cron] Scraping ${source.name} since ${minDate.toISOString()} (${daysLookback} days)`);

            // Broad queries to cover ground
            const queries = ["Software Engineer", "Frontend Developer", "Backend Developer", "Intern"];
            let sourceCount = 0;

            for (const q of queries) {
                // Fetch new jobs only
                const jobs = await fetchExternalJobs(q, '', 'in', undefined, daysLookback);

                // Filter specifically for this source + date > minDate (strict)
                const newJobs = jobs.filter(j =>
                    j.source === source.id &&
                    j.posted_at &&
                    new Date(j.posted_at) > minDate
                );

                if (newJobs.length > 0) {
                    await upsertJobs(newJobs);
                    sourceCount += newJobs.length;
                }
            }

            // Update Success Timestamp
            if (sourceCount > 0) {
                await updateSourceLastScraped(source.id, new Date());
            }

            results.push({ source: source.name, fetched: sourceCount });

        } catch (err: any) {
            console.error(`[Cron] Error scraping ${source.name}:`, err);
            results.push({ source: source.name, error: err.message });
        }
    }

    // 3. CLEANUP (Retention Policy: 6 Months)
    const cleanupDate = new Date();
    cleanupDate.setMonth(cleanupDate.getMonth() - 6);

    const { count: deletedCount } = await supabase
        .from('jobs')
        .delete({ count: 'exact' })
        .lt('posted_date', cleanupDate.toISOString());

    return NextResponse.json({
        success: true,
        scraped: results,
        cleanup: { deleted_older_than_6_months: deletedCount }
    });
}
