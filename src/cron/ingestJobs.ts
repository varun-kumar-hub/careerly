import { adzunaService } from "@/services/adzuna.service";
import { remotiveService } from "@/services/remotive.service";
import { joobleService } from "@/services/jooble.service";
import { createAdminClient } from "@/utils/supabase/admin"; // Use Admin Client

export async function ingestJobs() {
    console.log("Starting Job Ingestion...");

    // keywords to search
    const queries = ["software developer", "frontend engineer", "backend engineer", "data scientist"];

    // Fetch from all sources
    // For simplicity, just fetch for 'software developer' for now or loop
    // Let's do parallel fetch for one query to save time/limits
    const query = "software developer";

    const [adzunaJobs, remotiveJobs, joobleJobs] = await Promise.all([
        adzunaService.fetchJobs(query),
        remotiveService.fetchJobs(query),
        joobleService.fetchJobs(query)
    ]);

    const allJobs = [...adzunaJobs, ...remotiveJobs, ...joobleJobs];
    console.log(`Fetched ${allJobs.length} jobs total.`);

    // Use Admin Client to bypass RLS for inserts
    const supabase = createAdminClient();

    // Upsert to DB
    let inserted = 0;
    let failed = 0;

    for (const job of allJobs) {
        const { error } = await supabase.from("jobs").upsert({
            title: job.title,
            company: job.company_name,
            location: job.location,
            description: job.description,
            url: job.url,
            source: job.source,
            source_id: job.id,
            posted_date: job.date_posted ? new Date(job.date_posted).toISOString() : new Date().toISOString(),
            job_type: job.job_type || 'job',
            work_mode: job.work_mode || 'onsite',
            salary_min: job.salary?.min,
            salary_max: job.salary?.max,
            currency: job.salary?.currency || 'USD'
        }, {
            onConflict: 'source,source_id'
        });

        if (!error) inserted++;
        else {
            // console.error("Job Insert Error:", error);
            failed++;
        }
    }

    return { total: allJobs.length, inserted, failed };
}
