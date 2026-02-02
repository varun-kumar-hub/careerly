"use client";

import { useState, useEffect } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { createClient } from "@/utils/supabase/client";
import { generateCoverLetter } from "@/features/cover-letter/coverLetterService";
import { Wand2 } from "lucide-react";
import { CoverLetterForm, CoverLetterOutput } from "@/features/cover-letter/components";

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
                        <CoverLetterForm
                            jobDescription={jobDescription}
                            onJobDescriptionChange={setJobDescription}
                            onGenerate={handleGenerate}
                            loading={loading}
                            hasResume={!!resumeSummary}
                        />
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <CoverLetterOutput
                            letter={generatedLetter}
                            onLetterChange={setGeneratedLetter}
                            isAI={isAIGenerated}
                            error={error}
                            onCopy={handleCopy}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
