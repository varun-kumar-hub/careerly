"use client";

interface MatchScoreCardProps {
    matchPercentage: number;
}

export function MatchScoreCard({ matchPercentage }: MatchScoreCardProps) {
    if (matchPercentage === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Match Score</h3>
                <span className={`text-3xl font-bold ${matchPercentage >= 70 ? "text-green-500" :
                    matchPercentage >= 40 ? "text-yellow-500" : "text-red-500"
                    }`}>
                    {matchPercentage}%
                </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${matchPercentage >= 70 ? "bg-green-500" :
                        matchPercentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                    style={{ width: `${matchPercentage}%` }}
                />
            </div>
        </div>
    );
}
