import { createClient } from "@/utils/supabase/server";
import { JobCard } from "@/components/jobs/JobCard";
import { calculateMatchScore } from "@/features/matching/matcher";

export const dynamic = 'force-dynamic'; // Ensure latest jobs

export default async function JobsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch User Profile (Skills)
    const { data: profile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", user?.id)
        .single();

    // 2. Fetch User Resume (Skills)
    const { data: resumeAnalysis } = await supabase
        .from("resume_analysis")
        .select("extracted_skills")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    // Aggregate User Skills
    // Profile skills are CSV string or array? In migration it is text[]. In form we sent array.
    // Resume skills are text[].
    const profileSkills = profile?.skills || []; // Assuming array from DB
    const resumeSkills = resumeAnalysis?.extracted_skills || [];

    // 3. Fetch Jobs
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false })
        .limit(50); // Limit for now

    // 4. Calculate Matches
    const matchedJobs = (jobs || []).map(job => {
        const matchResult = calculateMatchScore(
            job.description || job.title, // Fallback to title if desc empty
            profileSkills,
            resumeSkills
        );
        return { ...job, matchResult };
    });

    // 5. Sort by Match Score
    matchedJobs.sort((a, b) => b.matchResult.score - a.matchResult.score);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Recommended Jobs</h1>
                <p className="text-muted-foreground">
                    Based on your profile skills ({profileSkills.length}) and resume skills ({resumeSkills.length}).
                </p>
            </div>

            <div className="grid gap-4">
                {matchedJobs.length === 0 && (
                    <div className="p-8 text-center border rounded bg-muted/20">
                        <p>No jobs found. Ask an admin to trigger ingestion.</p>
                    </div>
                )}

                {matchedJobs.map(job => (
                    <JobCard
                        key={job.id}
                        job={job}
                        matchAnalysis={job.matchResult}
                    />
                ))}
            </div>
        </div>
    );
}
