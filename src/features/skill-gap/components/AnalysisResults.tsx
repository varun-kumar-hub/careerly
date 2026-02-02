"use client";

import ReactMarkdown from "react-markdown";
import { TrendingUp, BarChart3 } from "lucide-react";

interface AnalysisResultsProps {
    analysis: string;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    if (!analysis) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center">
                <BarChart3 className="h-16 w-16 mb-4 opacity-20 text-orange-500" />
                <p className="text-sm text-gray-500 text-center">
                    Paste a job description to see how <br />
                    your skills match up
                </p>
                <p className="text-xs text-gray-600 mt-2">
                    Powered by Gemini 2.5 Flash
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Full Analysis & Recommendations
            </h3>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 max-h-[300px] overflow-auto">
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
