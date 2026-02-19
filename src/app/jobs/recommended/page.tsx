import { createClient } from "@/utils/supabase/server";
import { searchJobs } from "@/features/jobs/jobService";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { JobsSearch } from "@/features/jobs/components/JobsSearch";
import { RecommendedJobs } from "@/features/jobs/components/RecommendedJobs";
import { Sparkles, Briefcase } from "lucide-react";

export default async function RecommendedJobsPage({
    searchParams,
}: {
    searchParams: { q?: string; l?: string; mode?: string; country?: string; days?: string };
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch User Skills
    const { data: profile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", user.id)
        .single();

    const { data: resume } = await supabase
        .from("resume_analysis")
        .select("extracted_skills")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    const userSkills = new Set<string>([
        ...(profile?.skills || []),
        ...(resume?.extracted_skills || [])
    ]);

    const userSkillsArray = Array.from(userSkills);
    const hasProfile = userSkills.size > 0;

    // Smart query based on user skills
    let effectiveQuery = searchParams.q || "";

    if (!effectiveQuery && hasProfile) {
        const topSkills = userSkillsArray.slice(0, 2).join(" ");
        effectiveQuery = topSkills;
    }

    const days = parseInt(searchParams.days || "7", 10);
    const jobQuery = effectiveQuery || "Software Engineer";
    const internQuery = effectiveQuery ? `${effectiveQuery} Intern` : "Software Intern";
    const location = searchParams.l || "";
    const mode = searchParams.mode || "";
    const country = searchParams.country || "in";

    const [jobs, internships] = await Promise.all([
        searchJobs(jobQuery, location, country, mode, days, 'job'),
        searchJobs(internQuery, location, country, mode, days, 'internship')
    ]);

    const allJobs = [...jobs, ...internships];

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="relative border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <BackButton fallbackUrl="/dashboard" />
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-purple-500" />
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                Recommended Jobs
                            </h1>
                        </div>
                    </div>

                    <div className="w-full">
                        <JobsSearch
                            defaultQuery={searchParams.q || ""}
                            defaultLocation={searchParams.l || ""}
                            hasProfile={hasProfile}
                        />
                    </div>
                </div>
            </div>

            {/* Recommended Jobs Section */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <RecommendedJobs
                    userSkills={userSkillsArray}
                    jobs={jobs}
                    internships={internships}
                />
            </div>
        </div>
    );
}
