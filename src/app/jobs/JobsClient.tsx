"use client";

import { useState } from "react";
import { JobListing } from "@/features/jobs/jobService";
import { calculateMatchScore, MatchResult } from "@/features/matching/matcher";
import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/utils/cn";

interface JobsClientProps {
    jobs: JobListing[];
    internships: JobListing[];
    userSkills: Set<string>;
    query: string;
    isManualSearch: boolean;
    hasProfile: boolean;
}

export function JobsClient({ jobs, internships, userSkills, query, isManualSearch, hasProfile }: JobsClientProps) {
    const [view, setView] = useState<'jobs' | 'internships'>('jobs');

    const currentList = view === 'jobs' ? jobs : internships;
    const currentLabel = view === 'jobs' ? "Jobs" : "Internships";

    return (
        <div className="space-y-6">
            {/* Toggle Bar */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex items-center gap-1 border border-gray-200">
                    <button
                        onClick={() => setView('jobs')}
                        className={cn(
                            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            view === 'jobs'
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                        )}
                    >
                        <Briefcase className="h-4 w-4" />
                        Jobs
                        <Badge variant="secondary" className={cn(
                            "ml-1 text-xs px-1.5 py-0",
                            view === 'jobs' ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"
                        )}>
                            {jobs.length}
                        </Badge>
                    </button>
                    <button
                        onClick={() => setView('internships')}
                        className={cn(
                            "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            view === 'internships'
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                        )}
                    >
                        <GraduationCap className="h-4 w-4" />
                        Internships
                        <Badge variant="secondary" className={cn(
                            "ml-1 text-xs px-1.5 py-0",
                            view === 'internships' ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"
                        )}>
                            {internships.length}
                        </Badge>
                    </button>
                </div>
            </div>

            {/* Header for Section */}
            <div className="flex items-center gap-2 mt-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isManualSearch ? `${currentLabel} for "${query}"` : hasProfile ? `Recommended ${currentLabel}` : `Top ${currentLabel}`}
                </h2>
            </div>

            {/* Grid */}
            {currentList.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {currentList.map(job => {
                        const match = calculateMatchScore(
                            `${job.title} ${job.description}`,
                            Array.from(userSkills)
                        );
                        return <JobCard key={job.id} job={job} matchAnalysis={match} />;
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        {view === 'jobs' ? <Briefcase className="h-8 w-8 text-gray-400" /> : <GraduationCap className="h-8 w-8 text-gray-400" />}
                    </div>
                    <p className="text-gray-900 font-medium">No {currentLabel.toLowerCase()} found.</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters.</p>
                </div>
            )}
        </div>
    );
}
