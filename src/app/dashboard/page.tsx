import { createClient } from "@/utils/supabase/server";
import { searchJobs } from "@/features/jobs/jobService";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // We fetch two separate lists with specific queries.
    // Defaulting to India ('in') for the dashboard view as per new Global Search defaults.
    const latestJobsPromise = searchJobs("Software Engineer", "", "in");
    const internshipsPromise = searchJobs("Software Intern", "", "in");

    const [latestJobs, internships] = await Promise.all([latestJobsPromise, internshipsPromise]);

    // Take top 5 of each
    const top5Jobs = latestJobs.slice(0, 5);
    const top5Internships = internships.slice(0, 5);

    console.log(`[Dashboard] Fetched ${latestJobs.length} jobs and ${internships.length} internships.`);

    return <DashboardClient latestJobs={top5Jobs} internships={top5Internships} />;
}
