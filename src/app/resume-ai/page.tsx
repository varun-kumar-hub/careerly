"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { tailorResumeForJob } from "@/features/resume-ai/actions";
import { Sparkles, Loader2, FileText, Target, AlertCircle, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ResumeTailorPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [suggestions, setSuggestions] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTailor = async () => {
        if (!jobDescription || jobDescription.length < 50) return;
        setLoading(true);
        setError(null);
        setSuggestions("");

        try {
            const result = await tailorResumeForJob(jobDescription);
            if (result.success) {
                setSuggestions(result.suggestions);
            } else {
                setError(result.error || "Failed to generate suggestions");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <BackButton fallbackUrl="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Target className="h-8 w-8 text-blue-500" />
                            AI Resume Tailor
                        </h1>
                        <p className="text-gray-400">
                            Get AI-powered suggestions to tailor your resume for specific jobs
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="inline h-4 w-4 mr-2" />
                                Target Job Description
                            </label>
                            <textarea
                                className="w-full h-80 bg-white border border-gray-300 rounded-lg p-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                placeholder="Paste the job description you want to apply for...

Include:
• Job title and responsibilities
• Required skills and qualifications
• Company information
• Any specific requirements"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {jobDescription.length}/50 minimum characters
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleTailor}
                                    disabled={loading || jobDescription.length < 50}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Suggestions
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Tips for Best Results
                            </h3>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>• Include the complete job description</li>
                                <li>• Make sure you&apos;ve uploaded your resume first</li>
                                <li>• The more details, the better the suggestions</li>
                            </ul>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
