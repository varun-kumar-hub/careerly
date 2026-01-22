import { cn } from "@/utils/cn";

interface MatchMeterProps {
    score: number;
    className?: string;
}

export function MatchMeter({ score, className }: MatchMeterProps) {
    let colorClass = "text-red-500";
    let bgClass = "bg-red-100";

    if (score >= 80) {
        colorClass = "text-emerald-500";
        bgClass = "bg-emerald-100";
    } else if (score >= 50) {
        colorClass = "text-amber-500";
        bgClass = "bg-amber-100";
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("relative h-10 w-10 flex items-center justify-center rounded-full font-bold text-xs", bgClass, colorClass)}>
                {score}%
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Match</span>
        </div>
    );
}
