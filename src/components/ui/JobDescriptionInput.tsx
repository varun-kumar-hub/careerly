"use client";

import { Button } from "@/components/ui/Button";
import { FileText, Loader2, Sparkles } from "lucide-react";

interface JobDescriptionInputProps {
    jobDescription: string;
    onJobDescriptionChange: (value: string) => void;
    onGenerate: () => void;
    loading: boolean;
    minChars?: number;
    placeholder?: string;
    buttonText?: string;
    buttonColor?: string;
}

export function JobDescriptionInput({
    jobDescription,
    onJobDescriptionChange,
    onGenerate,
    loading,
    minChars = 50,
    placeholder = "Paste the job description to get relevant interview questions...\n\nThe AI will generate:\n• Behavioral questions (STAR format)\n• Technical/skill-based questions\n• Situational questions\n• Culture fit questions",
    buttonText = "Generate Questions",
    buttonColor = "bg-green-600 hover:bg-green-700"
}: JobDescriptionInputProps) {
    const characterCount = jobDescription.length;
    const isValid = characterCount >= minChars;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-2" />
                Job Description
            </label>
            <textarea
                className="w-full h-72 bg-white border border-gray-300 rounded-lg p-4 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                placeholder={placeholder}
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {characterCount}/{minChars} minimum characters
                </p>
                <Button
                    type="button"
                    onClick={onGenerate}
                    disabled={loading || !isValid}
                    className={`${buttonColor} text-white`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {buttonText}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
