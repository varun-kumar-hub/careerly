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

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

// Default freshness: 1 day (Today/Yesterday) to satisfy "fetch from this particular time"
const DEFAULT_MAX_DAYS = 1;

export async function searchJobs(query: string, location: string = '', country: string = 'in', workMode?: string, maxDays: number = DEFAULT_MAX_DAYS): Promise<JobListing[]> {
    if (!query) return [];

    // Normalize location
    const rawLocation = location || '';
    // If strict validation is needed we can use it, but for global search we often want to be permissive
    // const safeLocation = validateLocation(rawLocation) ? normalizeLocation(rawLocation) : ''; 
    const safeLocation = rawLocation;

    // Parallel Fetch
    const promises = [
        fetchFromAdzuna(query, safeLocation, country, workMode),
        fetchFromJooble(query, safeLocation, country, workMode),
        fetchFromRemotive(query, safeLocation, country, workMode)
    ];

    const results = await Promise.allSettled(promises);
    const jobs: JobListing[] = [];

    results.forEach(res => {
        if (res.status === 'fulfilled') {
            jobs.push(...res.value);
        } else {
            console.error("Job Fetch Error:", res.reason);
        }
    });

    // Freshness & Deduplication Filter
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - maxDays);

    const uniqueJobsMap = new Map<string, JobListing>();

    for (const job of jobs) {
        // 1. Freshness Check
        if (job.posted_at) {
            const postedDate = new Date(job.posted_at);
            // If invalid date or older than cutoff, skip
            if (isNaN(postedDate.getTime()) || postedDate < cutoffDate) {
                continue;
            }
            // Future date check (sanity check)
            if (postedDate > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
                continue;
            }
        }

        // 2. Work Mode Post-Filter (if API doesn't support it strictly)
        if (workMode && workMode.toLowerCase() === 'remote') {
            const isRemote = job.location.toLowerCase().includes('remote') || job.description.toLowerCase().includes('remote');
            if (!isRemote) continue;
        }

        // 3. Deduplication (Url based)
        if (!uniqueJobsMap.has(job.url)) {
            uniqueJobsMap.set(job.url, job);
        }
    }

    return Array.from(uniqueJobsMap.values());
}

async function fetchFromAdzuna(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];

    // Adzuna requires supported country codes. Default to 'us' if not found or map 'in' to 'in'.
    // Supported: gb, us, in, au, nz, ca, za, fr, de, it, nl, pl, ru, br, sg
    const supportedCountries = ['gb', 'us', 'in', 'au', 'nz', 'ca', 'za', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'br', 'sg'];
    const safeCountry = supportedCountries.includes(country) ? country : 'us';

    let effectiveQuery = query;
    const url = `https://api.adzuna.com/v1/api/jobs/${safeCountry}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(effectiveQuery)}&where=${encodeURIComponent(location)}`;

    try {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 300 } // Cache for 5 minutes to avoid rate limits
        });
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
            posted_at: job.created // ISO format usually
        }));
    } catch (e) {
        console.error("Adzuna Error", e);
        return [];
    }
}

async function fetchFromJooble(query: string, location: string, country: string, workMode?: string): Promise<JobListing[]> {
    if (!JOOBLE_API_KEY) return [];

    // Jooble uses one endpoint, country creates relevance? Or strictly one endpoint?
    // Jooble documentation implies generic endpoint, but location creates the filter.
    // However, Jooble might filter by IP if not specified? 
    // Just pass the location + country name if possible, or just location.

    const body = {
        keywords: query,
        location: location || country // fallback to country name if no city
    };

    try {
        const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            next: { revalidate: 3600 } // Cache for 1 hour
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
        console.error("Jooble Error", e);
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

        let jobs = data.jobs || [];

        // Filter by location/country if specified
        // Remotive is "Remote", but often restricts to "USA Only" etc.
        // If user selected 'in' (India), filtering Remotive jobs that are 'Worldwide' or 'India' is tricky without parsing.
        // We'll skip complex parsing for now and just return them, as "Remote" is often global.

        return jobs.slice(0, 15).map((job: any) => ({
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
        console.error("Remotive Error", e);
        return [];
    }
}
