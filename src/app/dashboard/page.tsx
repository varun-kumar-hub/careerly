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

    // Fetch Profile for personalization
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    /**
     * Personalize queries based on profile.
     * Order of priority:
     * 1. Target Roles (first role)
     * 2. First 2 Skills
     * 3. Fallback to "Software Engineer"
     */
    let jobQuery = "Software Engineer";
    if (profile?.job_roles && profile.job_roles.length > 0) {
        jobQuery = profile.job_roles[0];
    } else if (profile?.skills && profile.skills.length > 0) {
        // Just take the first few skills joined
        jobQuery = profile.skills.slice(0, 2).join(" ");
    }

    let internQuery = "Software Intern";
    if (jobQuery.toLowerCase().includes("intern")) {
        internQuery = jobQuery;
    } else if (profile?.academic_year?.toLowerCase().includes("student")) {
        internQuery = `${jobQuery} Intern`;
    }

    const latestJobsPromise = searchJobs(jobQuery, "", "in");
    const internshipsPromise = searchJobs(internQuery, "", "in");

    const [latestJobs, internships] = await Promise.all([latestJobsPromise, internshipsPromise]);

    // Take top 5 of each for high-level dashboard view
    const top5Jobs = latestJobs.slice(0, 5);
    const top5Internships = internships.slice(0, 5);

    return <DashboardClient latestJobs={top5Jobs} internships={top5Internships} />;
}
