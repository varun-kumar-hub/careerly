import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchMeter } from "./MatchMeter";
import { MapPin, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

interface JobCardProps {
    job: any; // Type defined in services/types ideally or DB schema
    matchAnalysis?: {
        score: number;
        missingSkills: string[];
    };
}

export function JobCard({ job, matchAnalysis }: JobCardProps) {
    return (
        <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                            {job.title}
                        </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location || "Remote"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {job.posted_date ? formatDistanceToNow(new Date(job.posted_date), { addSuffix: true }) : "Recently"}
                        </span>
                    </div>
                </div>

                {matchAnalysis && (
                    <MatchMeter score={matchAnalysis.score} />
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">{job.job_type}</Badge>
                    <Badge variant="outline" className="capitalize">{job.work_mode}</Badge>
                    <Badge variant="outline" className="capitalize">{job.source}</Badge>
                </div>
                <Button size="sm" asChild>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">View</a>
                </Button>
            </div>

            {matchAnalysis && matchAnalysis.score > 0 && matchAnalysis.score < 100 && matchAnalysis.missingSkills.length > 0 && (
                <div className="mt-4 pt-3 border-t text-xs">
                    <span className="text-muted-foreground">Missing: </span>
                    <span className="text-destructive font-medium">
                        {matchAnalysis.missingSkills.slice(0, 3).join(", ")}
                        {matchAnalysis.missingSkills.length > 3 && ` +${matchAnalysis.missingSkills.length - 3} more`}
                    </span>
                </div>
            )}
        </Card>
    );
}
