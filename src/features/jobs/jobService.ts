
import { createClient } from "@/utils/supabase/server";

export interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary_min?: number;
    salary_max?: number;
    url: string;
    source: 'adzuna' | 'jooble' | 'remotive' | 'mock';
    posted_at?: string;
    logo_url?: string;
    job_type?: 'job' | 'internship';
}

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

// Default freshness: 7 days for the main search, but user requests "now"
const DEFAULT_MAX_DAYS = 7;

/**
 * Main Search Entry Point
 * 1. Tries the Database first (Aggregated Cache).
 * 2. If results are thin (< 5), it triggers a LIVE fetch from external APIs.
 * 3. Saves live results to DB and returns them.
 */
export async function searchJobs(
    query: string,
    location: string = '',
    country: string = 'in',
    workMode?: string,
    maxDays: number = DEFAULT_MAX_DAYS,
    type: 'job' | 'internship' | 'all' = 'all'
): Promise<JobListing[]> {
    const supabase = await createClient();

    // Build DB Query
    let dbQuery = supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(40);

    // Apply Filters
    if (query && query !== 'all') {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (location) {
        dbQuery = dbQuery.ilike('location', `%${location}%`);
    }

    if (type !== 'all') {
        dbQuery = dbQuery.eq('job_type', type);
    }

    const { data: dbJobs, error } = await dbQuery;

    // If we have plenty of fresh jobs in DB, return them
    if (!error && dbJobs && dbJobs.length >= 8) {
        return mapDbJobs(dbJobs);
    }

    // FALLBACK: Not enough results in DB? Fetch from APIs LIVE
    console.log(`[JobService] Thin results for "${query}" (${dbJobs?.length || 0}). Triggering LIVE fetch...`);

    // Transform query for live search if it's too specific
    const liveQuery = query || "Software Engineer";
    const externalJobs = await fetchExternalJobs(liveQuery, location, country, workMode);

    if (externalJobs.length > 0) {
        // Map to DB Schema and Save (Sync)
        const dbRows = externalJobs.map(j => ({
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description?.substring(0, 10000),
            url: j.url,
            source: j.source,
            source_id: j.id,
            posted_date: j.posted_at ? new Date(j.posted_at).toISOString() : new Date().toISOString(),
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            job_type: (type === 'internship' || j.title.toLowerCase().includes('intern')) ? 'internship' : 'job'
        }));

        // Upsert silently
        await supabase.from('jobs').upsert(dbRows, {
            onConflict: 'source,source_id',
            ignoreDuplicates: true
        });

        // Filter valid types for return
        const filteredLive = externalJobs.filter(j => {
            if (type === 'all') return true;
            const isIntern = j.title.toLowerCase().includes('intern');
            return type === 'internship' ? isIntern : !isIntern;
        });

        // Merge with existing DB jobs for maximum variety, then deduplicate
        const merged = [...mapDbJobs(dbJobs || []), ...filteredLive];
        const unique = Array.from(new Map(merged.map(item => [item.url, item])).values());

        return unique.slice(0, 40);
    }

    return mapDbJobs(dbJobs || []);
}

function mapDbJobs(data: any[]): JobListing[] {
    return data.map((job: any) => ({
        id: job.source_id || job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        url: job.url,
        source: job.source as any,
        posted_at: job.posted_date,
        job_type: job.job_type
    }));
}

/**
 * Cron/Ingest Handler
 */
export async function ingestGlobalJobs() {
    const queries = [
        "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "DevOps Engineer",
        "Software Engineering Intern", "Data Science Intern", "Generic Intern",
        "React", "Nodejs", "Python", "Java"
    ];
    const countries = ["in", "us", "gb", "remote"];
    let count = 0;
    for (const q of queries) {
        for (const c of countries) {
            const jobs = await searchJobs(q, '', c, undefined, 7, q.toLowerCase().includes('intern') ? 'internship' : 'job');
            count += jobs.length;
        }
    }
    return count;
}

// --- INTERNAL LIVE FETCHERS ---

async function fetchExternalJobs(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    const promises = [
        fetchFromAdzuna(query, location, country, workMode),
        fetchFromJooble(query, location, country, workMode),
        fetchFromRemotive(query, location, country, workMode)
    ];
    const res = await Promise.allSettled(promises);
    const jobs: JobListing[] = [];
    res.forEach(r => { if (r.status === 'fulfilled') jobs.push(...r.value); });
    return jobs;
}

async function fetchFromAdzuna(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];
    try {
        const countryCode = country === 'remote' ? 'us' : country;
        const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=15&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((j: any) => ({
            id: String(j.id), title: j.title, company: j.company?.display_name || "Unknown",
            location: j.location?.display_name || "Unknown", description: j.description,
            salary_min: j.salary_min, salary_max: j.salary_max, url: j.redirect_url,
            source: 'adzuna', posted_at: j.created
        }));
    } catch { return []; }
}

async function fetchFromJooble(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!JOOBLE_API_KEY) return [];
    try {
        const url = `https://jooble.org/api/${JOOBLE_API_KEY}`;
        const body = { keywords: query, location: location || (country === 'in' ? 'India' : country) };
        const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.jobs || []).map((j: any) => ({
            id: String(j.id), title: j.title, company: j.company || "Unknown",
            location: j.location, description: j.snippet, url: j.link,
            source: 'jooble', posted_at: j.updated
        }));
    } catch { return []; }
}

async function fetchFromRemotive(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (workMode && workMode !== 'remote') return [];
    try {
        const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.jobs || []).slice(0, 10).map((j: any) => ({
            id: String(j.id), title: j.title, company: j.company_name || "Unknown",
            location: j.candidate_required_location || 'Remote', description: j.description,
            url: j.url, source: 'remotive', posted_at: j.publication_date, logo_url: j.company_logo
        }));
    } catch { return []; }
}
