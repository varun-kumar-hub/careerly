import { createClient } from "@/utils/supabase/server";
import { searchJobs } from "@/features/jobs/jobService";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { ExploreAllJobs } from "@/features/jobs/components/ExploreAllJobs";
import { Search } from "lucide-react";

export default async function ExploreJobsPage({
    searchParams,
}: {
    searchParams: { q?: string; l?: string; mode?: string; country?: string; days?: string };
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user skills for search component
    const { data: profile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", user.id)
        .single();

    const hasProfile = (profile?.skills?.length || 0) > 0;

    // Use manual query or default to broad search
    const effectiveQuery = searchParams.q || "Software Engineer";
    const internQuery = searchParams.q ? `${searchParams.q} Intern` : "Software Intern";

    const days = parseInt(searchParams.days || "7", 10);
    const location = searchParams.l || "";
    const mode = searchParams.mode || "";
    const country = searchParams.country || "in";

    const [jobs, internships] = await Promise.all([
        searchJobs(effectiveQuery, location, country, mode, days, 'job'),
        searchJobs(internQuery, location, country, mode, days, 'internship')
    ]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="relative border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <BackButton fallbackUrl="/dashboard" />
                        <div className="flex items-center gap-3">
                            <Search className="h-6 w-6 text-blue-500" />
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                Explore All Jobs
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Explore All Jobs Section */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <ExploreAllJobs
                    jobs={jobs}
                    internships={internships}
                />
            </div>
        </div>
    );
}
