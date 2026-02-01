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
import { JobCard } from "@/features/jobs/components/JobCard";
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

                {/* AI Cover Letter */}
                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 text-gray-900 flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-purple-500" />
                        AI Cover Letter
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Generate a tailored cover letter instantly.</p>
                    <Button variant="secondary" size="sm" asChild className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200">
                        <Link href="/cover-letter">Create New</Link>
                    </Button>
                </div>

                {/* AI Resume Tailor */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 text-gray-900 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI Resume Tailor
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Tailor your resume for specific job postings.</p>
                    <Button variant="secondary" size="sm" asChild className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200">
                        <Link href="/resume-ai">Tailor Resume</Link>
                    </Button>
                </div>

                {/* Interview Prep */}
                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 text-gray-900 flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Interview Prep
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Practice with AI-generated interview questions.</p>
                    <Button variant="secondary" size="sm" asChild className="w-full bg-green-100 text-green-700 hover:bg-green-200 border border-green-200">
                        <Link href="/interview">Start Practice</Link>
                    </Button>
                </div>

                {/* Skill Gap Analysis */}
                <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 text-gray-900 flex items-center gap-2">
                        <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Skill Gap Analysis
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Compare your skills to job requirements.</p>
                    <Button variant="secondary" size="sm" asChild className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200">
                        <Link href="/skill-gap">Analyze Skills</Link>
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
