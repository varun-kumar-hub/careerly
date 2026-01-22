export interface RawJob {
    title: string;
    company_name: string;
    location?: string;
    description: string;
    url: string;
    id: string; // Remote ID
    source: "adzuna" | "remotive" | "jooble" | "other";
    date_posted: string; // ISO string
    job_type?: "job" | "internship";
    work_mode?: "remote" | "onsite" | "hybrid";
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
    };
}

export interface JobFetcher {
    fetchJobs(query: string, limit?: number): Promise<RawJob[]>;
}
