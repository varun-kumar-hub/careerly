"use client";

import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, GraduationCap, Plus, Wand2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { JobListing } from "@/features/jobs/jobService";
import { calculateMatchScore } from "@/features/matching/matcher";
import { JobCard } from "@/components/jobs/JobCard";
import { GitHubStatsCard } from "@/features/github/GitHubStatsCard";

interface DashboardClientProps {
    latestJobs: JobListing[];
    internships: JobListing[];
}

import { useRouter } from "next/navigation";

export function DashboardClient({ latestJobs, internships }: DashboardClientProps) {
    const { profile, loading } = useProfile();
    const [view, setView] = useState<'jobs' | 'internships'>('jobs');
    const router = useRouter();

    return (
        <div className="space-y-8 bg-white min-h-screen p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">
                        {loading ? "Loading..." : `Welcome back, ${profile?.full_name || 'candidate'}!`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild className="border-gray-200 text-gray-700 hover:bg-gray-50">
                        <Link href="/profile">View Profile</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                        <Link href="/resume">
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Resume
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="AI Cover Letter" className="text-gray-500 hover:text-primary hover:bg-primary/10">
                        <Link href="/cover-letter">
                            <span className="sr-only">Cover Letter</span>
                            <Wand2 className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Profile Completion Prompt */}
            {!loading && profile && (!profile.skills || profile.skills.length === 0) && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-semibold">Complete your profile</h3>
                        <p className="text-sm text-blue-600">Add your skills and preferences to get better job matches.</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-sm"
                        onClick={() => router.push("/onboarding")}
                    >
                        Complete Now
                    </Button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight text-gray-900">Resume Status</h3>
                    <p className="text-sm text-gray-500 mt-2">No active resume uploaded.</p>
                    <Button variant="link" className="px-0 mt-4 h-auto text-primary" asChild>
                        <Link href="/resume">Upload now &rarr;</Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight text-gray-900">Job Recommendations</h3>
                    <p className="text-sm text-gray-500 mt-2">Complete your profile and resume to see matches.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight text-gray-900">Applications</h3>
                    <div className="text-2xl font-bold mt-2 text-gray-900">0</div>
                    <p className="text-xs text-gray-500">Active applications</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 text-gray-900">AI Cover Letter</h3>
                    <p className="text-sm text-gray-500 mb-4">Generate a tailored cover letter instantly.</p>
                    <Button variant="secondary" size="sm" asChild className="w-full bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200">
                        <Link href="/cover-letter">
                            <Wand2 className="mr-2 h-4 w-4" />
                            Create New
                        </Link>
                    </Button>
                </div>

                {profile?.github_username && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <GitHubStatsCard username={profile.github_username} />
                    </div>
                )}
            </div>

            {/* Jobs/Internships Toggle & Grid */}
            <div className="mt-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {view === 'jobs' ? 'Recommended Jobs' : 'Top Internships'}
                    </h2>

                    {/* Toggle */}
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
                                {latestJobs.length}
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
                </div>

                {/* Content Grid */}
                {view === 'jobs' ? (
                    latestJobs.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-500">No recent jobs found. Try searching for specific roles.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {latestJobs.map(job => {
                                const userSkills = new Set<string>(profile?.skills || []);
                                const match = calculateMatchScore(
                                    `${job.title} ${job.description}`,
                                    Array.from(userSkills)
                                );
                                return <JobCard key={job.id} job={job} matchAnalysis={match} />;
                            })}
                        </div>
                    )
                ) : (
                    internships.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-500">No recent internships found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {internships.map(job => {
                                const userSkills = new Set<string>(profile?.skills || []);
                                const match = calculateMatchScore(
                                    `${job.title} ${job.description}`,
                                    Array.from(userSkills)
                                );
                                return <JobCard key={job.id} job={job} matchAnalysis={match} />;
                            })}
                        </div>
                    )
                )}

                <div className="text-center pt-4">
                    <Button variant="link" asChild className="text-blue-600">
                        <Link href={view === 'jobs' ? "/jobs" : "/jobs?q=intern"}>
                            View All {view === 'jobs' ? 'Jobs' : 'Internships'} &rarr;
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
