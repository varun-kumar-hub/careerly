import { createClient } from "@/utils/supabase/server";
import { getPersonalizedJobs } from "@/features/jobs/jobService";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch Personalized Jobs & Internships
    // This logic now accounts for Profile Skills + Resume Skills + Preferences
    const latestJobsPromise = getPersonalizedJobs(user.id, 'job');
    const internshipsPromise = getPersonalizedJobs(user.id, 'internship');

    const [latestJobs, internships] = await Promise.all([latestJobsPromise, internshipsPromise]);

    // Take top 5 of each for high-level dashboard view
    const top5Jobs = latestJobs.slice(0, 5);
    const top5Internships = internships.slice(0, 5);

    // Check for active resume
    const { data: resume } = await supabase
        .from('resume_analysis')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .order('created_at', { ascending: false });

    const hasResume = !!(resume && resume.length > 0);

    // Fetch Application Count
    const { count: applicationCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return <DashboardClient latestJobs={top5Jobs} internships={top5Internships} hasResume={hasResume} applicationCount={applicationCount || 0} />;
}


