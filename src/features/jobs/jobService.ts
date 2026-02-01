
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

export interface JobFilterOptions {
    type?: 'job' | 'internship' | 'all';
    location?: string;
    query?: string;
    limit?: number;
}

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

// Default freshness: 30 days (1 month)
const DEFAULT_MAX_DAYS = 30;

// ... (existing code)

/**
 * Main Search Entry Point
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

    // 1. FRESHNESS FILTER
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);

    // 2. DATABASE QUERY
    let dbQuery = supabase
        .from('jobs')
        .select('*')
        .gte('posted_date', cutoffDate.toISOString())
        .order('posted_date', { ascending: false })
        .limit(60);

    // SMART KEYWORD SEARCH: Split words and match all
    if (query && query.toLowerCase() !== 'all') {
        const keywords = query.split(/\s+/).filter(k => k.length > 1);
        keywords.forEach(word => {
            dbQuery = dbQuery.or(`title.ilike.%${word}%,description.ilike.%${word}%`);
        });
    }

    if (location) {
        dbQuery = dbQuery.ilike('location', `%${location}%`);
    }

    if (type !== 'all') {
        dbQuery = dbQuery.eq('job_type', type);
    }

    const { data: dbJobs, error } = await dbQuery;

    // 3. FALLBACK: Trigger LIVE fetch if results are thin
    if (!error && dbJobs && dbJobs.length >= 10) {
        return mapDbJobs(dbJobs);
    }

    console.log(`[JobService] Thin database results for "${query}" (${dbJobs?.length || 0}). Fetching LIVE...`);

    // Use a simplified query for external APIs if it's too complex
    const apiQuery = query || "Software Engineer";
    // PASS maxDays to external fetcher
    const externalJobs = await fetchExternalJobs(apiQuery, location, country, workMode, maxDays);

    if (externalJobs.length > 0) {
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
            job_type: checkIsInternship(j.title) ? 'internship' : 'job'
        }));

        await supabase.from('jobs').upsert(dbRows, {
            onConflict: 'source,source_id',
            ignoreDuplicates: true
        });

        // Combine and Filter
        const merged = [...mapDbJobs(dbJobs || []), ...externalJobs];

        // Final filter for correct type and uniqueness
        const unique = Array.from(new Map(merged.map(item => [item.url, item])).values())
            .filter(j => {
                if (type === 'all') return true;
                const isIntern = checkIsInternship(j.title) || j.job_type === 'internship';
                return type === 'internship' ? isIntern : !isIntern;
            });

        return unique.slice(0, 40);
    }

    return mapDbJobs(dbJobs || []);
}

function mapDbJobs(data: any[]): JobListing[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function ingestGlobalJobs() {
    // Broad categories to ensure DB isn't empty
    const queries = ["Software", "Developer", "Engineer", "Intern", "React", "Python", "Java"];
    const countries = ["in", "us", "remote"];
    let count = 0;
    for (const q of queries) {
        for (const c of countries) {
            // Pass default 30 days
            const jobs = await searchJobs(q, '', c, undefined, 30, q.toLowerCase().includes('intern') ? 'internship' : 'job');
            count += jobs.length;
        }
    }
    return count;
}

function checkIsInternship(title: string): boolean {
    const t = title.toLowerCase();
    return t.includes('intern') || t.includes('trainee') || t.includes('co-op') || t.includes('student') || t.includes('apprentice');
}

// --- API FETCHERS ---

// Updated to accept maxDays
async function fetchExternalJobs(query: string, location: string, country: string, workMode?: string, maxDays: number = 30): Promise<JobListing[]> {
    const promises = [
        fetchFromAdzuna(query, location, country, workMode, maxDays),
        fetchFromJooble(query, location, country, workMode, maxDays),
        fetchFromRemotive(query, location, country, workMode, maxDays)
    ];
    const res = await Promise.allSettled(promises);
    const jobs: JobListing[] = [];
    res.forEach(r => { if (r.status === 'fulfilled') jobs.push(...r.value); });
    return jobs;
}

// 1. ADZUNA: Supports max_days param
async function fetchFromAdzuna(query: string, location: string, country: string, workMode?: string, maxDays: number = 30): Promise<JobListing[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];
    try {
        const countryCode = (country === 'remote' || country === 'in') ? country : 'us';
        // ADDED &max_days=${maxDays}
        const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=15&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&max_days=${maxDays}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data.results || []).map((j: any) => ({
            id: String(j.id), title: j.title, company: j.company?.display_name || "Unknown",
            location: j.location?.display_name || "Unknown", description: j.description,
            salary_min: j.salary_min, salary_max: j.salary_max, url: j.redirect_url,
            source: 'adzuna', posted_at: j.created
        }));
    } catch { return []; }
}

// 2. JOOBLE: Needs manual filter
async function fetchFromJooble(query: string, location: string, country: string, workMode?: string, maxDays: number = 30): Promise<JobListing[]> {
    if (!JOOBLE_API_KEY) return [];
    try {
        const body = { keywords: query, location: location || (country === 'in' ? 'India' : 'USA') };
        const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxDays);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data.jobs || [])
            .filter((j: any) => {
                const posted = new Date(j.updated);
                return posted >= cutoff;
            })
            .map((j: any) => ({
                id: String(j.id), title: j.title, company: j.company || "Unknown",
                location: j.location, description: j.snippet, url: j.link,
                source: 'jooble', posted_at: j.updated
            }));
    } catch { return []; }
}

// 3. REMOTIVE: Needs manual filter
async function fetchFromRemotive(query: string, location: string, country: string, workMode?: string, maxDays: number = 30): Promise<JobListing[]> {
    if (workMode && workMode !== 'remote') return [];
    try {
        const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxDays);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data.jobs || []).slice(0, 15)
            .filter((j: any) => {
                const posted = new Date(j.publication_date);
                return posted >= cutoff;
            })
            .map((j: any) => ({
                id: String(j.id), title: j.title, company: j.company_name || "Unknown",
                location: j.candidate_required_location || 'Remote', description: j.description,
                url: j.url, source: 'remotive', posted_at: j.publication_date, logo_url: j.company_logo
            }));
    } catch { return []; }
}

/**
 * Get personalized job recommendations based on Profile and Resume skills.
 */
