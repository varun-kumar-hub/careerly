import { JobFetcher, RawJob } from "./types";

const BASE_URL = "https://remotive.com/api/remote-jobs";

export const remotiveService: JobFetcher = {
    async fetchJobs(query: string = "software", limit: number = 20): Promise<RawJob[]> {
        try {
            const response = await fetch(`${BASE_URL}?search=${encodeURIComponent(query)}&limit=${limit}`);

            if (!response.ok) {
                // Remotive often 200 even if empty, but check status
                throw new Error(`Remotive API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const jobs = data.jobs || [];

            return jobs.slice(0, limit).map((item: any) => ({
                title: item.title,
                company_name: item.company_name,
                location: item.candidate_required_location,
                description: item.description,
                url: item.url,
                id: String(item.id),
                source: "remotive",
                date_posted: item.publication_date,
                job_type: item.job_type === "full_time" ? "job" : "internship", // Rough mapping
                work_mode: "remote", // Remotive is all remote
                salary: {
                    min: undefined,
                    max: undefined // Remotive salary data structure varies or is in description
                }
            }));

        } catch (e) {
            console.error("Remotive Fetch Failed:", e);
            return [];
        }
    }
};
