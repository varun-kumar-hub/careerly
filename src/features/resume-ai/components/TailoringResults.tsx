"use client";

import ReactMarkdown from "react-markdown";
import { Sparkles, Target, AlertCircle } from "lucide-react";

interface TailoringResultsProps {
    suggestions: string;
    error: string | null;
}

export function TailoringResults({ suggestions, error }: TailoringResultsProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[500px] flex flex-col shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-4">
                <Sparkles className="inline h-4 w-4 mr-2 text-blue-500" />
                AI Tailoring Suggestions
            </label>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {suggestions ? (
                <div className="flex-grow overflow-auto bg-white border border-gray-200 rounded-lg p-6">
                    <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown>{suggestions}</ReactMarkdown>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                    <Target className="h-16 w-16 mb-4 opacity-20 text-blue-500" />
                    <p className="text-sm text-center">
                        Paste a job description and click <br />
                        &quot;Generate Suggestions&quot; to get started
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Powered by Gemini 2.5 Flash
                    </p>
                </div>
            )}
        </div>
    );
}
