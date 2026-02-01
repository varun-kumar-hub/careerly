"use client";

import { useState } from "react";
import { JobListing } from "@/features/jobs/jobService";
import { RecommendedJobs } from "@/features/jobs/components/RecommendedJobs";
import { ExploreAllJobs } from "@/features/jobs/components/ExploreAllJobs";
import { JobsSearch } from "@/features/jobs/components/JobsSearch";

interface DualJobDisplayProps {
    jobs: JobListing[];
    internships: JobListing[];
    userSkills: string[];
    query: string;
    isManualSearch: boolean;
    hasProfile: boolean;
}

/**
 * Dual Job Display System
 * 
 * Combines both sections:
 * 1. Recommended for You - filtered by skill match
 * 2. Explore All Jobs - unfiltered, all jobs
 */
export function DualJobDisplay({
    jobs,
    internships,
    userSkills,
    query,
    isManualSearch,
    hasProfile
}: DualJobDisplayProps) {
    // Combine all jobs for recommendation matching
    const allJobs = [...jobs, ...internships];

    return (
        <div className="space-y-8">
            {/* Section 1: Recommended for You (Filtered) */}
            <RecommendedJobs
                userSkills={userSkills}
                jobs={allJobs}
            />

            {/* Section 2: Explore All Jobs (Unfiltered) */}
            <ExploreAllJobs
                jobs={jobs}
                internships={internships}
            />
        </div>
    );
}
