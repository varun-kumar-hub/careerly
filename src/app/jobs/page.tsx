import { redirect } from "next/navigation";

/**
 * Main Jobs Route - Redirects to Recommended Jobs
 * 
 * Users can access:
 * - /jobs/recommended - Skill-matched jobs
 * - /jobs/explore - All jobs with filters
 */
export default function JobsPage() {
    redirect("/jobs/recommended");
}
