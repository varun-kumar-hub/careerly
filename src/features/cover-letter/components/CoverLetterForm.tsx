"use client";

import { Button } from "@/components/ui/Button";
import { FileText, Loader2, Sparkles } from "lucide-react";

interface CoverLetterFormProps {
    jobDescription: string;
    onJobDescriptionChange: (value: string) => void;
    onGenerate: () => void;
    loading: boolean;
    hasResume: boolean;
}

export function CoverLetterForm({
    jobDescription,
    onJobDescriptionChange,
    onGenerate,
    loading,
    hasResume
}: CoverLetterFormProps) {
    const characterCount = jobDescription.length;
    const minChars = 50;
    const isValid = characterCount >= minChars;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
            </label>
            <textarea
                className="w-full h-64 bg-white border border-gray-300 rounded-lg p-4 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                placeholder="Paste the job requirements here... (minimum 50 characters)"
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {hasResume ? (
                        <span className="text-green-400">✓ Resume Loaded</span>
                    ) : (
                        <span className="text-yellow-400">No Resume Found</span>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={onGenerate}
                    disabled={loading || !isValid}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                        </>
                    )}
                </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
                {characterCount}/{minChars} minimum characters
            </p>
        </div>
    );
}
