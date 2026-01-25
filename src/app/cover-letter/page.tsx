"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { createClient } from "@/utils/supabase/client";
import { generateCoverLetter } from "@/features/cover-letter/coverLetterService";
import { Wand2, Copy, FileText, Loader2 } from "lucide-react";

export default function CoverLetterPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [resumeSummary, setResumeSummary] = useState("");

    // Fetch user resume summary on mount
    useEffect(() => {
        const fetchResume = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("resume_analysis")
                    .select("summary, extracted_skills")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setResumeSummary(data.summary || `Skills: ${data.extracted_skills?.join(", ")}`);
                }
            }
        };
        fetchResume();
    }, []);

    const handleGenerate = async () => {
        if (!jobDescription) return;
        setLoading(true);
        try {
            const letter = await generateCoverLetter(jobDescription, resumeSummary);
            setGeneratedLetter(letter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate cover letter.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        alert("Copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <BackButton fallbackUrl="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Wand2 className="h-8 w-8 text-purple-500" />
                            AI Cover Letter
                        </h1>
                        <p className="text-gray-400">Generate a tailored cover letter in seconds.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Job Description
                            </label>
                            <textarea
                                className="w-full h-64 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none"
                                placeholder="Paste the job requirements here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    {resumeSummary ? "Resume Loaded" : "No Resume Found"}
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !jobDescription}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full flex flex-col">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Your Cover Letter
                            </label>
                            {generatedLetter ? (
                                <>
                                    <textarea
                                        className="w-full flex-grow bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-800 font-serif leading-relaxed text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        value={generatedLetter}
                                        onChange={(e) => setGeneratedLetter(e.target.value)}
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="outline" onClick={handleCopy} className="border-gray-700 hover:bg-gray-800 text-gray-300">
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Text
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-lg bg-gray-950/50">
                                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-sm">Generated letter will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
