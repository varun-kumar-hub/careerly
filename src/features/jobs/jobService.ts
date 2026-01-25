/**
 * Job Service to handle fetching jobs from external APIs (Adzuna, Jooble, Remotive).
 * Normalizes the data into a common `JobListing` interface.
 */

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
    logo_url?: string; // Some APIs provide company logo
}

import { normalizeLocation } from "@/features/jobs/locationNormalizer";
import { validateLocation } from "@/features/jobs/locationValidator";




import { createClient } from "@/utils/supabase/server";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

// Default freshness: 1 day
const DEFAULT_MAX_DAYS = 1;

/**
 * 1. SEARCH Jobs (Public Access)
 * Queries the internal database for jobs that match the criteria.
 */
export async function searchJobs(query: string, location: string = '', country: string = 'in', workMode?: string, maxDays: number = DEFAULT_MAX_DAYS): Promise<JobListing[]> {
    const supabase = await createClient();

    // Normalize basic search
    let rpcQuery = supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(50); // Cap at 50 results

    // Keyword Search
    if (query && query !== 'all') {
        rpcQuery = rpcQuery.ilike('title', `%${query}%`);
    }

    // Location Filter
    if (location) {
        rpcQuery = rpcQuery.ilike('location', `%${location}%`);
    }

    const { data, error } = await rpcQuery;

    if (error) {
        console.error("DB Search Error", error);
        return [];
    }

    return (data || []).map((job: any) => ({
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
        logo_url: undefined
    }));
}

/**
 * 2. INGEST Jobs (Cron Admin Access)
 * Fetches from External APIs and saves to DB.
 */
export async function ingestGlobalJobs() {
    const supabase = await createClient();

    // A. Define "Popular Queries" to scrape regularly
    const queries = [
        // Generic Roles
        "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Data Scientist", "Product Manager", "UI UX Designer", "DevOps Engineer",

        // Internships (Explicit)
        "Software Engineering Intern", "Data Science Intern", "Product Management Intern",
        "Marketing Intern", "Sales Intern", "Generic Intern",

        // Tech Stacks (for better profile matching)
        "React Developer", "Node.js Developer", "Python Developer", "Java Developer"
    ];

    const countries = ["in", "us", "gb", "remote"];

    let totalIngested = 0;

    for (const q of queries) {
        for (const c of countries) {
            const jobs = await fetchExternalJobs(q, '', c);

            if (jobs.length > 0) {
                const dbRows = jobs.map(j => ({
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
                    job_type: q.toLowerCase().includes('intern') ? 'internship' : 'job'
                }));

                const { error } = await supabase.from('jobs').upsert(dbRows, {
                    onConflict: 'source,source_id',
                    ignoreDuplicates: true
                });

                if (!error) totalIngested += jobs.length;
                else console.error(`Failed to ingest ${q} in ${c}:`, error.message);
            }
        }
    }
    return totalIngested;
}


// --- INTERNAL FETCHERS ---

async function fetchExternalJobs(query: string, location: string = '', country: string = 'in', workMode?: string): Promise<JobListing[]> {
    const promises = [
        fetchFromAdzuna(query, location, country, workMode),
        fetchFromJooble(query, location, country, workMode),
        fetchFromRemotive(query, location, country, workMode)
    ];

    const results = await Promise.allSettled(promises);
    const jobs: JobListing[] = [];

    results.forEach(res => {
        if (res.status === 'fulfilled') {
            jobs.push(...res.value);
        }
    });

    return jobs;
}

async function fetchFromAdzuna(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];
    const supportedCountries = ['gb', 'us', 'in', 'au', 'nz', 'ca', 'za', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'br', 'sg'];
    const safeCountry = supportedCountries.includes(country) ? country : 'us';

    // Fallback: If querying India jobs, prioritize local
    const targetCountry = country === 'in' ? 'in' : safeCountry;

    let effectiveQuery = query;
    const url = `https://api.adzuna.com/v1/api/jobs/${targetCountry}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(effectiveQuery)}&where=${encodeURIComponent(location)}`;

    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((job: any) => ({
            id: String(job.id),
            title: job.title,
            company: job.company?.display_name || "Unknown Company",
            location: job.location?.display_name || "Unknown Location",
            description: job.description,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            url: job.redirect_url,
            source: 'adzuna',
            posted_at: job.created
        }));
    } catch (e) {
        return [];
    }
}

async function fetchFromJooble(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!JOOBLE_API_KEY) return [];

    // Explicitly mention India/Bengaluru/etc if country is 'in'
    const locationParam = location || (country === 'in' ? 'India' : country);

    const body = { keywords: query, location: locationParam };
    try {
        const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.jobs || []).map((job: any) => ({
            id: String(job.id),
            title: job.title,
            company: job.company || "Unknown Company",
            location: job.location,
            description: job.snippet,
            salary_min: undefined,
            salary_max: undefined,
            url: job.link,
            source: 'jooble',
            posted_at: job.updated
        }));
    } catch (e) {
        return [];
    }
}

async function fetchFromRemotive(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (workMode && workMode !== 'remote') return [];
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.jobs || []).slice(0, 15).map((job: any) => ({
            id: String(job.id),
            title: job.title,
            company: job.company_name || "Unknown Company",
            location: job.candidate_required_location || 'Remote',
            description: job.description,
            salary_min: undefined,
            url: job.url,
            source: 'remotive',
            posted_at: job.publication_date,
            logo_url: job.company_logo
        }));
    } catch (e) {
        return [];
    }
}
