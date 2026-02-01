import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JobListing } from "@/features/jobs/jobService";
import { MatchResult } from "@/features/matching/matcher";
import { MapPin, Building, Calendar, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApplyButton } from "./ApplyButton";

interface JobCardProps {
    job: JobListing;
    matchAnalysis?: MatchResult;
}

/**
 * Component to display a single job listing card.
 * Shows match score, explanation, and missing skills if available.
 */
export function JobCard({ job, matchAnalysis }: JobCardProps) {
    const sourceColors = {
        adzuna: "bg-green-50 text-green-700 border-green-200",
        jooble: "bg-orange-50 text-orange-700 border-orange-200",
        remotive: "bg-blue-50 text-blue-700 border-blue-200",
        mock: "bg-gray-50 text-gray-600 border-gray-200"
    };

    return (
        <Card className="group relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-md">
            {/* Hover Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4">
                        {job.logo_url ? (
                            <img src={job.logo_url} alt={job.company} className="w-12 h-12 rounded-lg object-contain bg-white p-1 box-content border border-gray-100" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                                {(job.company || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2" title={job.title}>
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                    {job.title}
                                </a>
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Building className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium">{job.company}</span>
                            </div>
                        </div>
                    </div>
                    {matchAnalysis && matchAnalysis.score > 0 && (
                        <div className="flex flex-col items-end shrink-0">
                            <Badge
                                variant={matchAnalysis.score > 70 ? "default" : matchAnalysis.score > 40 ? "secondary" : "outline"}
                                className={`text-sm px-2.5 py-0.5 border ${matchAnalysis.score > 70 ? "bg-green-50 text-green-700 border-green-200" :
                                    matchAnalysis.score > 40 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}
                            >
                                {matchAnalysis.score}% Match
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${sourceColors[job.source] || sourceColors.mock}`}>
                        {job.source}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {job.location}
                    </span>
                    {job.salary_min && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            ${job.salary_min.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Why This Job? - Only for matched jobs */}
                {matchAnalysis && matchAnalysis.score > 0 && (
                    <div className="mb-4 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-700 mb-1">
                            <Lightbulb className="h-3.5 w-3.5" />
                            Why this job?
                        </div>
                        <p className="text-xs text-gray-600">
                            {matchAnalysis.explanation}
                        </p>
                        {matchAnalysis.matchedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {matchAnalysis.matchedSkills.slice(0, 4).map((skill, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Missing Skills - Only for matched jobs with gaps */}
                {matchAnalysis && matchAnalysis.missingSkills.length > 0 && (
                    <div className="mb-4 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Skills to learn:
                            <span className="text-gray-600 font-normal">
                                {matchAnalysis.missingSkills.slice(0, 3).join(", ")}
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="text-xs text-gray-400" suppressHydrationWarning>
                        {getRelativeTime(job.posted_at)}
                    </span>
                    <ApplyButton job={job} />
                </div>
            </div>
        </Card>
    );
}

function getRelativeTime(dateString?: string) {
    if (!dateString) return "Recently posted";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently posted";

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals = {
        yr: 31536000,
        mth: 2592000,
        wk: 604800,
        day: 86400,
        hr: 3600,
        min: 60
    };

    if (seconds < 60) return "Just now";

    for (const [key, secondsPerUnit] of Object.entries(intervals)) {
        const count = Math.floor(seconds / secondsPerUnit);
        if (count >= 1) {
            // Basic pluralization
            const unit = key === 'mth' ? 'month' : key === 'wk' ? 'week' : key === 'yr' ? 'year' : key;
            return `Posted ${count} ${unit}${count > 1 ? 's' : ''} ago`;
        }
    }
    return "Recently posted";
}
