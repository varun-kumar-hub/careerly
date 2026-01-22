import { JobFetcher, RawJob } from "./types";

const API_KEY = process.env.JOOBLE_API_KEY;
const BASE_URL = "https://jooble.org/api/";

export const joobleService: JobFetcher = {
    async fetchJobs(query: string = "developer", limit: number = 20): Promise<RawJob[]> {
        if (!API_KEY) {
            console.warn("Jooble API Key missing");
            return [];
        }

        try {
            // Jooble uses POST
            const response = await fetch(`${BASE_URL}${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    keywords: query,
                    location: "Remote", // Or configured
                    page: 1,
                    resultonpage: limit
                })
            });

            if (!response.ok) {
                throw new Error(`Jooble API Error: ${response.statusText}`);
            }

            const data = await response.json();

            return (data.jobs || []).map((item: any) => ({
                title: item.title,
                company_name: item.company,
                location: item.location,
                description: item.snippet, // Jooble gives snippet often, or 'content' if requested? Usually snippet.
                url: item.link,
                id: item.id || String(Math.random()), // Jooble ID might need check
                source: "jooble",
                date_posted: item.updated,
                job_type: "job",
                work_mode: item.location.toLowerCase().includes("remote") ? "remote" : "onsite",
            }));

        } catch (e) {
            console.error("Jooble Fetch Failed:", e);
            return [];
        }
    }
};
