"use client";

import { useState, useMemo } from "react";
import { JobCard } from "./JobCard";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Sparkles, AlertCircle, User, Briefcase, GraduationCap } from "lucide-react";
import { calculateMatchScore } from "@/features/matching/matcher";
import { JobListing } from "@/features/jobs/jobService";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface RecommendedJob extends JobListing {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    explanation: string;
}

interface RecommendedJobsProps {
    userSkills: string[];
    jobs: JobListing[];
    internships: JobListing[];
    loading?: boolean;
}

/**
 * "Recommended for You" section
 * Shows jobs filtered and ranked by skill match.
 * Only displays jobs with >0% match.
 * Supports toggle between jobs and internships.
 */
export function RecommendedJobs({ userSkills, jobs, internships, loading }: RecommendedJobsProps) {
    const [view, setView] = useState<'jobs' | 'internships'>('jobs');

    // Calculate matches for current view (jobs or internships)
    const recommendedJobs = useMemo(() => {
        if (userSkills.length === 0) {
            return [];
        }

        const currentList = view === 'jobs' ? jobs : internships;

        if (currentList.length === 0) {
            return [];
        }

        // Calculate match scores for each job/internship
        const scoredJobs: RecommendedJob[] = [];

        for (const job of currentList) {
            const match = calculateMatchScore(
                `${job.title} ${job.description}`,
                userSkills
            );

            // Only include jobs with >0% match
            if (match.score > 0) {
                scoredJobs.push({
                    ...job,
                    matchScore: match.score,
                    matchedSkills: match.matchedSkills,
                    missingSkills: match.missingSkills.slice(0, 3),
                    explanation: match.explanation,
                });
            }
        }

        // Sort by match score (highest first)
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        // Limit to top 12
        return scoredJobs.slice(0, 12);
    }, [userSkills, jobs, internships, view]);

    // No skills state
    if (userSkills.length === 0) {
        return (
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Jobs matched based on your profile and resume.
                </p>

                <div className="bg-purple-50 border border-purple-100 rounded-xl p-8 text-center">
                    <User className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Complete Your Profile
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Add your skills to get personalized job recommendations.
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Add Skills
                    </Link>
                </div>
            </section>
        );
    }

    // Loading state
    if (loading) {
        return (
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            </section>
        );
    }

    // No matches state
    if (recommendedJobs.length === 0) {
        return (
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Jobs matched based on your profile and resume.
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                        No job matches found for your current skills. Check out &quot;Explore All Jobs&quot; below!
                    </p>
                </div>
            </section>
        );
    }

    // Main display with results
    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {recommendedJobs.length} matches
                </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-6">
                Jobs matched based on your profile and resume.
            </p>

            {/* Type Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg inline-flex items-center gap-1 border border-gray-200 mb-6">
                <button
                    onClick={() => setView('jobs')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        view === 'jobs'
                            ? "bg-white text-purple-600 shadow-sm ring-1 ring-gray-200"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                    )}
                >
                    <Briefcase className="h-4 w-4" />
                    Jobs
                    <Badge variant="secondary" className={cn(
                        "ml-1 text-xs px-1.5 py-0",
                        view === 'jobs' ? "bg-purple-50 text-purple-600" : "bg-gray-200 text-gray-500"
                    )}>
                        {jobs.length}
                    </Badge>
                </button>
                <button
                    onClick={() => setView('internships')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        view === 'internships'
                            ? "bg-white text-purple-600 shadow-sm ring-1 ring-gray-200"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                    )}
                >
                    <GraduationCap className="h-4 w-4" />
                    Internships
                    <Badge variant="secondary" className={cn(
                        "ml-1 text-xs px-1.5 py-0",
                        view === 'internships' ? "bg-purple-50 text-purple-600" : "bg-gray-200 text-gray-500"
                    )}>
                        {internships.length}
                    </Badge>
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedJobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        matchScore={job.matchScore}
                        matchedSkills={job.matchedSkills}
                        missingSkills={job.missingSkills}
                        badgeText={`${job.matchScore}% Match`}
                        badgeVariant="purple"
                    />
                ))}
            </div>
        </section>
    );
}
