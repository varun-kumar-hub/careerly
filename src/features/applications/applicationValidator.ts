import { JobListing } from "@/features/jobs/jobService";

export function validateApplicationData(job: JobListing, userId: string): { valid: boolean; error?: string } {
    if (!userId) {
        return { valid: false, error: "User ID is required" };
    }
    if (!job || !job.id || !job.title || !job.company) {
        return { valid: false, error: "Invalid job data" };
    }
    if (!job.url) {
        return { valid: false, error: "Job has no application URL" };
    }
    return { valid: true };
}