export async function getPersonalizedJobs(
    userId: string,
    type: 'job' | 'internship' | 'all' = 'all',
    limit: number = 10
): Promise<JobListing[]> {
    const supabase = await createClient();

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('skills, job_roles, preferred_locations, work_mode')
        .eq('id', userId)
        .single();

    // 2. Fetch Resume Skills (latest analysis)
    const { data: resume } = await supabase
        .from('resume_analysis')
        .select('extracted_skills')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // 3. Construct Query
    const keywords = new Set<string>();

    // Priority 1: Job Roles (e.g. "Frontend Developer")
    if (profile?.job_roles) {
        profile.job_roles.forEach((r: string) => keywords.add(r));
    }

    // Priority 2: Resume Skills (Top 3 usually most relevant if valid)
    if (resume?.extracted_skills) {
        resume.extracted_skills.slice(0, 3).forEach((s: string) => keywords.add(s));
    }

    // Priority 3: Profile Skills
    if (profile?.skills) {
        profile.skills.slice(0, 3).forEach((s: string) => keywords.add(s));
    }

    // Fallback
    if (keywords.size === 0) {
        keywords.add("Software Engineer");
    }

    // Create a combined query string (e.g., "Frontend Developer React TypeScript")
    // Limit length to avoid API errors
    const query = Array.from(keywords).join(" ").substring(0, 100);
    const location = profile?.preferred_locations?.[0] || "";
    const workMode = profile?.work_mode === 'remote' ? 'remote' : undefined;

    console.log(`[Personalized] User: ${userId} | Query: "${query}" | Type: ${type}`);

    return searchJobs(query, location, 'in', workMode, 14, type);
}
