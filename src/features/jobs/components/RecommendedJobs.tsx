"use client";

import { useState, useMemo } from "react";
import { JobCard } from "./JobCard";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Sparkles, AlertCircle, User } from "lucide-react";
import { calculateMatchScore } from "@/features/matching/matcher";
import { JobListing } from "@/features/jobs/jobService";
import Link from "next/link";

interface RecommendedJob extends JobListing {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    explanation: string;
}

interface RecommendedJobsProps {
    userSkills: string[];
    jobs: JobListing[];
    loading?: boolean;
}

/**
 * "Recommended for You" section
 * Shows jobs filtered and ranked by skill match.
 * Only displays jobs with >0% match.
 */
export function RecommendedJobs({ userSkills, jobs, loading }: RecommendedJobsProps) {
    const recommendedJobs = useMemo(() => {
        if (userSkills.length === 0 || jobs.length === 0) {
            return [];
        }

        // Calculate match scores for each job
        const scoredJobs: RecommendedJob[] = [];

        for (const job of jobs) {
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
    }, [userSkills, jobs]);

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

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {recommendedJobs.length} matches
                    </Badge>
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
                Jobs matched based on your profile and resume.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedJobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        matchAnalysis={{
                            score: job.matchScore,
                            matchedSkills: job.matchedSkills,
                            missingSkills: job.missingSkills,
                            explanation: job.explanation,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
