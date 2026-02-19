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
    const isHighMatch = matchAnalysis && matchAnalysis.score > 70;

    return (
        <Card className="group relative flex flex-col h-full border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 rounded-xl overflow-hidden">
            {/* Top match indicator strip */}
            {isHighMatch && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
            )}

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4">
                        {job.logo_url ? (
                            <img src={job.logo_url} alt={job.company} className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-gray-100 shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-100">
                                {(job.company || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-1" title={job.title}>
                                {job.title}
                            </h3>
                            <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-1 hover:text-primary transition-colors"
                            >
                                <Building className="h-3.5 w-3.5" />
                                {job.company}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {job.location}
                    </span>
                    {job.salary_min && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                            ${job.salary_min.toLocaleString()}
                        </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100 capitalize">
                        {job.source}
                    </span>
                </div>

                {/* Match Analysis - Simplified & Cleaner */}
                {matchAnalysis && matchAnalysis.score > 0 && (
                    <div className="mt-auto mb-5 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Badge variant={isHighMatch ? "default" : "secondary"} className="text-xs font-semibold">
                                    {matchAnalysis.score}% Match
                                </Badge>
                            </div>
                        </div>

                        {/* Highlights/Gaps Summary */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {matchAnalysis.explanation}
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
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
