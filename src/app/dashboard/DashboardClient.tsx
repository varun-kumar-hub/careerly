"use client";
import { useState, useTransition } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, GraduationCap, Plus, Wand2, FileText, MessageSquare, TrendingUp, CheckCircle, RefreshCw, User, Github } from "lucide-react";
import { cn } from "@/utils/cn";

import { JobListing } from "@/features/jobs/jobService";
import { calculateMatchScore } from "@/features/matching/matcher";
import { JobCard } from "@/features/jobs/components/JobCard";
import { GitHubStatsCard } from "@/features/github/GitHubStatsCard";

interface DashboardClientProps {
    latestJobs: JobListing[];
    internships: JobListing[];
    hasResume: boolean;
    applicationCount: number;
}

import { useRouter } from "next/navigation";

export function DashboardClient({ latestJobs, internships, hasResume, applicationCount }: DashboardClientProps) {
    const { profile, loading } = useProfile();
    const [view, setView] = useState<'jobs' | 'internships'>('jobs');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        {loading ? "Loading..." : `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Candidate'}!`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm">
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </Button>
                    <Button asChild className="shadow-sm">
                        <Link href="/resume">
                            {hasResume ? <RefreshCw className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                            {hasResume ? "Update Resume" : "Upload Resume"}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/resume-ai" className="group p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Resume Tailor</h3>
                    <p className="text-xs text-slate-500 mt-1">Customize for jobs</p>
                </Link>
                <Link href="/cover-letter" className="group p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-100 transition-colors">
                        <Wand2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Cover Letter</h3>
                    <p className="text-xs text-slate-500 mt-1">Generate with AI</p>
                </Link>
                <Link href="/interview" className="group p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-3 group-hover:bg-green-100 transition-colors">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Interview Prep</h3>
                    <p className="text-xs text-slate-500 mt-1">Practice questions</p>
                </Link>
                <Link href="/skill-gap" className="group p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-3 group-hover:bg-orange-100 transition-colors">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Skill Gap</h3>
                    <p className="text-xs text-slate-500 mt-1">Analyze missing skills</p>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Resume Status Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-3", hasResume ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600")}>
                        {hasResume ? <CheckCircle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <h3 className="font-bold text-slate-900">Resume Status</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">
                        {hasResume ? "Your resume is active and ready." : "Upload your resume to get started."}
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full mt-auto">
                        <Link href="/resume">{hasResume ? "Review Analysis" : "Upload Now"}</Link>
                    </Button>
                </div>

                {/* Applications Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">Applications</h3>
                    <div className="text-3xl font-bold text-slate-900 my-2">{applicationCount}</div>
                    <p className="text-sm text-slate-500 mb-4">Active applications active</p>

                </div>

                {/* Github / Profile Card */}
                {profile?.github_username ? (
                    <GitHubStatsCard username={profile.github_username} />
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-900">Complete Profile</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Connect GitHub to see your stats.</p>
                        <Button variant="outline" size="sm" asChild className="w-full mt-auto">
                            <Link href="/profile">Edit Profile</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="pt-4 space-y-6" id="job-recommendations-section">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            {view === 'jobs' ? 'Recommended for You' : 'Top Internships'}
                        </h2>
                        {/* Pill Toggle */}
                        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setView('jobs')}
                                className={cn("px-3 py-1 text-sm font-medium rounded-md transition-all", view === 'jobs' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}
                            >Jobs</button>
                            <button
                                onClick={() => setView('internships')}
                                className={cn("px-3 py-1 text-sm font-medium rounded-md transition-all", view === 'internships' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}
                            >Internships</button>
                        </div>
                    </div>
                </div>

                {view === 'jobs' ? (
                    latestJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                            <Briefcase className="h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">No jobs found matching your profile.</p>
                            <Button variant="link" className="text-primary mt-2" asChild>
                                <Link href="/jobs">Explore all jobs</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                            <GraduationCap className="h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">No internships found matching your profile.</p>
                            <Button variant="link" className="text-primary mt-2" asChild>
                                <Link href="/jobs?q=intern">Explore internships</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

                <div className="flex justify-center pt-8 pb-4">
                    <Link href={view === 'jobs' ? "/jobs" : "/jobs?q=intern"} className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        View all {view === 'jobs' ? 'Jobs' : 'Internships'}
                        <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
