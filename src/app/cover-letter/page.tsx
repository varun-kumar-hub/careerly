"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { createClient } from "@/utils/supabase/client";
import { generateCoverLetter } from "@/features/cover-letter/coverLetterService";
import { Wand2, Copy, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function CoverLetterPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [resumeSummary, setResumeSummary] = useState("");
    const [userName, setUserName] = useState("");
    const [isAIGenerated, setIsAIGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user resume summary on mount
    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch resume data (use limit(1) instead of single() to avoid errors)
                const { data: resumeData } = await supabase
                    .from("resume_analysis")
                    .select("extracted_text, extracted_skills, file_name")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1);

                if (resumeData && resumeData.length > 0) {
                    const resume = resumeData[0];
                    // Create a summary from extracted text (first 500 chars) or skills
                    const textSummary = resume.extracted_text?.substring(0, 500) || '';
                    const skillsSummary = resume.extracted_skills?.length > 0
                        ? `Skills: ${resume.extracted_skills.join(", ")}`
                        : '';
                    setResumeSummary(textSummary || skillsSummary || 'Resume on file');
                }

                // Fetch user profile for name
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (profile?.full_name) {
                    setUserName(profile.full_name);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleGenerate = async () => {
        if (!jobDescription) return;
        setLoading(true);
        setError(null);
        try {
            const result = await generateCoverLetter(jobDescription, resumeSummary, userName);
            if (result.success) {
                setGeneratedLetter(result.letter);
                setIsAIGenerated(result.isAI);
                if (result.error) {
                    setError(result.error);
                }
            } else {
                setError(result.error || "Failed to generate cover letter");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        // Use a toast or notification instead of alert in production
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <BackButton fallbackUrl="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Wand2 className="h-8 w-8 text-purple-500" />
                            AI Cover Letter
                        </h1>
                        <p className="text-gray-400">Generate a tailored cover letter in seconds using Gemini AI.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Job Description
                            </label>
                            <textarea
                                className="w-full h-64 bg-white border border-gray-300 rounded-lg p-4 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                                placeholder="Paste the job requirements here... (minimum 50 characters)"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    {resumeSummary ? (
                                        <span className="text-green-400">✓ Resume Loaded</span>
                                    ) : (
                                        <span className="text-yellow-400">No Resume Found</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading || !jobDescription || jobDescription.length < 50}
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
                                {jobDescription.length}/50 minimum characters
                            </p>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Your Cover Letter
                                </label>
                                {generatedLetter && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${isAIGenerated
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                        {isAIGenerated ? "✨ AI Generated" : "📝 Template"}
                                    </span>
                                )}
                            </div>

                            {error && (
                                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {generatedLetter ? (
                                <>
                                    <textarea
                                        className="w-full flex-grow bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-800 font-serif leading-relaxed text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[300px]"
                                        value={generatedLetter}
                                        onChange={(e) => setGeneratedLetter(e.target.value)}
                                    />
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCopy}
                                            className="border-gray-700 hover:bg-gray-800 text-gray-300"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Text
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white min-h-[300px]">
                                    <Sparkles className="h-12 w-12 mb-4 opacity-20 text-purple-500" />
                                    <p className="text-sm">AI-generated letter will appear here</p>
                                    <p className="text-xs text-gray-400 mt-2">Powered by Gemini 2.5 Flash</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
