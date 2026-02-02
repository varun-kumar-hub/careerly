"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { tailorResumeForJob } from "@/features/resume-ai/actions";
import { Target } from "lucide-react";
import { JobDescriptionInput } from "@/components/ui/JobDescriptionInput";
import { TailoringResults, TailoringTips } from "@/features/resume-ai/components";

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
                        <JobDescriptionInput
                            jobDescription={jobDescription}
                            onJobDescriptionChange={setJobDescription}
                            onGenerate={handleTailor}
                            loading={loading}
                            placeholder="Paste the job description you want to apply for...

Include:
• Job title and responsibilities
• Required skills and qualifications
• Company information
• Any specific requirements"
                            buttonText="Generate Suggestions"
                            buttonColor="bg-blue-600 hover:bg-blue-700"
                        />
                        <TailoringTips />
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <TailoringResults suggestions={suggestions} error={error} />
                    </div>
                </div>
            </div>
        </div>
    );
}
