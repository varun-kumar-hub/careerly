import { JobFetcher, RawJob } from "./types";

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1"; // Default to US or make configurable

export const adzunaService: JobFetcher = {
    async fetchJobs(query: string = "developer", limit: number = 20): Promise<RawJob[]> {
        if (!APP_ID || !APP_KEY) {
            console.warn("Adzuna API credentials missing");
            return [];
        }

        try {
            const response = await fetch(
                `${BASE_URL}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=${limit}&what=${encodeURIComponent(query)}&content-type=application/json`
            );

            if (!response.ok) {
                throw new Error(`Adzuna API Error: ${response.statusText}`);
            }

            const data = await response.json();

            return data.results.map((item: any) => ({
                title: item.title,
                company_name: item.company?.display_name || "Unknown",
                location: item.location?.display_name,
                description: item.description,
                url: item.redirect_url,
                id: String(item.id),
                source: "adzuna",
                date_posted: item.created,
                job_type: "job", // Adzuna often vague, default to job
                work_mode: item.description.toLowerCase().includes("remote") ? "remote" : "onsite",
                salary: {
                    min: item.salary_min,
                    max: item.salary_max
                }
            }));
        } catch (e) {
            console.error("Adzuna Fetch Failed:", e);
            return [];
        }
    }
};
