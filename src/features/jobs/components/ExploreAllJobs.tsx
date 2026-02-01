"use client";

import { useState } from "react";
import { JobCard } from "@/features/jobs/components/JobCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Globe, Briefcase, GraduationCap, MapPin, Search } from "lucide-react";
import { JobListing } from "@/features/jobs/jobService";
import { cn } from "@/utils/cn";

interface ExploreAllJobsProps {
    jobs: JobListing[];
    internships: JobListing[];
    loading?: boolean;
}

/**
 * "Explore All Jobs" section
 * Shows ALL jobs without skill-based filtering.
 * Sorted by date (newest first).
 * Supports manual filters only.
 */
export function ExploreAllJobs({ jobs, internships, loading }: ExploreAllJobsProps) {
    const [view, setView] = useState<'jobs' | 'internships'>('jobs');
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    const currentList = view === 'jobs' ? jobs : internships;

    // Apply manual filters (NOT skill-based)
    const filteredList = currentList.filter((job) => {
        const matchesSearch = !searchQuery ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation = !locationFilter ||
            job.location.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesSearch && matchesLocation;
    });

    return (
        <section className="mt-12">
            <div className="flex items-center gap-3 mb-2">
                <Globe className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">Explore All Jobs</h2>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {jobs.length + internships.length} total
                </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-6">
                All available jobs from our sources, regardless of your skills.
            </p>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Type Toggle */}
                <div className="bg-gray-100 p-1 rounded-lg inline-flex items-center gap-1 border border-gray-200">
                    <button
                        onClick={() => setView('jobs')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
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
                            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
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

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* Location Filter */}
                <div className="relative flex-1 max-w-xs">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* Clear Filters */}
                {(searchQuery || locationFilter) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery('');
                            setLocationFilter('');
                        }}
                        className="text-gray-500"
                    >
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            )}

            {/* Jobs Grid */}
            {!loading && filteredList.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredList.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredList.length === 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {searchQuery || locationFilter
                            ? "No jobs match your filters. Try adjusting your search."
                            : "No jobs available at the moment. Check back soon!"}
                    </p>
                </div>
            )}
        </section>
    );
}
