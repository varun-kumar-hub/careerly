import { createClient } from "@/utils/supabase/server";
import { searchJobs } from "@/features/jobs/jobService";
import { calculateMatchScore } from "@/features/matching/matcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, Search } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { LocationFilter } from "@/components/jobs/LocationFilter";
import { BackButton } from "@/components/ui/BackButton";
import { JobsClient } from "./JobsClient";
import { JobsSearch } from "@/components/jobs/JobsSearch";

export default async function JobsPage({
    searchParams,
}: {
    searchParams: { q?: string; l?: string; mode?: string; country?: string; days?: string };
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // 1. Fetch User Data (Profile + Resume) for Matching
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

    // 2. Determine Search Query (Smart Filtering)
    // If user provided a manual query (searchParams.q), use it.
    // Else if user has profile/skills, use them.
    // Else show generic "Top Jobs".

    let effectiveQuery = searchParams.q || "";
    const isManualSearch = !!searchParams.q;
    const hasProfile = userSkills.size > 0;
    const showAll = searchParams.q === 'all'; // Special flag to bypass filtering

    if (showAll) {
        effectiveQuery = ""; // Clear query to show everything
    } else if (!effectiveQuery && hasProfile) {
        // Smart Default: Pick top 2 skills or fallback to "Software"
        const topSkills = Array.from(userSkills).slice(0, 2).join(" ");
        effectiveQuery = topSkills;
    }

    // If still empty (no profile, no search), defaults below will handle it:
    // We will fetch "Software Engineer" for jobs and "Software Intern" for internships as broad defaults.

    const days = parseInt(searchParams.days || "7", 10);

    const jobQuery = effectiveQuery || "Software Engineer";
    const internQuery = effectiveQuery || "Software Intern";

    const location = searchParams.l || "";
    const mode = searchParams.mode || "";
    const country = searchParams.country || "in";

    const [jobs, internships] = await Promise.all([
        searchJobs(jobQuery, location, country, mode, days, 'job'),
        searchJobs(internQuery, location, country, mode, days, 'internship')
    ]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero / Filter Section */}
            <div className="relative border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            <BackButton fallbackUrl="/dashboard" />
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">Find Top Roles</h1>
                        </div>
                        {hasProfile && !isManualSearch && (searchParams.q !== 'all') && (
                            <Link href="/jobs?q=all" className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                                View all jobs
                            </Link>
                        )}
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

            {/* Results Grid - Using Client Toggle */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <JobsClient
                    jobs={jobs}
                    internships={internships}
                    userSkills={userSkills}
                    query={effectiveQuery}
                    isManualSearch={isManualSearch}
                    hasProfile={hasProfile}
                />
            </div>
        </div>
    );
}
