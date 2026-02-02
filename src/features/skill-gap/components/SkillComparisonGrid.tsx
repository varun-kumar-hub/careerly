"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface SkillComparisonGridProps {
    matchedSkills: string[];
    skillGaps: string[];
}

export function SkillComparisonGrid({ matchedSkills, skillGaps }: SkillComparisonGridProps) {
    if (matchedSkills.length === 0 && skillGaps.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Matched Skills
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    {matchedSkills.map((skill, idx) => (
                        <li key={idx}>• {skill}</li>
                    ))}
                </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Skill Gaps
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    {skillGaps.map((skill, idx) => (
                        <li key={idx}>• {skill}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
